// src/app/api/generate-image/route.ts
import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage, NoImageGeneratedError } from 'ai';
import { createClient } from '@/utils/supabase/server'; // Use server client for auth check & storage
import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // Image generation can take time

export async function POST(req: Request) {
  try {
    // 1. Authentication Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Request Body
    const body = await req.json();
    const {
        prompt,
        userId // Client sends this for verification
    } = body;

    // Validate Input
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    if (!userId || userId !== user.id) {
        return NextResponse.json({ error: 'User ID mismatch or missing' }, { status: 403 });
    }
    console.log(`API: Image request for user ${user.id} with prompt: "${prompt.substring(0, 50)}..."`);


    // 3. Generate Image using AI SDK
    let imageBuffer: Buffer | null = null;
    try {
        console.log(`Generating image via AI SDK...`);
        // Use the SDK's generateImage function
        const { image, warnings } = await generateImage({
            model: openai.image('dall-e-3'), // Or 'dall-e-2'
            prompt: prompt,
            size: '1024x1024',
            n: 1,
        });

        if (warnings) {
            console.warn("Image generation warnings:", warnings);
        }

        // Access image data (prioritize uint8Array for Buffer)
        if (image?.uint8Array) {
            console.log("Image data received as Uint8Array.");
            imageBuffer = Buffer.from(image.uint8Array);
        } else if (image?.base64) {
            console.log("Image data received as Base64 string.");
            imageBuffer = Buffer.from(image.base64, 'base64');
        }

        if (!imageBuffer) {
            // This case might occur if the AI response is unexpected or empty
             console.warn("Image generation succeeded according to SDK, but no image data (uint8Array or base64) was found.");
             throw new Error("AI service returned success but no image data.");
        }

    } catch (imgError: any) {
        console.error("Error during AI image generation:", imgError);
         if (imgError instanceof NoImageGeneratedError || imgError.name === 'AI_NoImageGeneratedError') {
            console.error("AI_NoImageGeneratedError Details - Cause:", imgError.cause);
            return NextResponse.json({ error: `AI failed to generate image: ${imgError.message}` }, { status: 502 });
         }
        // General error during the AI generation process
         return NextResponse.json({ error: `Image generation failed: ${imgError.message}` }, { status: 500 });
    }

    // 4. Upload Image to Supabase Storage (Keeping this coupled for simplicity)
    let finalImageUrl: string | null = null;
    if (imageBuffer) {
        try {
            const fileName = `${randomUUID()}.png`;
            const filePath = `${user.id}/${fileName}`; // User-specific folders
            const bucketName = 'story-generations'; // Your bucket name

            console.log(`Uploading image to Supabase Storage: ${bucketName}/${filePath}`);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, imageBuffer, {
                    contentType: 'image/png',
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(`Storage upload failed: ${uploadError.message}`);
            }

            console.log("Image uploaded successfully:", uploadData.path);
            // Get public URL
            const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            if (!urlData?.publicUrl) {
                 throw new Error("Could not get public URL for uploaded image.");
            }
            finalImageUrl = urlData.publicUrl;
            console.log("Public Image URL:", finalImageUrl);

        } catch (uploadError: any) {
             console.error("Error during image upload or URL retrieval:", uploadError);
             return NextResponse.json({ error: `Image processing failed after generation: ${uploadError.message}` }, { status: 500 });
        }
    }

    // 5. Return Response (Image URL Only)
    // The client will use this URL and the storyId (obtained previously)
    // to call the PATCH /api/stories/[storyId] route.
    if (finalImageUrl) {
        return NextResponse.json({ imageUrl: finalImageUrl });
    } else {
        // Should ideally be caught above, but as a fallback
        return NextResponse.json({ error: "Image generated but could not be stored or URL retrieved." }, { status: 500 });
    }

  } catch (error: any) {
    // Catch errors from req.json() or other top-level issues
    console.error("API Route /generate-image General Error:", error);
    const errorMessage = error.message || "An unexpected error occurred.";
    const status = error.status || 500;
    return NextResponse.json({ error: errorMessage }, { status: status });
  }
}