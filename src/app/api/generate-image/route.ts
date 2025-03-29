// src/app/api/generate-image/route.ts
import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage, NoImageGeneratedError } from 'ai';
import { createClient } from '@/utils/supabase/server'; // Use the server client
import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // Image generation can take time

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
        prompt,
        userId,
        // storyId // Optional: Pass storyId if you want to update the record
    } = body;

    // 1. Validate Input
    if (!prompt || !userId) {
      return NextResponse.json({ error: 'Prompt and User ID are required' }, { status: 400 });
    }
    console.log(`Received image generation request for user ${userId} with prompt: "${prompt.substring(0, 50)}..."`);

    // 2. Generate Image
    let finalImageUrl: string | null = null;
    const supabase = await createClient(); // Use the server client here

    try {
        console.log(`Generating image with prompt: "${prompt.substring(0, 100)}..."`);

        // Call generateImage - remove explicit responseFormat, let the SDK default handle it
        // The docs show accessing .base64 and .uint8Array without setting responseFormat
        const { image, warnings } = await generateImage({
            model: openai.image('dall-e-3'), // Or 'dall-e-2'
            prompt: prompt,
            size: '1024x1024',
            n: 1,
            // responseFormat: 'b64_json', // REMOVED based on docs example accessing .base64/.uint8Array
        });

        if (warnings) {
          console.warn("Image generation warnings:", warnings);
        }

        let imageBuffer: Buffer | null = null;

        // --- Access image data based on the documentation structure ---
        if (image && image.uint8Array) {
           console.log("Image data received via image.uint8Array. Converting to Buffer.");
           imageBuffer = Buffer.from(image.uint8Array);
        } else if (image && image.base64) {
           console.log("Image data received via image.base64. Converting to Buffer.");
           imageBuffer = Buffer.from(image.base64, 'base64');
        }
        // --- End of data access logic ---

        if (imageBuffer) {
            const fileName = `${randomUUID()}.png`;
            const filePath = `${userId}/${fileName}`; // User-specific folders
            const bucketName = 'story-generations'; // Your bucket name

            console.log(`Uploading image to Supabase Storage: ${bucketName}/${filePath}`);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, imageBuffer, {
                    contentType: 'image/png',
                    upsert: false, // Don't overwrite existing files with the same random name
                });

            if (uploadError) {
                console.error("Supabase Storage upload error:", uploadError.message);
                // Optionally: return a specific error about storage failure
                // return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });
            } else {
                console.log("Image uploaded successfully:", uploadData.path);
                // Get public URL (ensure bucket policy allows public reads or use signed URLs)
                const { data: urlData } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(filePath);

                if (urlData?.publicUrl) {
                    finalImageUrl = urlData.publicUrl;
                    console.log("Public Image URL:", finalImageUrl);

                    // Optional: Update the story record if storyId was passed
                    // ... (update logic remains the same)

                } else {
                    console.error("Could not get public URL for uploaded image.");
                    // Optionally: return error if URL is crucial
                    // return NextResponse.json({ error: "Could not get public URL for image." }, { status: 500 });
                }
            }
        } else {
             // This log message should now reflect the actual properties checked
             console.warn("Image generation call completed, but did not return usable data in image.uint8Array or image.base64 property.");
             // Return an error because image generation seemingly failed to produce data
             return NextResponse.json({ error: "Image generation failed to produce data." }, { status: 500 });
        }

    } catch (imgError: any) {
        console.error("Error during image generation or upload process:", imgError);
        // Check if it's the specific AI_NoImageGeneratedError from the SDK
         if (imgError instanceof NoImageGeneratedError || imgError.name === 'AI_NoImageGeneratedError') {
            console.error("AI_NoImageGeneratedError Details - Cause:", imgError.cause);
            console.error("AI_NoImageGeneratedError Details - Responses:", imgError.responses);
            return NextResponse.json({ error: `AI failed to generate image: ${imgError.message}` }, { status: 502 }); // Bad Gateway might be appropriate
         }
        // General error during the process
         return NextResponse.json({ error: `Image processing failed: ${imgError.message}` }, { status: 500 });
    }

    // 3. Return Response
    if (finalImageUrl) {
        return NextResponse.json({ imageUrl: finalImageUrl });
    } else {
        // This path is reached if upload failed but wasn't returned as error, or URL failed
        return NextResponse.json({ error: "Image processed but could not retrieve final URL." }, { status: 500 });
    }

  } catch (error: any) {
    // Catch errors from req.json() or other top-level issues
    console.error("API Route /generate-image General Error:", error);
    const errorMessage = error.message || "An unexpected error occurred.";
    const status = error.status || 500;
    return NextResponse.json({ error: errorMessage }, { status: status });
  }
}