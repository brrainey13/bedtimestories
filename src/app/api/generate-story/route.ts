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

    // 2. Parse Request Body (expected from PresetGenerator)
    const body = await req.json();
    const {
      // messages, // Removed: No longer expecting 'messages' for chat
      data // Custom data payload (includes presets, userId for verification, source)
    } = body;

    const clientUserId = data?.userId;
    const source = data?.source; // Should be 'preset'

    // Verify the user ID sent by the client matches the authenticated user
    if (!clientUserId || clientUserId !== user.id) {
         return NextResponse.json({ error: 'User ID mismatch or missing' }, { status: 403 });
    }

    // Ensure it's a preset request (though now it's the only type)
    if (source !== 'preset' || !data?.theme || !data?.character || !data?.setting || !data?.storyLength) {
      console.error("API: Invalid or missing preset data", data);
      return NextResponse.json({ error: 'Invalid or missing preset data' }, { status: 400 });
    }

    // 3. Prepare Messages for AI (Preset Mode Only)
    console.log('API: Generating story from presets for user:', user.id);
    const userPrompt = `Write a children's bedtime story with the following elements:
        - Theme: ${data.theme}
        - Main Character: ${data.character}
        - Setting: ${data.setting}
        - Desired Length: Approximately ${data.storyLength} reading time. Make it engaging and imaginative.`;

    const messagesForAI: CoreMessage[] = [
      { role: 'system', content: presetSystemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // 4. Stream Text Generation
    const result = streamText({
      model: openai('gpt-4o-mini'), // Or your preferred model
      messages: messagesForAI,
       onError: (err) => {
            console.error("AI Streaming Error:", err);
       },
    });

    // 5. Return AI Stream Response
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("API Route /generate-story Error:", error);
    const errorMessage = error.message || "An unexpected error occurred during story generation.";
    const status = error.status || 500;
     return NextResponse.json({ error: errorMessage }, { status: status });
  }
}