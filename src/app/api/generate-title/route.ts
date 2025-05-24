// src/app/api/generate-title/route.ts
import { openai } from '@ai-sdk/openai';
import { CoreMessage, streamText } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30; // Max duration for the Vercel function

// System prompt specifically for title generation
const titleSystemPrompt = `You are a creative assistant. Generate ONLY a short, catchy, and imaginative title for a children's bedtime story based on the user's request. Do NOT include any conversational introductory phrases like "Sure, here's a title..." or "Okay, here it is...". Directly output the title itself. The title should be suitable for a children's story.`;

export async function POST(req: Request) {
  try {
    // 1. Authentication Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Request Body
    // Expecting { prompt: "user_prompt_string_for_title", data: { userId, source, ...other_details } }
    const body = await req.json();
    const {
      prompt: userPromptFromClient, // This will be the prompt for generating a title
      data: customData // This is the 'payload' object, e.g., from PresetGenerator
    } = body;

    // Validate essential parts of the customData
    if (!customData?.userId || customData.userId !== user.id) {
         return NextResponse.json({ error: 'User ID mismatch or missing in custom data' }, { status: 403 });
    }
    // Assuming 'preset' or a similar source might be used for titles too
    if (customData?.source !== 'preset') { // Adjust if titles have a different source
      console.warn("API (generate-title): Potentially unexpected source in custom data", customData);
      // Depending on requirements, you might want to return an error or allow other sources
      // return NextResponse.json({ error: 'Invalid source in custom data for title generation' }, { status: 400 });
    }
    if (!userPromptFromClient || typeof userPromptFromClient !== 'string') {
        console.error("API (generate-title): Title prompt string is missing or invalid", userPromptFromClient);
        return NextResponse.json({ error: 'Title prompt string is missing or invalid' }, { status: 400 });
    }

    // 3. Log the incoming request details
    console.log(`API: Generating title for user: ${user.id}`);
    console.log(`API: Received title prompt: "${userPromptFromClient.substring(0, 100)}..."`);
    console.log("API: Received custom data for title:", customData);

    // 4. Prepare Messages for AI using the prompt from the client
    const messagesForAI: CoreMessage[] = [
      { role: 'system', content: titleSystemPrompt },
      { role: 'user', content: userPromptFromClient }, // Use the title prompt directly from the client
    ];

    // 5. Stream Text Generation for Title
    const result = streamText({
      model: openai('gpt-4.1-nano'), // Using gpt-4.1-nano as requested
      messages: messagesForAI,
       onFinish: (data) => {
            console.log("AI Title Generation Finished:", data);
       },
       onError: (err) => {
            console.error("AI Title Streaming Error:", err);
       },
    });

    // 6. Return AI Stream Response
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("API Route /generate-title Error:", error);
    const errorMessage = error.message || "An unexpected error occurred during title generation.";
    const status = error.status || 500;
     return NextResponse.json({ error: errorMessage }, { status: status });
  }
}
