// src/app/api/generate-story/route.ts
import { openai } from '@ai-sdk/openai';
import { CoreMessage, streamText } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// System prompt specifically for preset generation
const presetSystemPrompt = `You are a children's storyteller. Generate ONLY the story text based on the user's request. Do NOT include any conversational introductory phrases like "Sure, here's a story..." or "Okay, let's begin...". Directly start with the story content itself. Be engaging, imaginative, and ensure a clear narrative arc (beginning, middle, end) appropriate for bedtime. Adhere to the requested theme, character, setting, and approximate length.`;

export async function POST(req: Request) {
  try {
    // 1. Authentication Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Request Body
    // Expecting { prompt: "user_prompt_string", data: { userId, source, ...other_details } }
    const body = await req.json();
    const {
      prompt: userPromptFromClient, // This is the userPrompt constructed in PresetGenerator
      data: customData // This is the 'payload' object from PresetGenerator
    } = body;

    // Validate essential parts of the customData
    if (!customData?.userId || customData.userId !== user.id) {
         return NextResponse.json({ error: 'User ID mismatch or missing in custom data' }, { status: 403 });
    }
    if (customData?.source !== 'preset') {
      console.error("API: Invalid source in custom data", customData);
      return NextResponse.json({ error: 'Invalid source in custom data' }, { status: 400 });
    }
    if (!userPromptFromClient || typeof userPromptFromClient !== 'string') {
        console.error("API: Prompt string is missing or invalid", userPromptFromClient);
        return NextResponse.json({ error: 'Prompt string is missing or invalid' }, { status: 400 });
    }

    // 3. Log the incoming request details (optional but good for debugging)
    console.log(`API: Generating story from preset for user: ${user.id}`);
    console.log(`API: Received prompt: "${userPromptFromClient.substring(0, 100)}..."`);
    console.log("API: Received custom data:", customData);


    // 4. Prepare Messages for AI using the prompt from the client
    const messagesForAI: CoreMessage[] = [
      { role: 'system', content: presetSystemPrompt },
      { role: 'user', content: userPromptFromClient }, // Use the prompt directly from the client
    ];

    // 5. Stream Text Generation
    const result = streamText({
      model: openai('gpt-4.1-mini'), // Using gpt-4.1-mini (as of 2025-05-19)
      messages: messagesForAI,
       onError: (err) => {
            console.error("AI Streaming Error:", err);
       },
    });

    // 6. Return AI Stream Response
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("API Route /generate-story Error:", error);
    const errorMessage = error.message || "An unexpected error occurred during story generation.";
    const status = error.status || 500;
     return NextResponse.json({ error: errorMessage }, { status: status });
  }
}