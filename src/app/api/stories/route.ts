// src/app/api/stories/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storyData = await request.json();

    // Basic validation
    if (!storyData.userId || !storyData.content || !storyData.title) {
      return NextResponse.json({ error: 'Missing required story data: userId, content, and title are required.' }, { status: 400 });
    }

    if (storyData.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: User ID mismatch' }, { status: 403 });
    }

    const dataToInsert = {
      user_id: storyData.userId,
      title: storyData.title,
      content: storyData.content,
      character: storyData.character, // Now directly contains preset ID or custom text
      hero_name: storyData.heroName, 
      setting: storyData.setting, // Now directly contains preset ID or custom text
      story_length: storyData.storyLength,
      moral: storyData.moral, // Now directly contains preset ID or custom text
      theme: storyData.theme || 'N/A',
      custom_hero_description: storyData.customHeroDescription,
      custom_setting_description: storyData.customSettingDescription,
      custom_moral_description: storyData.customMoralDescription,
      prompt_hero_label: storyData.promptHeroLabel,
      prompt_setting_label: storyData.promptSettingLabel,
      prompt_moral_label: storyData.promptMoralLabel,
    };

    const { data: savedStory, error: saveError } = await supabase
      .from('stories')
      .insert([dataToInsert])
      .select('id')
      .single();

    if (saveError) {
      console.error('Supabase insert error:', saveError);
      return NextResponse.json({ error: `Database error: ${saveError.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: 'Story saved successfully', storyId: savedStory.id }, { status: 201 });

  } catch (err: any) {
    console.error('API /stories POST error:', err);
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}