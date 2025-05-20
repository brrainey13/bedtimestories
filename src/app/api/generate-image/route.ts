// src/app/api/generate-image/route.ts
import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage, NoImageGeneratedError } from 'ai'; // Use the Vercel AI SDK
import { createClient } from '@/utils/supabase/server';
import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

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
        userId
    } = body;

    // Validate Input
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    if (!userId || userId !== user.id) {
        return NextResponse.json({ error: 'User ID mismatch or missing' }, { status: 403 });
    }
    console.log(`API: Image request for user ${user.id} using gpt-image-1. Prompt: "${prompt.substring(0, 50)}..."`);


    // 3. Generate Image using Vercel AI SDK with gpt-image-1
    let imageBuffer: Buffer | null = null;
    try {
        console.log(`Generating image via AI SDK with gpt-image-1...`);

        const { image, warnings } = await generateImage({
            model: openai.image('gpt-image-1'), // Explicitly gpt-image-1
            prompt: prompt,
            n: 1,
            size: '1024x1024', // Valid for gpt-image-1
            providerOptions: {
                openai: {
                    quality: 'medium', // Valid for gpt-image-1
                    // 'response_format' is intentionally omitted.
                    // Add other gpt-image-1 specific parameters here if needed:
                    // e.g., output_format: "png", background: "auto"
                }
            }
        });

        if (warnings) {
            console.warn("Image generation warnings:", warnings);
        }

        // gpt-image-1 always returns b64_json, SDK should populate image.base64.
        if (image?.base64) {
            console.log("Image data received as Base64 string.");
            imageBuffer = Buffer.from(image.base64, 'base64');
        } else {
            // This case should be rare if the API call succeeds with gpt-image-1
            console.warn("Image data (base64) not found in SDK response for gpt-image-1.");
            throw new Error("AI service did not return expected base64 image data.");
        }

    } catch (imgError: any) {
        console.error("Error during AI SDK image generation with gpt-image-1:", imgError);
         if (NoImageGeneratedError.isInstance(imgError)) {
            console.error("AI_NoImageGeneratedError Details - Cause:", imgError.cause, "Responses:", imgError.responses);
            return NextResponse.json({ error: `AI failed to generate image: ${imgError.message}`, responses: imgError.responses }, { status: 502 });
         }
         const errorDetails = imgError.data?.error || imgError.cause || imgError;
         const errorMessage = typeof errorDetails === 'string' ? errorDetails : (errorDetails?.message || 'Image generation failed');
         const status = imgError.status || imgError.statusCode || 500;

         return NextResponse.json({ error: errorMessage, details: errorDetails }, { status });
    }

    // 4. Upload Image to Supabase Storage
    let finalImageUrl: string | null = null;
    if (imageBuffer) {
        try {
            // Default output for gpt-image-1 (unless 'output_format' in providerOptions changes it) is PNG.
            const fileName = `${randomUUID()}.png`;
            const filePath = `${user.id}/${fileName}`;
            const bucketName = 'story-generations';

            console.log(`Uploading image to Supabase Storage: ${bucketName}/${filePath}`);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, imageBuffer, {
                    contentType: 'image/png', // Match default output or specified output_format
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(`Storage upload failed: ${uploadError.message}`);
            }

            console.log("Image uploaded successfully:", uploadData.path);
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

    // 5. Return Response
    if (finalImageUrl) {
        return NextResponse.json({ imageUrl: finalImageUrl });
    } else {
        // This would imply imageBuffer was null after a successful API call, which is handled above.
        return NextResponse.json({ error: "Image data was not processed correctly after generation." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("API Route /generate-image General Error:", error);
    const errorMessage = error.message || "An unexpected error occurred.";
    const status = error.status || 500;
    return NextResponse.json({ error: errorMessage }, { status: status });
  }
}