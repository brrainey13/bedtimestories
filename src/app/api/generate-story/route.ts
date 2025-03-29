// src/app/api/generate-story/route.ts
import { openai } from '@ai-sdk/openai';
import { CoreMessage, streamText } from 'ai'; // No DataStream needed here
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 30;
const CHAT_GENERATED_PLACEHOLDER = 'chat-request';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages, // Standard from useChat (for chat mode)
      data       // Custom data payload (includes presets, userId)
    } = body;

    const userId = data?.userId;
    const source = data?.source;

    if (!userId) {
      // Throw error to be caught and returned as JSON
      throw new Error('User ID is required in data payload');
    }

    let initialMessages: CoreMessage[] = [];
    let presetDataForDB = { theme: '', character: '', setting: '', storyLength: '' };
    let isPresetMode = false;

    if (source === 'preset' && data?.theme && data?.character && data?.setting && data?.storyLength) {
      isPresetMode = true;
      console.log('API: Generating story from presets received');
      presetDataForDB = {
        theme: data.theme,
        character: data.character,
        setting: data.setting,
        storyLength: data.storyLength
      };
      const userPrompt = `Write a children's bedtime story with the following elements:
        - Theme: ${presetDataForDB.theme}
        - Main Character: ${presetDataForDB.character}
        - Setting: ${presetDataForDB.setting}
        - Desired Length: Approximately ${presetDataForDB.storyLength} reading time. Make it engaging and imaginative.`;

      initialMessages = [
        {
          role: 'system',
          content: `You are a children's storyteller. Generate ONLY the story text based on the user's request. Do NOT include any conversational introductory phrases like "Sure, here's a story..." or "Okay, let's begin...". Directly start with the story content itself. Be engaging, imaginative, and ensure a clear narrative arc (beginning, middle, end) appropriate for bedtime. Adhere to the requested theme, character, setting, and approximate length.`,
        },
        { role: 'user', content: userPrompt }, // Send constructed prompt as user message
      ];
    } else { // Chat mode
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new Error('Messages are required for chat mode');
      }
       console.log('API: Generating story from chat messages');
       const systemPrompt: CoreMessage = { role: 'system', content: 'You are a helpful storytelling assistant.' };
       // Directly assert the incoming messages type. useChat should send compatible messages.
       const chatMessages = messages as CoreMessage[];
       initialMessages = [systemPrompt, ...chatMessages];
       presetDataForDB = { // Placeholders for DB
          theme: CHAT_GENERATED_PLACEHOLDER,
          character: CHAT_GENERATED_PLACEHOLDER,
          setting: CHAT_GENERATED_PLACEHOLDER,
          storyLength: CHAT_GENERATED_PLACEHOLDER
       }
    }

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: initialMessages,
      async onFinish({ text, usage, finishReason }) {
        console.log(`Story text generation finished with reason: ${finishReason}.`);
        // Only save if the generation was successful
        if (finishReason === 'stop' || finishReason === 'length' || finishReason === 'tool-calls') {
            const supabase = await createClient();
            console.log("Saving story text to database...");
            try {
              const storyData = {
                user_id: userId,
                theme: presetDataForDB.theme,
                character: presetDataForDB.character,
                setting: presetDataForDB.setting,
                story_length: presetDataForDB.storyLength, // Ensure column name matches DB
                content: text,
                // image_url is handled separately
              };

              const { data: savedStory, error: saveError } = await supabase
                .from('stories') // Your table name
                .insert(storyData)
                .select('id')
                .single();

              if (saveError) {
                // Log error but don't interrupt the main flow typically
                console.error("Error saving story text to Supabase:", saveError.message);
              } else {
                console.log(`Story text saved successfully (ID: ${savedStory?.id}) for user: ${userId}`);
                // Story ID is saved, but not sent back in this version
              }
            } catch (e: any) {
              console.error("Exception during story text save:", e.message);
            }
        } else {
             console.log(`Not saving story due to finish reason: ${finishReason}`);
        }
      },
      onError: (err) => {
           console.error("Streaming Error:", err);
           // Error is logged, but the stream might still finish or contain an error part handled by the client
      },
      // No experimental_streamData: true needed
    });

    // Return the standard Vercel AI SDK Data Stream response
    return result.toDataStreamResponse();

  } catch (error: any) {
    // Catch top-level errors (e.g., JSON parsing, missing userId)
    console.error("API Route /generate-story Error:", error);
    const errorMessage = error.message || "An unexpected error occurred.";
    const status = error.status || 500;
     // Return a standard JSON error response
     return new Response(JSON.stringify({ error: errorMessage }), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
     });
  }
}