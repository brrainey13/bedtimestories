// src/app/api/stories/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const storyData = await req.json();

    // Basic validation (add more as needed)
    if (!storyData.content || !storyData.userId) {
         return NextResponse.json({ error: 'Missing required story data' }, { status: 400 });
    }

    // Ensure the userId matches the authenticated user
    if (storyData.userId !== user.id) {
        return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    console.log("API: Saving story text for user:", storyData.userId);

    // Add defaults or validate preset data if provided
    const dataToInsert = {
      user_id: storyData.userId,
      theme: storyData.theme || 'N/A',
      character: storyData.character || 'N/A',
      setting: storyData.setting || 'N/A',
      story_length: storyData.storyLength || 'N/A', // Match DB column name
      content: storyData.content,
      // image_url will be added later via PATCH
    };


    const { data: savedStory, error: saveError } = await supabase
      .from('stories') // Your table name
      .insert(dataToInsert)
      .select('id') // Select the ID to return it
      .single();

    if (saveError) {
      console.error("Supabase save error:", saveError.message);
      return NextResponse.json({ error: `Database error: ${saveError.message}` }, { status: 500 });
    }

    console.log("Story text saved successfully, ID:", savedStory.id);
    // Return the ID of the newly created story record
    return NextResponse.json({ storyId: savedStory.id }, { status: 201 });

  } catch (error: any) {
    console.error("API Route /stories POST Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to save story' }, { status: 500 });
  }
}