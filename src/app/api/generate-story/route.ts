// src/app/api/generate-story/route.ts
import { openai } from '@ai-sdk/openai';
import { CoreMessage, streamText } from 'ai';
import { createClient } from '@/utils/supabase/server'; // Still needed for auth check
import { NextResponse } from 'next/server'; // For error responses

export const maxDuration = 30;

// System prompt helper
const getSystemPrompt = (source: string | undefined): string => {
    if (source === 'preset') {
        return `You are a children's storyteller. Generate ONLY the story text based on the user's request. Do NOT include any conversational introductory phrases like "Sure, here's a story..." or "Okay, let's begin...". Directly start with the story content itself. Be engaging, imaginative, and ensure a clear narrative arc (beginning, middle, end) appropriate for bedtime. Adhere to the requested theme, character, setting, and approximate length.`;
    }
    // Default for chat
    return 'You are a helpful and creative storytelling assistant. Engage with the user to collaboratively write children\'s stories.';
}

export async function POST(req: Request) {
  try {
    // 1. Authentication Check (using server client is fine here)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // We still need the user ID from the *authenticated* session for validation,
    // even if the client sends it in the payload.
    if (!user) {
      // Use NextResponse for standard JSON error
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Request Body
    const body = await req.json();
    const {
      messages, // Standard from useChat (for chat mode)
      data       // Custom data payload (includes presets, userId for *verification*, source)
    } = body;

    const clientUserId = data?.userId; // User ID sent by the client
    const source = data?.source;       // 'preset' or 'chat' (or undefined)

    // Verify the user ID sent by the client matches the authenticated user
    if (!clientUserId || clientUserId !== user.id) {
         return NextResponse.json({ error: 'User ID mismatch or missing' }, { status: 403 });
    }

    // 3. Prepare Messages for AI
    let messagesForAI: CoreMessage[] = [];
    const systemPrompt = getSystemPrompt(source);

    if (source === 'preset' && data?.theme && data?.character && data?.setting && data?.storyLength) {
      console.log('API: Generating story from presets');
      const userPrompt = `Write a children's bedtime story with the following elements:
        - Theme: ${data.theme}
        - Main Character: ${data.character}
        - Setting: ${data.setting}
        - Desired Length: Approximately ${data.storyLength} reading time. Make it engaging and imaginative.`;

      messagesForAI = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];
    } else { // Chat mode
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: 'Messages are required for chat mode' }, { status: 400 });
      }
       console.log('API: Generating story from chat messages');
       // Ensure incoming messages conform to CoreMessage structure if needed
       const chatMessages = messages as CoreMessage[];
       messagesForAI = [{ role: 'system', content: systemPrompt }, ...chatMessages];
    }

    // 4. Stream Text Generation (AI Interaction Only)
    const result = streamText({
      model: openai('gpt-4o-mini'), // Or your preferred model
      messages: messagesForAI,
       // REMOVED onFinish - Saving happens client-side now
       onError: (err) => {
            console.error("AI Streaming Error:", err);
            // Error is logged; client-side useChat hook also handles errors.
       },
    });

    // 5. Return AI Stream Response
    // This directly returns the stream to the client (useChat hook)
    return result.toDataStreamResponse();

  } catch (error: any) {
    // Catch top-level errors (e.g., JSON parsing)
    console.error("API Route /generate-story Error:", error);
    const errorMessage = error.message || "An unexpected error occurred during story generation.";
    const status = error.status || 500;
     // Return a standard JSON error response
     return NextResponse.json({ error: errorMessage }, { status: status });
  }
}