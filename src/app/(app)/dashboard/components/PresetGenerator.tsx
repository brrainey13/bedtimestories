// src/app/(app)/dashboard/components/PresetGenerator.tsx
'use client';

import React, { useState, FormEvent, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  characters,
  settings,
  storyLengths,
  morals,
  PresetOption
} from '@/config/presetOptions';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Wand2, Loader2, Image as ImageIcon, AlertTriangle, Sparkles } from 'lucide-react';
import NextImage from 'next/image';
import { useCompletion } from '@ai-sdk/react';

interface ImagePromptPresetData {
  heroLabel: string; // Can be preset label or custom hero text
  heroName: string;
  settingLabel: string; // Can be preset label or custom setting text
  moralLabel: string; // Can be preset label or custom moral text
}

export default function PresetGenerator() {
  const { session } = useAuth();

  const [selectedHero, setSelectedHero] = useState<string>(characters.find(c => c.id !== 'custom')?.id || '');
  const [heroName, setHeroName] = useState('');
  const [customHeroText, setCustomHeroText] = useState(''); 
  const [selectedSetting, setSelectedSetting] = useState<string>(settings.find(s => s.id !== 'custom')?.id || '');
  const [customSettingText, setCustomSettingText] = useState(''); 
  const [selectedLength, setSelectedLength] = useState<string>(storyLengths.find(l => l.id !== 'custom' && l.id === 'medium')?.id || storyLengths[0]?.id || '');
  const [selectedMoral, setSelectedMoral] = useState<string>(morals.find(m => m.id === 'friendship')?.id || morals[0]?.id || '');
  const [customMoralText, setCustomMoralText] = useState(''); 

  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null); 
  const [generatedTitle, setGeneratedTitle] = useState<string | null>(null); 

  // Simplified: Generate image and just set it in state. No DB linking here.
  const generateImageForDisplay = useCallback(async (presetData: ImagePromptPresetData) => {
    if (!session?.user?.id) return;
    // setIsLoadingImage(true) is set by the caller (handlePresetSubmit)

    const { heroLabel, heroName, settingLabel, moralLabel } = presetData;
    const imagePrompt = `Children's storybook illustration style. A whimsical and colorful scene featuring a ${heroLabel.toLowerCase()} named "${heroName.trim()}" in a ${settingLabel.toLowerCase()}. The illustration should evoke the feeling of a story about ${moralLabel.toLowerCase()}. Simple, friendly, vibrant, high quality. AVOID TEXT IN THE IMAGE.`;

    try {
      const imgResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, userId: session.user.id }),
      });
      const imgData = await imgResponse.json();
      if (!imgResponse.ok) throw new Error(imgData.error || `Image generation failed: ${imgResponse.statusText}`);
      
      if (imgData.imageUrl) {
        setGeneratedImageUrl(imgData.imageUrl); 
        toast.success("Illustration generated!");
      } else {
        throw new Error("Image URL not found in response.");
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      setGeneratedImageUrl(null); 
      toast.error('Illustration Generation Failed', { description: err.message });
    } finally {
      setIsLoadingImage(false); 
    }
  }, [session]); 

  const {
    completion: storyCompletion, 
    complete: completeStory,    
    isLoading: isLoadingStory,
    error: storyError,
  } = useCompletion({
    api: '/api/generate-story',
    onFinish: async (_prompt, completionText) => {
      // Story is generated. Save it.
      if (!session?.user?.id || !completionText) {
        if (isLoadingImage) setIsLoadingImage(false); 
        if (isLoadingTitle) { /* Potentially stop title loading indicator if needed, though useCompletion handles its own */ }
        return;
      }
      // Determine labels again for saving, consistent with how they were determined for generation
      const heroObj = characters.find(c => c.id === selectedHero);
      const settingObj = settings.find(s => s.id === selectedSetting);
      const moralObj = morals.find(m => m.id === selectedMoral);

      const finalHeroLabel = selectedHero === 'custom' && customHeroText.trim() ? customHeroText.trim() : heroObj?.label;
      const finalSettingLabel = selectedSetting === 'custom' && customSettingText.trim() ? customSettingText.trim() : settingObj?.label;
      const finalMoralLabel = selectedMoral === 'custom' && customMoralText.trim() ? customMoralText.trim() : moralObj?.label;

      const storyDataForSaving = {
        userId: session.user.id,
        title: generatedTitle || `A Story about ${heroName.trim() || 'a Friend'}`, 
        content: completionText.trim(),
        character: selectedHero, // Stores 'custom' or the preset ID
        heroName: heroName.trim(),
        setting: selectedSetting, // Stores 'custom' or the preset ID
        storyLength: selectedLength,
        moral: selectedMoral, // Stores 'custom' or the preset ID
        theme: "N/A", // Assuming theme is not part of presets yet or derived differently
        // Include custom text if used, for potential display or filtering later
        // These fields might need to be added to the backend API and database schema
        customHeroDescription: selectedHero === 'custom' ? customHeroText.trim() : null,
        customSettingDescription: selectedSetting === 'custom' ? customSettingText.trim() : null,
        customMoralDescription: selectedMoral === 'custom' ? customMoralText.trim() : null,
        // Labels used in prompt, for reference
        promptHeroLabel: finalHeroLabel,
        promptSettingLabel: finalSettingLabel,
        promptMoralLabel: finalMoralLabel,
      };

      try {
        const saveResponse = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(storyDataForSaving),
        });
        const saveData = await saveResponse.json();
        if (!saveResponse.ok) {
          toast.warning("Story generated, but failed to save.", { description: saveData.error });
        } else {
          setCurrentStoryId(saveData.storyId); 
          toast.success("Story generated and saved!");
        }
      } catch (err: any) {
        toast.error("Failed to save story.", { description: err.message });
      }
      // Image linking is removed from here
    },
    onError: (err) => {
      toast.error('Story Generation Failed', { description: err.message });
      if (isLoadingImage) setIsLoadingImage(false); 
    },
  });

  // New useCompletion for title generation
  const {
    completion: titleCompletion,
    complete: completeTitle,
    isLoading: isLoadingTitle,
    error: titleError,
  } = useCompletion({
    api: '/api/generate-title',
    onFinish: (_prompt, finalTitleText) => {
      setGeneratedTitle(finalTitleText); 
      toast.success("Title generated!");
    },
    onError: (err) => {
      toast.error('Title Generation Failed', { description: err.message });
      setGeneratedTitle(null); 
    },
  });

  // Reset relevant states when a new generation starts
  useEffect(() => {
    // This effect might be redundant if all resets are handled in handlePresetSubmit
    // However, it can serve as a fallback or for specific loading state transitions.
    if (isLoadingStory || isLoadingTitle) { 
      // Consider if resetting image/storyId here is always desired if one starts and other was part way
      // For now, let handlePresetSubmit manage initial resets.
    }
  }, [isLoadingStory, isLoadingTitle]);

  const handlePresetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled || !session?.user?.id) return;

    // Reset states for the new generation cycle
    setGeneratedImageUrl(null);
    setCurrentStoryId(null);
    setGeneratedTitle(null);
    setIsLoadingImage(true); // Image generation process starts now

    const heroObj = characters.find(c => c.id === selectedHero);
    const settingObj = settings.find(s => s.id === selectedSetting);
    const lengthObj = storyLengths.find(l => l.id === selectedLength);
    const moralObj = morals.find(m => m.id === selectedMoral);

    // Determine the labels to use, preferring custom text if provided
    const heroLabel = selectedHero === 'custom' && customHeroText.trim() ? customHeroText.trim() : heroObj?.label || 'a character';
    const settingLabel = selectedSetting === 'custom' && customSettingText.trim() ? customSettingText.trim() : settingObj?.label || 'a place';
    const moralLabel = selectedMoral === 'custom' && customMoralText.trim() ? customMoralText.trim() : moralObj?.label || 'an important lesson';
    const lengthLabel = lengthObj?.label || 'a certain';
    const currentHeroName = heroName.trim();

    const userPromptForStory = `Write a children's bedtime story about a ${heroLabel.toLowerCase()} named "${currentHeroName}".
    The story takes place in a ${settingLabel.toLowerCase()}.
    It should be a ${lengthLabel.toLowerCase().replace(' (~','').replace(' min)','')} story.
    The story should convey a moral about ${moralLabel.toLowerCase()}.
    Make it engaging, imaginative, and suitable for bedtime. Directly start with the story content.`;

    const payloadForStory = {
      userId: session.user.id,
      source: 'preset',
      characterType: selectedHero, // e.g., "dragon" or "custom"
      characterLabel: heroLabel, // The actual label or custom text used for the prompt
      customCharacterText: selectedHero === 'custom' ? customHeroText.trim() : undefined,
      heroName: currentHeroName,
      setting: selectedSetting, // e.g., "magical-forest" or "custom"
      settingLabel: settingLabel, // The actual label or custom text used for the prompt
      customSettingText: selectedSetting === 'custom' ? customSettingText.trim() : undefined,
      storyLength: selectedLength,
      storyLengthLabel: lengthLabel,
      moral: selectedMoral, // e.g., "friendship" or "custom"
      moralLabel: moralLabel, // The actual label or custom text used for the prompt
      customMoralText: selectedMoral === 'custom' ? customMoralText.trim() : undefined,
    };
    
    const presetDataForImage: ImagePromptPresetData = {
      heroLabel,
      heroName: currentHeroName,
      settingLabel,
      moralLabel,
    };

    // Prompt and payload for title generation
    const userPromptForTitle = `Generate a short, catchy, and imaginative title for a children's bedtime story. The story is about a ${heroLabel.toLowerCase()} named "${currentHeroName}", takes place in ${settingLabel.toLowerCase()}, and teaches a lesson about ${moralLabel.toLowerCase()}. Title only.`;

    const payloadForTitle = {
      userId: session.user.id,
      source: 'preset',
      details: { 
        heroLabel,
        heroName: currentHeroName,
        settingLabel,
        moralLabel,
        characterType: selectedHero,
        customCharacterText: selectedHero === 'custom' ? customHeroText.trim() : undefined,
        settingType: selectedSetting,
        customSettingText: selectedSetting === 'custom' ? customSettingText.trim() : undefined,
        moralType: selectedMoral,
        customMoralText: selectedMoral === 'custom' ? customMoralText.trim() : undefined,
      }
    };

    // Start all generations
    completeStory(userPromptForStory, { body: { prompt: userPromptForStory, data: payloadForStory } });
    completeTitle(userPromptForTitle, { body: { prompt: userPromptForTitle, data: payloadForTitle } });
    generateImageForDisplay(presetDataForImage);
  };

  const isSubmitDisabled = isLoadingStory || isLoadingImage || isLoadingTitle || !heroName.trim() ||
                           (selectedHero === 'custom' && !customHeroText.trim()) || 
                           (selectedSetting === 'custom' && !customSettingText.trim()) ||
                           (selectedMoral === 'custom' && !customMoralText.trim());

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-lg mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-1 text-left">Quick Story Builder</h2>
        <form onSubmit={handlePresetSubmit} className="space-y-6 mt-6">
          {/* Hero Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Choose Your Hero</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {characters.filter(c => c.id !== 'custom').map((hero) => (
                <Button
                  key={hero.id}
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedHero(hero.id)}
                  className={`flex flex-col items-center justify-center p-3 h-auto min-h-[70px] space-y-1 rounded-lg transition-all text-xs font-medium 
                              border
                              ${selectedHero === hero.id
                                ? 'bg-gray-800 text-white border-gray-800 ring-2 ring-gray-700'
                                : 'bg-gray-200 text-gray-700 border-gray-200 hover:bg-gray-300'
                              }`}
                >
                  <hero.icon className={`h-5 w-5 mb-0.5 ${selectedHero === hero.id ? 'text-white' : hero.colorClass || 'text-gray-600'}`} />
                  <span>{hero.label}</span>
                </Button>
              ))}
              <Button
                key="custom"
                type="button"
                variant="outline"
                onClick={() => setSelectedHero('custom')}
                className={`flex flex-col items-center justify-center p-3 h-auto min-h-[70px] space-y-1 rounded-lg transition-all text-xs font-medium 
                            border
                            ${selectedHero === 'custom'
                              ? 'bg-gray-800 text-white border-gray-800 ring-2 ring-gray-700'
                              : 'bg-gray-200 text-gray-700 border-gray-200 hover:bg-gray-300'
                            }`}
              >
                <ImageIcon className={`h-5 w-5 mb-0.5 ${selectedHero === 'custom' ? 'text-white' : 'text-gray-600'}`} />
                <span>Custom</span>
              </Button>
            </div>
            {selectedHero === 'custom' && (
              <div className="mt-3">
                <Label htmlFor="custom-hero-text" className="text-sm font-medium mb-1 block">Describe your custom hero:</Label>
                <Input 
                  id="custom-hero-text"
                  value={customHeroText}
                  onChange={(e) => setCustomHeroText(e.target.value)}
                  placeholder="e.g., A brave little fox with a magical tail"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Hero's Name */}
          <div>
            <Label htmlFor="heroName" className="text-sm font-medium text-gray-700">Hero's Name</Label>
            <Input
              id="heroName"
              type="text"
              value={heroName}
              onChange={(e) => setHeroName(e.target.value)}
              placeholder="Enter a name..."
              className="mt-1 w-full bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500"
              required
            />
          </div>

          {/* Story Setting */}
          <div>
            <Label htmlFor="storySetting" className="text-sm font-medium text-gray-700">Story Setting</Label>
            <Select value={selectedSetting} onValueChange={setSelectedSetting}>
              <SelectTrigger id="storySetting" className="w-full mt-1 bg-white border-gray-300 text-gray-800 focus:border-gray-500 focus:ring-gray-500">
                <SelectValue placeholder="Select a setting" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 text-gray-800">
                {settings.map((setting) => (
                  <SelectItem key={setting.id} value={setting.id} className="focus:bg-gray-100">
                    {setting.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSetting === 'custom' && (
              <div className="mt-3">
                <Label htmlFor="custom-setting-text" className="text-sm font-medium mb-1 block">Describe your custom setting:</Label>
                <Input
                  id="custom-setting-text"
                  value={customSettingText}
                  onChange={(e) => setCustomSettingText(e.target.value)}
                  placeholder="e.g., A sparkling city on the clouds"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Story Length */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Story Length</Label>
            <div className="grid grid-cols-3 gap-3">
              {storyLengths.filter(l => l.id !== 'custom').map((length) => (
                <Button
                  key={length.id}
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedLength(length.id)}
                  className={`rounded-md text-sm h-10 font-medium border
                              ${selectedLength === length.id 
                                ? 'bg-gray-500 text-white border-gray-500 ring-2 ring-gray-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                              }`}
                >
                  {length.label.replace(' (~', '').replace(' Min)', '').replace('Medium', 'Med')}
                </Button>
              ))}
            </div>
          </div>

          {/* Story Moral */}
          <div>
            <Label htmlFor="storyMoral" className="text-sm font-medium text-gray-700">Story Moral</Label>
            <Select value={selectedMoral} onValueChange={setSelectedMoral}>
              <SelectTrigger id="storyMoral" className="w-full mt-1 bg-white border-gray-300 text-gray-800 focus:border-gray-500 focus:ring-gray-500">
                <SelectValue placeholder="Select a moral" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 text-gray-800">
                {morals.map((moral) => (
                  <SelectItem key={moral.id} value={moral.id} className="focus:bg-gray-100">
                    {moral.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMoral === 'custom' && (
              <div className="mt-3">
                <Label htmlFor="custom-moral-text" className="text-sm font-medium mb-1 block">Describe your custom moral:</Label>
                <Input
                  id="custom-moral-text"
                  value={customMoralText}
                  onChange={(e) => setCustomMoralText(e.target.value)}
                  placeholder="e.g., The importance of sharing with friends"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className={`w-full transition-transform duration-150 bg-gray-900 hover:bg-gray-800 text-white text-base font-semibold py-3
                        ${isSubmitDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'
            }`}
            disabled={isSubmitDisabled}
          >
            {(isLoadingStory || isLoadingImage || isLoadingTitle) ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            Create My Story
          </Button>
           {storyError && (
             <p className="text-sm text-red-600 text-center mt-2 flex items-center justify-center gap-1">
                 <AlertTriangle className="h-4 w-4" /> Story Error: {storyError.message}
             </p>
           )}
         </form>
      </div>

       {/* Result Display Card */}
       {(isLoadingStory || isLoadingImage || isLoadingTitle || storyCompletion || generatedImageUrl) && (
         <div className="mt-10 bg-white text-gray-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
           {/* Display Generated Title */}
           {isLoadingTitle && (
             <div className="my-4 text-center">
               <Loader2 className="h-6 w-6 animate-spin inline-block mr-2 text-gray-500" />
               <span className="text-gray-600">Hold tight, magic is in the making...</span>
             </div>
           )}
           {titleError && !isLoadingTitle && (
             <div className="my-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-center">
               <AlertTriangle className="h-5 w-5 inline-block mr-2" />
               Title generation failed: {titleError.message}
             </div>
           )}
           {titleCompletion && !isLoadingTitle && !titleError && (
             <div className="my-6 text-center">
               <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                 {titleCompletion}
               </h2>
             </div>
           )}

           {/* Image Display Logic */}
           {isLoadingImage && !generatedImageUrl && ( 
             <div className="flex flex-col justify-center items-center h-72 bg-gray-50 rounded-lg border border-gray-200">
               <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
               <p className="ml-2 text-gray-600 mt-3 text-base">Generating Illustration...</p>
             </div>
           )}
           {generatedImageUrl && ( 
             <div className="flex justify-center my-6">
               <NextImage src={generatedImageUrl} alt="Generated Story Illustration" width={512} height={512} className="rounded-xl shadow-xl border-2 border-gray-100" unoptimized />
             </div>
           )}
           {/* Case: Image generation finished (isLoadingImage is false) but no URL was produced. */}
           {/* This message will show if story is also done, or if image failed while story is still loading. */}
           {!isLoadingImage && !generatedImageUrl && (storyCompletion || isLoadingStory || currentStoryId) && (
             <div className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg border border-gray-200">
               <ImageIcon className="inline-block h-6 w-6 mr-2 text-orange-400"/>
               <span className="align-middle text-base">Illustration could not be generated or is still pending.</span>
             </div>
           )}
           
           {/* Story Display Logic */}
           {isLoadingStory && !storyCompletion && ( 
             <div className="space-y-3 py-4">
               <Skeleton className="h-5 w-full bg-gray-200 rounded" />
               <Skeleton className="h-5 w-full bg-gray-200 rounded" />
               <Skeleton className="h-5 w-[85%] bg-gray-200 rounded" />
               <p className="text-base text-gray-500 text-center pt-3">Crafting your magical story...</p>
             </div>
           )}
           {storyCompletion && ( 
             <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
               {storyCompletion.split('\n\n').map((paragraph: string, index: number) => (
                 paragraph.trim() && <p key={index} className="mb-4">{paragraph}</p>
               ))}
             </div>
           )}
         </div>
       )}
    </div>
  );
}