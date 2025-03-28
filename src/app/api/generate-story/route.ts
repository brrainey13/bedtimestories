// src/app/api/generate-story/route.ts

import { openai } from '@ai-sdk/openai';
import { CoreMessage, streamText, experimental_generateImage as generateImage } from 'ai';
import { createClient } from '@/utils/supabase/server'; // Use server client for DB/Storage ops
import { Buffer } from 'node:buffer'; // Need Buffer for handling base64
import { randomUUID } from 'node:crypto'; // For generating unique filenames

// Optional: Set max duration for Vercel Functions
export const maxDuration = 60; // Increased duration for image gen + text

// Define placeholder constants for chat-based saves
const CHAT_GENERATED_PLACEHOLDER = 'chat-request';

export async function POST(req: Request) {
  let storyIdToSave: string | null = null; // Hold story ID if text save succeeds but image fails later

  try {
    const body = await req.json();
    const {
      messages, // For chat mode
      theme,     // For preset mode
      character, // For preset mode
      setting,   // For preset mode
      storyLength,// For preset mode
      userId,    // Required for both modes
      source     // 'preset' or implicitly 'chat'
    } = body;

    // 1. Validate User ID
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    let initialMessages: CoreMessage[] = [];
    const isPresetMode = source === 'preset';
    let imagePromptText = '';

    // 2. Prepare Messages for AI SDK & Image Prompt
    if (isPresetMode) {
      if (!theme || !character || !setting || !storyLength) {
        return new Response(JSON.stringify({ error: 'Missing preset parameters' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const userPrompt = `Write a story with the following elements:
        - Theme: ${theme}
        - Main Character: ${character}
        - Setting: ${setting}
        - Desired Length: Approximately ${storyLength} reading time.`;

      initialMessages = [
        {
          role: 'system',
          content: `You are a masterful storyteller for children. Create a captivating and age-appropriate short story based on the user's selections. The story should be engaging, imaginative, and have a clear narrative arc (beginning, middle, end). Avoid overly complex vocabulary or themes. Ensure the story feels complete within the approximate length specified.`,
        },
        { role: 'user', content: userPrompt },
      ];
      // Use preset details for image prompt
      imagePromptText = `Children's storybook illustration style: ${character} in a ${setting} setting, related to the theme of ${theme}. Simple, colorful, and whimsical.`;

    } else {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'Messages are required for chat mode' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      initialMessages = messages as CoreMessage[];
      // Attempt to use the last user message content for the image prompt
      const lastUserMessage = initialMessages.filter(m => m.role === 'user').pop();
      const lastUserContent = lastUserMessage?.content;
      if (typeof lastUserContent === 'string') {
          imagePromptText = `Children's storybook illustration style, depicting the main elements or feeling of: ${lastUserContent.substring(0, 200)}. Simple, colorful, whimsical.`; // Limit length
      } else {
          // Fallback if last message isn't simple text
          imagePromptText = "A whimsical children's storybook illustration.";
      }
    }

    // 3. Call AI SDK streamText function
    const result = streamText({
      model: openai('gpt-4o-mini'), // Use a capable model
      messages: initialMessages,
      async onFinish({ text, usage, finishReason }) {
        console.log("Story text generation finished.");

        let finalImageUrl: string | null = null;
        const supabase = await createClient(); // Get Supabase server client instance

        // --- Attempt Image Generation ---
        if (imagePromptText) {
          console.log(`Attempting image generation with prompt: "${imagePromptText.substring(0,100)}..."`);
          try {
            const { image } = await generateImage({
              model: openai.image('dall-e-3'), // Or 'dall-e-2'
              prompt: imagePromptText,
              size: '1024x1024', // DALL-E 3 supports '1024x1024', '1792x1024', or '1024x1792'
              n: 1
            });

            if (image instanceof Buffer || typeof image === 'string') { // Check if we got Buffer or base64 string
                 let imageBuffer: Buffer;
                 if (typeof image === 'string') {
                     imageBuffer = Buffer.from(image, 'base64');
                 } else {
                     imageBuffer = image;
                 }

                 const fileName = `${randomUUID()}.png`;
                 const filePath = `${userId}/${fileName}`; // Store images in user-specific folders
                 const bucketName = 'story-generations'; // Your bucket name

                 console.log(`Uploading image to Supabase Storage: ${bucketName}/${filePath}`);

                 const { data: uploadData, error: uploadError } = await supabase.storage
                   .from(bucketName)
                   .upload(filePath, imageBuffer, {
                     contentType: 'image/png',
                     upsert: false, // Avoid overwriting unintentionally
                   });

                 if (uploadError) {
                   console.error("Supabase Storage upload error:", uploadError.message);
                   // Proceed without image URL
                 } else {
                   console.log("Image uploaded successfully:", uploadData.path);
                   // Get public URL
                   const { data: urlData } = supabase.storage
                     .from(bucketName)
                     .getPublicUrl(filePath);

                   if (urlData?.publicUrl) {
                     finalImageUrl = urlData.publicUrl;
                     console.log("Public Image URL:", finalImageUrl);
                   } else {
                     console.error("Could not get public URL for uploaded image.");
                   }
                 }
            } else {
                 console.warn("Image generation did not return usable data (Buffer or base64 string).");
            }

          } catch (imgError: any) {
            console.error("Image generation/upload failed:", imgError.message);
            // Proceed to save story without image URL
          }
        } else {
             console.warn("Image prompt was empty, skipping image generation.");
        }

        // --- Save Story to Supabase (always happens, with or without image) ---
        console.log("Saving story text to database...");
        try {
          const storyData = {
            user_id: userId,
            theme: isPresetMode ? theme : CHAT_GENERATED_PLACEHOLDER,
            character: isPresetMode ? character : CHAT_GENERATED_PLACEHOLDER,
            setting: isPresetMode ? setting : CHAT_GENERATED_PLACEHOLDER,
            story_length: isPresetMode ? storyLength : CHAT_GENERATED_PLACEHOLDER,
            content: text,
            image_url: finalImageUrl, // Use null if image gen/upload failed
          };

          const { data: savedStory, error: saveError } = await supabase
            .from('stories')
            .insert(storyData)
            .select('id') // Optionally select the ID back
            .single(); // Assuming you only insert one

          if (saveError) {
            console.error("Error saving story text to Supabase:", saveError.message);
          } else {
            storyIdToSave = savedStory?.id; // Store ID in case we need it
            console.log(`Story text saved successfully (ID: ${storyIdToSave}) for user: ${userId}`);
          }
        } catch (e: any) {
          console.error("Exception during story text save:", e.message);
        }
      },
      // Optional: Add onError for stream-specific errors if needed
      onError: (err) => { console.error("Streaming Error:", err); },
    });

    // 5. Return the text streaming response (image handling happens *after* text stream finishes)
    return result.toDataStreamResponse();

  } catch (error: any) {
    // Handle general errors (e.g., JSON parsing, initial setup)
    console.error("API Route Error:", error);
    const errorMessage = error.message || "An unexpected error occurred.";
    const status = error.status || 500;
    // Ensure proper JSON response for errors
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}