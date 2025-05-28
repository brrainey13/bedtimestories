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
  PresetOption // Ensure PresetOption is imported if used by characters etc.
} from '@/config/presetOptions';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Wand2, Loader2, Image as ImageIcon, AlertTriangle, Sparkles } from 'lucide-react';
import NextImage from 'next/image';
import { useCompletion } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';

interface ImagePromptPresetData {
  heroLabel: string;
  heroName: string;
  settingLabel: string;
  moralLabel: string;
}

export default function PresetGenerator() {
  const { session } = useAuth();
  const router = useRouter();

  // Form input states
  const [selectedHero, setSelectedHero] = useState<string>(characters.find(c => c.id !== 'custom')?.id || '');
  const [heroName, setHeroName] = useState('');
  const [customHeroText, setCustomHeroText] = useState('');
  const [selectedSetting, setSelectedSetting] = useState<string>(settings.find(s => s.id !== 'custom')?.id || '');
  const [customSettingText, setCustomSettingText] = useState('');
  const [selectedLength, setSelectedLength] = useState<string>(storyLengths.find(l => l.id !== 'custom' && l.id === 'medium')?.id || storyLengths[0]?.id || '');
  const [selectedMoral, setSelectedMoral] = useState<string>(morals.find(m => m.id === 'friendship')?.id || morals[0]?.id || '');
  const [customMoralText, setCustomMoralText] = useState('');

  // Image generation states
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Story saving and ID states
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [isSavingStory, setIsSavingStory] = useState(false);

  // State to hold details from form submission needed for saving
  const [storyParamsForSave, setStoryParamsForSave] = useState<{
    heroLabel: string;
    currentHeroName: string;
    settingLabel: string;
    moralLabel: string;
    lengthLabel: string; // Added from previous logic
  } | null>(null);


  const generateImageForDisplay = useCallback(async (presetData: ImagePromptPresetData) => {
    if (!session?.user?.id) return;
    setIsLoadingImage(true);
    setImageError(null);
    setGeneratedImageUrl(null);

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
      setImageError(err.message || "Failed to generate illustration.");
      setGeneratedImageUrl(null); // Ensure URL is null on error
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
    setCompletion: setStoryCompletion
  } = useCompletion({
    api: '/api/generate-story',
    onFinish: (_prompt, completionText) => {
      console.log("Story generation finished.");
      // Save logic is now handled by useEffect
    },
    onError: (err) => {
      toast.error('Story Generation Failed', { description: err.message });
      console.error("Story generation error hook:", err);
    },
  });

  const {
    completion: titleCompletion,
    complete: completeTitle,
    isLoading: isLoadingTitle,
    error: titleError,
    setCompletion: setTitleCompletion
  } = useCompletion({
    api: '/api/generate-title',
    onFinish: (_prompt, finalTitleText) => {
      console.log("Title generation finished.");
      // Save logic is now handled by useEffect
    },
    onError: (err) => {
      toast.error('Title Generation Failed', { description: err.message });
      console.error("Title generation error hook:", err);
    },
  });

  // useEffect to save the story when all parts are ready
  useEffect(() => {
    let responseErrorToastShown = false; // Declare the flag here

    const storyReady = !isLoadingStory && storyCompletion && storyCompletion.trim() !== '';
    const titleReady = !isLoadingTitle && titleCompletion && titleCompletion.trim() !== '';
    const imageProcessDone = !isLoadingImage; // Image is done if not loading (could be success or failure)

    if (storyReady && titleReady && imageProcessDone && !isSavingStory && storyParamsForSave && session?.user?.id) {
      setIsSavingStory(true);

      // Use storyParamsForSave for these values, ensuring they reflect the state at submission time
      const { currentHeroName } = storyParamsForSave;

      // Recalculate final labels for saving based on selections at time of submit, stored in storyParamsForSave or current form state
      // This part assumes selectedHero, customHeroText etc. are stable or storyParamsForSave has all descriptor text
      const heroObj = characters.find(c => c.id === selectedHero);
      const settingObj = settings.find(s => s.id === selectedSetting);
      const moralObj = morals.find(m => m.id === selectedMoral);

      const finalHeroLabel = selectedHero === 'custom' && customHeroText.trim() ? customHeroText.trim() : heroObj?.label;
      const finalSettingLabel = selectedSetting === 'custom' && customSettingText.trim() ? customSettingText.trim() : settingObj?.label;
      const finalMoralLabel = selectedMoral === 'custom' && customMoralText.trim() ? customMoralText.trim() : moralObj?.label;
      
      const storyDataForSaving = {
        userId: session.user.id,
        title: titleCompletion.trim(),
        content: storyCompletion.trim(),
        imageUrl: generatedImageUrl, // This will be the URL from state, or null if image failed/not generated
        character: selectedHero,
        heroName: currentHeroName, // From storyParamsForSave or current state heroName.trim()
        setting: selectedSetting,
        storyLength: selectedLength,
        moral: selectedMoral,
        theme: "N/A",
        customHeroDescription: selectedHero === 'custom' ? customHeroText.trim() : null,
        customSettingDescription: selectedSetting === 'custom' ? customSettingText.trim() : null,
        customMoralDescription: selectedMoral === 'custom' ? customMoralText.trim() : null,
        promptHeroLabel: finalHeroLabel,
        promptSettingLabel: finalSettingLabel,
        promptMoralLabel: finalMoralLabel,
      };

      console.log("Attempting to save story with data:", storyDataForSaving);

      fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyDataForSaving),
      })
      .then(async (res) => {
        const saveData = await res.json();
        if (!res.ok) {
          toast.error("Failed to save story.", { 
            id: 'save-error', // Add ID
            description: saveData.error || "Unknown saving error" 
          });
          responseErrorToastShown = true; // Set flag
          throw new Error(saveData.error || "Failed to save story");
        }
        setCurrentStoryId(saveData.storyId);
        toast.success("Story, Title, and Illustration (if any) are ready and saved!");
        // Example: Navigate to the new story page
        // router.push(`/story/${saveData.storyId}`); 
      })
      .catch((err: any) => {
        // Toast for fetch error is already handled if it's a response error.
        // This catches network errors or JSON parsing errors.
        if (!responseErrorToastShown) { // Check flag instead of toast.isActive
            toast.error("Failed to save story.", { id: 'save-error', description: err.message });
        }
        console.error("Save fetch/process error:", err);
      })
      .finally(() => {
        setIsSavingStory(false);
        setStoryParamsForSave(null); // Clear after attempting to save
      });
    }
  }, [
    storyCompletion, isLoadingStory,
    titleCompletion, isLoadingTitle,
    generatedImageUrl, isLoadingImage, imageError, // imageError included to trigger effect if it changes
    isSavingStory, session,
    heroName, selectedHero, customHeroText, 
    selectedSetting, customSettingText, 
    selectedLength, 
    selectedMoral, customMoralText,
    storyParamsForSave, // Key dependency
    router
  ]);


  const handlePresetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled || !session?.user?.id) return;

    // Reset all relevant states for a new generation cycle
    setStoryCompletion('');
    setTitleCompletion('');
    setGeneratedImageUrl(null);
    setImageError(null);
    setCurrentStoryId(null);
    setIsSavingStory(false); 
    setStoryParamsForSave(null); // Clear previous params

    // Capture form values at the moment of submission
    const heroObj = characters.find(c => c.id === selectedHero);
    const settingObj = settings.find(s => s.id === selectedSetting);
    const lengthObj = storyLengths.find(l => l.id === selectedLength);
    const moralObj = morals.find(m => m.id === selectedMoral);

    const currentHeroName = heroName.trim();
    const heroLabel = selectedHero === 'custom' && customHeroText.trim() ? customHeroText.trim() : heroObj?.label || 'a character';
    const settingLabel = selectedSetting === 'custom' && customSettingText.trim() ? customSettingText.trim() : settingObj?.label || 'a place';
    const moralLabel = selectedMoral === 'custom' && customMoralText.trim() ? customMoralText.trim() : moralObj?.label || 'an important lesson';
    const lengthLabel = lengthObj?.label || 'a certain';

    // Store these captured values for the useEffect to use when saving
    setStoryParamsForSave({
        heroLabel, currentHeroName, settingLabel, moralLabel, lengthLabel
    });

    const userPromptForStory = `Write a children's bedtime story about a ${heroLabel.toLowerCase()} named "${currentHeroName}".
    The story takes place in a ${settingLabel.toLowerCase()}.
    It should be a ${lengthLabel.toLowerCase().replace(' (~','').replace(' min)','')} story.
    The story should convey a moral about ${moralLabel.toLowerCase()}.
    Make it engaging, imaginative, and suitable for bedtime. Directly start with the story content.`;

    const presetDataForImage: ImagePromptPresetData = { heroLabel, heroName: currentHeroName, settingLabel, moralLabel };
    const userPromptForTitle = `Generate a short, catchy, and imaginative title for a children's bedtime story. The story is about a ${heroLabel.toLowerCase()} named "${currentHeroName}", takes place in ${settingLabel.toLowerCase()}, and teaches a lesson about ${moralLabel.toLowerCase()}. Title only.`;

    // Data payloads for AI SDK (user ID and source are important for backend validation/logging)
    const commonApiPayloadData = { userId: session.user.id, source: 'preset' };

    // Start all generations
    completeStory(userPromptForStory, { body: { prompt: userPromptForStory, data: commonApiPayloadData } });
    completeTitle(userPromptForTitle, { body: { prompt: userPromptForTitle, data: commonApiPayloadData } });
    generateImageForDisplay(presetDataForImage); // This one makes its own fetch call
  };

  const isAnyLoading = isLoadingStory || isLoadingImage || isLoadingTitle || isSavingStory;
  const isSubmitDisabled = isAnyLoading || !heroName.trim() ||
                           (selectedHero === 'custom' && !customHeroText.trim()) || 
                           (selectedSetting === 'custom' && !customSettingText.trim()) ||
                           (selectedMoral === 'custom' && !customMoralText.trim());
  
  let buttonText = "Create My Story";
  if (isLoadingStory) buttonText = "Crafting Story...";
  else if (isLoadingTitle) buttonText = "Thinking of a Title...";
  else if (isLoadingImage) buttonText = "Illustrating...";
  else if (isSavingStory) buttonText = "Saving your masterpiece...";


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
                <ImageIcon className={`h-5 w-5 mb-0.5 ${selectedHero === 'custom' ? 'text-white' : 'text-gray-600'}`} /> {/* Changed icon for custom */}
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
              {storyLengths.filter(l => l.id !== 'custom').map((length) => ( // Assuming 'custom' length is not a button option
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
            {isAnyLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            {buttonText}
          </Button>
           {storyError && !isLoadingStory && ( // Show story error if not loading story
             <p className="text-sm text-red-600 text-center mt-2 flex items-center justify-center gap-1">
                 <AlertTriangle className="h-4 w-4" /> Story Error: {storyError.message}
             </p>
           )}
           {titleError && !isLoadingTitle && ( // Show title error if not loading title
             <p className="text-sm text-red-600 text-center mt-2 flex items-center justify-center gap-1">
                 <AlertTriangle className="h-4 w-4" /> Title Error: {titleError.message}
             </p>
           )}
         </form>
      </div>

       {/* Result Display Card */}
       {(isAnyLoading || storyCompletion || generatedImageUrl || titleCompletion || imageError || storyError || titleError) && (
         <div className="mt-10 bg-white text-gray-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
           {/* Display Generated Title */}
           {isLoadingTitle && !titleCompletion && (
             <div className="my-4 text-center">
               <Loader2 className="h-6 w-6 animate-spin inline-block mr-2 text-gray-500" />
               <span className="text-gray-600">Thinking of a perfect title...</span>
             </div>
           )}
           {titleError && !isLoadingTitle && ( // Displayed if error and not loading
             <div className="my-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-center">
               <AlertTriangle className="h-5 w-5 inline-block mr-2" />
               Title generation failed: {titleError.message}
             </div>
           )}
           {titleCompletion && (
             <div className="my-6 text-center">
               <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                 {titleCompletion}
               </h2>
             </div>
           )}

           {/* Image Display Logic */}
           {isLoadingImage && !generatedImageUrl && !imageError && ( 
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
           {imageError && !isLoadingImage && !generatedImageUrl &&( 
             <div className="text-center text-gray-500 py-6 bg-red-50 rounded-lg border border-red-200">
               <ImageIcon className="inline-block h-6 w-6 mr-2 text-red-400"/>
               <span className="align-middle text-base text-red-600">Illustration failed: {imageError}</span>
             </div>
           )}
           {/* Fallback message if image process is done (not loading), but no URL and no specific error was set */}
           {!isLoadingImage && !generatedImageUrl && !imageError && (storyCompletion || titleCompletion || isAnyLoading) && (
             <div className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg border border-gray-200">
               <ImageIcon className="inline-block h-6 w-6 mr-2 text-orange-400"/>
               <span className="align-middle text-base">Illustration pending or not generated.</span>
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
           {storyError && !isLoadingStory && ( // Displayed if error and not loading
             <div className="my-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-center">
               <AlertTriangle className="h-5 w-5 inline-block mr-2" />
               Story generation failed: {storyError.message}
             </div>
           )}
           {storyCompletion && ( 
             <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
               {storyCompletion.split('\n\n').map((paragraph: string, index: number) => (
                 paragraph.trim() && <p key={index} className="mb-4">{paragraph}</p>
               ))}
             </div>
           )}

            {/* Link to view full story if saved */}
            {currentStoryId && !isAnyLoading && (
                 <div className="mt-8 text-center">
                     <Button onClick={() => router.push(`/story/${currentStoryId}`)} variant="default" size="lg">
                         View Full Story
                     </Button>
                 </div>
             )}
         </div>
       )}
    </div>
  );
}