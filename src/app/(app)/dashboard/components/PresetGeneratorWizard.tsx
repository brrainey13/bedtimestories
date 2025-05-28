// src/app/(app)/dashboard/components/PresetGeneratorWizard.tsx
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
  ageRanges,
  PresetOption
} from '@/config/presetOptions';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Wand2, Loader2, Image as ImageIcon, AlertTriangle, Sparkles, ArrowLeft, ArrowRight, User, MapPin, BookOpen as BookDetailsIcon, Clock, Brain } from 'lucide-react';
import NextImage from 'next/image';
import { useCompletion } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ImagePromptPresetData {
  heroLabel: string;
  heroName: string;
  settingLabel: string;
  moralLabel: string;
}

const STEP_HERO = 1;
const STEP_WORLD = 2;
const STEP_DETAILS = 3;

export default function PresetGeneratorWizard() {
  const { session } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(STEP_HERO);

  // Form input states (same as original)
  const [selectedHero, setSelectedHero] = useState<string>(characters.find(c => c.id !== 'custom')?.id || '');
  const [heroName, setHeroName] = useState('');
  const [customHeroText, setCustomHeroText] = useState('');
  const [selectedSetting, setSelectedSetting] = useState<string>(settings.find(s => s.id !== 'custom')?.id || '');
  const [customSettingText, setCustomSettingText] = useState('');
  const [selectedLength, setSelectedLength] = useState<string>(storyLengths.find(l => l.id !== 'custom' && l.id === 'medium')?.id || storyLengths[0]?.id || '');
  const [selectedMoral, setSelectedMoral] = useState<string>(morals.find(m => m.id === 'friendship')?.id || morals[0]?.id || '');
  const [customMoralText, setCustomMoralText] = useState('');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>(ageRanges.find(ar => ar.id === '4-7')?.id || ageRanges[0]?.id || '');

  // AI and saving states (same as original)
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [isSavingStory, setIsSavingStory] = useState(false);
  const [storyParamsForSave, setStoryParamsForSave] = useState<any>(null);

  // useCompletion hooks (same as original)
  const { completion: storyCompletion, complete: completeStory, isLoading: isLoadingStory, error: storyError, setCompletion: setStoryCompletion } = useCompletion({ api: '/api/generate-story', onFinish: () => console.log("Story finished."), onError: (err) => toast.error('Story Generation Failed', { description: err.message }) });
  const { completion: titleCompletion, complete: completeTitle, isLoading: isLoadingTitle, error: titleError, setCompletion: setTitleCompletion } = useCompletion({ api: '/api/generate-title', onFinish: () => console.log("Title finished."), onError: (err) => toast.error('Title Generation Failed', { description: err.message }) });

  // Image generation and saving useEffect (same as original, ensure all dependencies are correct)
  // This logic is copied directly, make sure all state variables used here are defined above
  const generateImageForDisplay = useCallback(async (presetData: ImagePromptPresetData) => {
    if (!session?.user?.id) return;
    setIsLoadingImage(true); setImageError(null); setGeneratedImageUrl(null);
    const imagePrompt = `Children's storybook illustration style. A whimsical and colorful scene featuring a ${presetData.heroLabel.toLowerCase()} named "${presetData.heroName.trim()}" in a ${presetData.settingLabel.toLowerCase()}. The illustration should evoke the feeling of a story about ${presetData.moralLabel.toLowerCase()}. Simple, friendly, vibrant, high quality. AVOID TEXT IN THE IMAGE.`;
    try {
      const imgResponse = await fetch('/api/generate-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: imagePrompt, userId: session.user.id }) });
      const imgData = await imgResponse.json();
      if (!imgResponse.ok) throw new Error(imgData.error || `Image generation failed: ${imgResponse.statusText}`);
      if (imgData.imageUrl) { setGeneratedImageUrl(imgData.imageUrl); toast.success("Illustration generated!"); } 
      else { throw new Error("Image URL not found in response."); }
    } catch (err: any) { console.error("Image generation error:", err); setImageError(err.message || "Failed to generate illustration."); setGeneratedImageUrl(null); toast.error('Illustration Generation Failed', { description: err.message });
    } finally { setIsLoadingImage(false); }
  }, [session]);

  useEffect(() => {
    let responseErrorToastShown = false;
    const storyReady = !isLoadingStory && storyCompletion && storyCompletion.trim() !== '';
    const titleReady = !isLoadingTitle && titleCompletion && titleCompletion.trim() !== '';
    const imageProcessDone = !isLoadingImage;

    if (storyReady && titleReady && imageProcessDone && !isSavingStory && storyParamsForSave && session?.user?.id) {
      setIsSavingStory(true);
      const { currentHeroName } = storyParamsForSave;
      const heroObj = characters.find(c => c.id === selectedHero);
      const settingObj = settings.find(s => s.id === selectedSetting);
      const moralObj = morals.find(m => m.id === selectedMoral);
      const finalHeroLabel = selectedHero === 'custom' && customHeroText.trim() ? customHeroText.trim() : heroObj?.label;
      const finalSettingLabel = selectedSetting === 'custom' && customSettingText.trim() ? customSettingText.trim() : settingObj?.label;
      const finalMoralLabel = selectedMoral === 'custom' && customMoralText.trim() ? customMoralText.trim() : moralObj?.label;
      
      const storyDataForSaving = {
        userId: session.user.id, title: titleCompletion.trim(), content: storyCompletion.trim(), imageUrl: generatedImageUrl,
        character: selectedHero, heroName: currentHeroName, setting: selectedSetting, storyLength: selectedLength,
        moral: selectedMoral, ageRange: selectedAgeRange, theme: "N/A",
        customHeroDescription: selectedHero === 'custom' ? customHeroText.trim() : null,
        customSettingDescription: selectedSetting === 'custom' ? customSettingText.trim() : null,
        customMoralDescription: selectedMoral === 'custom' ? customMoralText.trim() : null,
        promptHeroLabel: finalHeroLabel, promptSettingLabel: finalSettingLabel, promptMoralLabel: finalMoralLabel,
        promptAgeRangeLabel: storyParamsForSave.ageRangeLabel,
      };
      fetch('/api/stories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(storyDataForSaving) })
      .then(async (res) => {
        const saveData = await res.json();
        if (!res.ok) { toast.error("Failed to save story.", { id: 'save-error', description: saveData.error || "Unknown saving error" }); responseErrorToastShown = true; throw new Error(saveData.error || "Failed to save story"); }
        setCurrentStoryId(saveData.storyId); toast.success("Story, Title, and Illustration (if any) are ready and saved!");
      }).catch((err: any) => {
        if (!responseErrorToastShown) { toast.error("Failed to save story.", { id: 'save-error', description: err.message }); }
      }).finally(() => { setIsSavingStory(false); setStoryParamsForSave(null); });
    }
  }, [storyCompletion, isLoadingStory, titleCompletion, isLoadingTitle, generatedImageUrl, isLoadingImage, imageError, isSavingStory, session, heroName, selectedHero, customHeroText, selectedSetting, customSettingText, selectedLength, selectedMoral, customMoralText, selectedAgeRange, storyParamsForSave, router, setGeneratedImageUrl, setImageError, setIsLoadingImage, setCurrentStoryId, setIsSavingStory, setStoryParamsForSave, setStoryCompletion, setTitleCompletion]);


  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const isStep1Valid = () => {
    return heroName.trim() !== '' && (selectedHero !== 'custom' || customHeroText.trim() !== '');
  };
  const isStep2Valid = () => {
    return (selectedSetting !== 'custom' || customSettingText.trim() !== '') &&
           (selectedMoral !== 'custom' || customMoralText.trim() !== '') &&
           selectedAgeRange !== '';
  };
  const isStep3Valid = () => {
    return selectedLength !== '';
  };

  const isFinalSubmitDisabled = !isStep1Valid() || !isStep2Valid() || !isStep3Valid() || isLoadingStory || isLoadingImage || isLoadingTitle || isSavingStory;


  const handleSubmitWizard = async (e: FormEvent) => {
    e.preventDefault();
    if (isFinalSubmitDisabled || !session?.user?.id) return;

    setStoryCompletion(''); setTitleCompletion(''); setGeneratedImageUrl(null); setImageError(null); setCurrentStoryId(null); setIsSavingStory(false); 
    
    const heroObj = characters.find(c => c.id === selectedHero);
    const settingObj = settings.find(s => s.id === selectedSetting);
    const lengthObj = storyLengths.find(l => l.id === selectedLength);
    const moralObj = morals.find(m => m.id === selectedMoral);
    const ageRangeObj = ageRanges.find(ar => ar.id === selectedAgeRange);

    const currentHeroName = heroName.trim();
    const heroLabel = selectedHero === 'custom' && customHeroText.trim() ? customHeroText.trim() : heroObj?.label || 'a character';
    const settingLabel = selectedSetting === 'custom' && customSettingText.trim() ? customSettingText.trim() : settingObj?.label || 'a place';
    const moralLabel = selectedMoral === 'custom' && customMoralText.trim() ? customMoralText.trim() : moralObj?.label || 'an important lesson';
    const lengthLabel = lengthObj?.label || 'a certain';
    const ageRangeLabel = ageRangeObj?.label || 'general audience';

    setStoryParamsForSave({ heroLabel, currentHeroName, settingLabel, moralLabel, lengthLabel, ageRangeLabel });

    const userPromptForStory = `Write a children's bedtime story about a ${heroLabel.toLowerCase()} named "${currentHeroName}". The story takes place in a ${settingLabel.toLowerCase()}. It should be a ${lengthLabel.toLowerCase().replace(' (~','').replace(' min)','')} story. The story should convey a moral about ${moralLabel.toLowerCase()}. The story should be written for children in the ${ageRangeLabel.toLowerCase()} age group. Please adjust vocabulary, sentence structure, and complexity accordingly. Make it engaging, imaginative, and suitable for bedtime. Directly start with the story content.`;
    const presetDataForImage: ImagePromptPresetData = { heroLabel, heroName: currentHeroName, settingLabel, moralLabel };
    const userPromptForTitle = `Generate a short, catchy, and imaginative title for a children's bedtime story. The story is about a ${heroLabel.toLowerCase()} named "${currentHeroName}", takes place in ${settingLabel.toLowerCase()}, teaches a lesson about ${moralLabel.toLowerCase()}, and is for the ${ageRangeLabel.toLowerCase()} age group. Title only.`;
    const commonApiPayloadData = { userId: session.user.id, source: 'preset' };

    completeStory(userPromptForStory, { body: { prompt: userPromptForStory, data: commonApiPayloadData } });
    completeTitle(userPromptForTitle, { body: { prompt: userPromptForTitle, data: commonApiPayloadData } });
    generateImageForDisplay(presetDataForImage);
  };
  
  const isAnyLoading = isLoadingStory || isLoadingImage || isLoadingTitle || isSavingStory;
  let buttonText = "Create My Story";
  if (isLoadingStory) buttonText = "Crafting Story...";
  else if (isLoadingTitle) buttonText = "Thinking of a Title...";
  else if (isLoadingImage) buttonText = "Illustrating...";
  else if (isSavingStory) buttonText = "Saving your masterpiece...";

  const steps = [
    { id: STEP_HERO, label: "Hero", icon: User },
    { id: STEP_WORLD, label: "World", icon: MapPin },
    { id: STEP_DETAILS, label: "Details", icon: BookDetailsIcon },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl max-w-3xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 border-b pb-4">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ease-in-out",
                            currentStep === step.id ? "bg-gray-800 border-gray-800 text-white scale-110" :
                            currentStep > step.id ? "bg-green-500 border-green-500 text-white" :
                            "bg-gray-100 border-gray-300 text-gray-400"
                        )}>
                            <step.icon className="w-5 h-5" />
                        </div>
                        <p className={cn(
                            "mt-2 text-xs font-medium",
                            currentStep === step.id ? "text-gray-800" :
                            currentStep > step.id ? "text-green-600" :
                            "text-gray-400"
                        )}>{step.label}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={cn(
                            "flex-1 h-1 mx-2 rounded",
                            currentStep > step.id ? "bg-green-500" : "bg-gray-300"
                        )}></div>
                    )}
                </React.Fragment>
            ))}
        </div>


        <form onSubmit={handleSubmitWizard} className="space-y-6 mt-6">
          {/* Step 1: Hero */}
          {currentStep === STEP_HERO && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-700">Step 1: Tell us about your Hero</h3>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Choose Your Hero</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {characters.map((hero) => ( // Includes "Custom" here
                    <Button key={hero.id} type="button" variant="outline" onClick={() => setSelectedHero(hero.id)}
                      className={`flex flex-col items-center justify-center p-3 h-auto min-h-[70px] space-y-1 rounded-lg transition-all text-xs font-medium border ${selectedHero === hero.id ? 'bg-gray-800 text-white border-gray-800 ring-2 ring-gray-700' : 'bg-gray-200 text-gray-700 border-gray-200 hover:bg-gray-300'}`}>
                      <hero.icon className={`h-5 w-5 mb-0.5 ${selectedHero === hero.id ? 'text-white' : hero.colorClass || 'text-gray-600'}`} />
                      <span>{hero.label}</span>
                    </Button>
                  ))}
                </div>
                {selectedHero === 'custom' && (
                  <div className="mt-3">
                    <Label htmlFor="custom-hero-text" className="text-sm font-medium mb-1 block">Describe your custom hero:</Label>
                    <Input id="custom-hero-text" value={customHeroText} onChange={(e) => setCustomHeroText(e.target.value)} placeholder="e.g., A brave little fox" className="mt-1" />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="heroName" className="text-sm font-medium text-gray-700">Hero's Name</Label>
                <Input id="heroName" type="text" value={heroName} onChange={(e) => setHeroName(e.target.value)} placeholder="Enter a name..." className="mt-1 w-full bg-white" required />
              </div>
            </div>
          )}

          {/* Step 2: World & Tone */}
          {currentStep === STEP_WORLD && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-700">Step 2: Describe the World & Tone</h3>
              <div>
                <Label htmlFor="storySetting" className="text-sm font-medium text-gray-700">Story Setting</Label>
                <Select value={selectedSetting} onValueChange={setSelectedSetting}>
                  <SelectTrigger id="storySetting" className="w-full mt-1 bg-white"><SelectValue placeholder="Select a setting" /></SelectTrigger>
                  <SelectContent className="bg-white">{settings.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
                {selectedSetting === 'custom' && (
                  <div className="mt-3">
                    <Label htmlFor="custom-setting-text" className="text-sm font-medium mb-1 block">Describe custom setting:</Label>
                    <Input id="custom-setting-text" value={customSettingText} onChange={(e) => setCustomSettingText(e.target.value)} placeholder="e.g., A city on clouds" className="mt-1" />
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Target Age Range</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ageRanges.map((age) => (
                    <Button key={age.id} type="button" variant="outline" onClick={() => setSelectedAgeRange(age.id)}
                      className={`flex flex-col items-center justify-center p-3 h-auto min-h-[70px] space-y-1 rounded-lg transition-all text-xs font-medium border ${selectedAgeRange === age.id ? 'bg-gray-700 text-white border-gray-700 ring-2 ring-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}>
                      <age.icon className={`h-5 w-5 mb-0.5 ${selectedAgeRange === age.id ? 'text-white' : age.colorClass || 'text-gray-600'}`} />
                      <span>{age.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="storyMoral" className="text-sm font-medium text-gray-700">Story Moral</Label>
                <Select value={selectedMoral} onValueChange={setSelectedMoral}>
                  <SelectTrigger id="storyMoral" className="w-full mt-1 bg-white"><SelectValue placeholder="Select a moral" /></SelectTrigger>
                  <SelectContent className="bg-white">{morals.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
                {selectedMoral === 'custom' && (
                  <div className="mt-3">
                    <Label htmlFor="custom-moral-text" className="text-sm font-medium mb-1 block">Describe custom moral:</Label>
                    <Input id="custom-moral-text" value={customMoralText} onChange={(e) => setCustomMoralText(e.target.value)} placeholder="e.g., Importance of sharing" className="mt-1" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Details & Generate */}
          {currentStep === STEP_DETAILS && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-700">Step 3: Final Details</h3>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Story Length</Label>
                <div className="grid grid-cols-3 gap-3">
                  {storyLengths.map((length) => (
                    <Button key={length.id} type="button" variant="outline" onClick={() => setSelectedLength(length.id)}
                      className={`rounded-md text-sm h-10 font-medium border ${selectedLength === length.id ? 'bg-gray-500 text-white border-gray-500 ring-2 ring-gray-400' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>
                      {length.label.replace(' (~', '').replace(' Min)', '').replace('Medium', 'Med')}
                    </Button>
                  ))}
                </div>
              </div>
              {/* Optional: Summary of choices */}
              <div className="p-4 border rounded-lg bg-gray-50 text-sm space-y-1">
                  <p><strong>Hero:</strong> {characters.find(c=>c.id === selectedHero)?.label === 'Custom Hero' ? customHeroText || 'Custom' : characters.find(c=>c.id === selectedHero)?.label} ({heroName})</p>
                  <p><strong>Setting:</strong> {settings.find(s=>s.id === selectedSetting)?.label === 'Custom Setting' ? customSettingText || 'Custom' : settings.find(s=>s.id === selectedSetting)?.label}</p>
                  <p><strong>Age Range:</strong> {ageRanges.find(a=>a.id === selectedAgeRange)?.label}</p>
                  <p><strong>Moral:</strong> {morals.find(m=>m.id === selectedMoral)?.label === 'Custom Moral' ? customMoralText || 'Custom' : morals.find(m=>m.id === selectedMoral)?.label}</p>
                  <p><strong>Length:</strong> {storyLengths.find(l=>l.id === selectedLength)?.label}</p>
              </div>

              <Button type="submit" size="lg" className={`w-full bg-gray-900 hover:bg-gray-800 text-white ${isFinalSubmitDisabled ? 'opacity-60 cursor-not-allowed' : ''}`} disabled={isFinalSubmitDisabled}>
                {isAnyLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                {buttonText}
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            {currentStep > STEP_HERO && (
              <Button type="button" variant="outline" onClick={prevStep} className="bg-gray-200 hover:bg-gray-300">
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
            )}
            {/* Spacer to push Next/Submit to the right if Previous is not visible */}
            {currentStep === STEP_HERO && <div />} 

            {currentStep < STEP_DETAILS && (
              <Button type="button" onClick={nextStep} className="bg-gray-700 hover:bg-gray-800 text-white"
                disabled={ (currentStep === STEP_HERO && !isStep1Valid()) || (currentStep === STEP_WORLD && !isStep2Valid()) }
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
            {storyError && !isLoadingStory && (<p className="text-sm text-red-600 text-center mt-2"><AlertTriangle className="inline h-4 w-4" /> Story Error: {storyError.message}</p>)}
            {titleError && !isLoadingTitle && (<p className="text-sm text-red-600 text-center mt-2"><AlertTriangle className="inline h-4 w-4" /> Title Error: {titleError.message}</p>)}
        </form>
      </div>

      {/* Result Display Card (same as original) */}
      {(isAnyLoading || storyCompletion || generatedImageUrl || titleCompletion || imageError || storyError || titleError) && (
        <div className="mt-10 bg-white text-gray-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
          {isLoadingTitle && !titleCompletion && (<div className="my-4 text-center"><Loader2 className="h-6 w-6 animate-spin inline-block mr-2 text-gray-500" /> Thinking...</div>)}
          {titleError && !isLoadingTitle && (<div className="my-4 p-3 bg-red-100 border-red-300 text-red-700 text-center"><AlertTriangle className="h-5 w-5 inline mr-2" />Title failed: {titleError.message}</div>)}
          {titleCompletion && (<div className="my-6 text-center"><h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">{titleCompletion}</h2></div>)}
          {isLoadingImage && !generatedImageUrl && !imageError && (<div className="flex flex-col justify-center items-center h-72 bg-gray-50 rounded-lg border"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /><p className="ml-2 text-gray-600 mt-3">Illustrating...</p></div>)}
          {generatedImageUrl && (<div className="flex justify-center my-6"><NextImage src={generatedImageUrl} alt="Generated Story Illustration" width={512} height={512} className="rounded-xl shadow-xl border-2" unoptimized /></div>)}
          {imageError && !isLoadingImage && !generatedImageUrl && (<div className="text-center text-gray-500 py-6 bg-red-50 rounded-lg border border-red-200"><ImageIcon className="inline h-6 w-6 mr-2 text-red-400"/><span className="align-middle text-red-600">Illustration failed: {imageError}</span></div>)}
          {!isLoadingImage && !generatedImageUrl && !imageError && (storyCompletion || titleCompletion || isAnyLoading) && (<div className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg border border-gray-200"><ImageIcon className="inline h-6 w-6 mr-2 text-orange-400"/><span className="align-middle">Illustration pending.</span></div>)}
          {isLoadingStory && !storyCompletion && (<div className="space-y-3 py-4"><Skeleton className="h-5 w-full bg-gray-200" /><Skeleton className="h-5 w-full bg-gray-200" /><Skeleton className="h-5 w-[85%] bg-gray-200" /><p className="text-gray-500 text-center pt-3">Crafting story...</p></div>)}
          {storyError && !isLoadingStory && (<div className="my-4 p-3 bg-red-100 border-red-300 text-red-700 text-center"><AlertTriangle className="h-5 w-5 inline mr-2" />Story failed: {storyError.message}</div>)}
          {storyCompletion && (<div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">{storyCompletion.split('\n\n').map((p: string, i: number) => (p.trim() && <p key={i} className="mb-4">{p}</p>))}</div>)}
          {currentStoryId && !isAnyLoading && (<div className="mt-8 text-center"><Button onClick={() => router.push(`/story/${currentStoryId}`)} variant="default" size="lg">View Full Story</Button></div>)}
        </div>
      )}
    </div>
  );
}

// Add basic fadeIn animation to globals.css or a style tag if not already present
// Example for globals.css:
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
*/