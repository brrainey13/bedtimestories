// src/app/api/stories/[storyId]/route.ts

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
    req: Request,
    context: { params: Promise<{ storyId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { storyId } = await context.params;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Valid image URL is required' }, { status: 400 });
    }

    console.log(`API: Updating story ${storyId} with image URL for user ${user.id}`);

    const { data: existingStory, error: fetchError } = await supabase
        .from('stories')
        .select('user_id')
        .eq('id', storyId)
        .single();

    if (fetchError || !existingStory) {
        console.error("Error fetching story or story not found:", fetchError?.message);
        return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    if (existingStory.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden: You do not own this story' }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from('stories')
      .update({ image_url: imageUrl })
      .eq('id', storyId);

    if (updateError) {
      console.error("Supabase update error:", updateError.message);
      return NextResponse.json({ error: `Database error: ${updateError.message}` }, { status: 500 });
    }

    console.log("Story image URL updated successfully for story:", storyId);
    return NextResponse.json({ success: true, storyId: storyId, imageUrl: imageUrl });

  } catch (error: any) {
    console.error(`API Route /stories/${storyId} PATCH Error:`, error);
    // Ensure storyId is defined before logging if error happens before assignment
    const idForLog = typeof storyId === 'string' ? storyId : '[unknown]';
    console.error(`API Route /stories/${idForLog} PATCH Error:`, error);
    return NextResponse.json({ error: error.message || 'Failed to update story' }, { status: 500 });
  }
}