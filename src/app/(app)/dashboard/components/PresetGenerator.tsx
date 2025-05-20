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
import { Wand2, Loader2, Image as ImageIcon, AlertTriangle, Sparkles } from 'lucide-react'; // Added Sparkles
import NextImage from 'next/image';
import { useCompletion } from '@ai-sdk/react';

export default function PresetGenerator() {
    const { session } = useAuth();

    const [selectedHero, setSelectedHero] = useState<string>(characters.find(c => c.id !== 'custom')?.id || '');
    const [heroName, setHeroName] = useState('');
    const [selectedSetting, setSelectedSetting] = useState<string>(settings.find(s => s.id !== 'custom')?.id || '');
    const [selectedLength, setSelectedLength] = useState<string>(storyLengths.find(l => l.id !== 'custom' && l.id === 'medium')?.id || storyLengths[0]?.id || ''); // Default to medium
    const [selectedMoral, setSelectedMoral] = useState<string>(morals.find(m => m.id === 'friendship')?.id || morals[0]?.id || ''); // Default to friendship

    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);

    const generateImage = useCallback(async (storyContent: string, storyId: string) => {
        if (!session?.user?.id || !storyContent || isLoadingImage) return;
        setIsLoadingImage(true);
        setGeneratedImageUrl(null);

        const firstParagraph = storyContent.split('\n\n')[0] || storyContent;
        const imagePrompt = `Children's storybook illustration style, depicting the main scene or feeling from: "${firstParagraph.substring(0, 250)}...". Simple, colorful, whimsical, friendly, focusing on ${heroName || selectedHero}.`;

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
                toast.success("Image Generated!");
                const updateResponse = await fetch(`/api/stories/${storyId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: imgData.imageUrl }),
                });
                const updateData = await updateResponse.json();
                if (!updateResponse.ok) console.warn("Failed to update story with image URL:", updateData.error);
            } else throw new Error("Image URL not found in response.");
        } catch (err: any) {
            console.error("Image generation or update error:", err);
            toast.error('Image Generation Failed', { description: err.message });
        } finally {
            setIsLoadingImage(false);
        }
    }, [session?.user?.id, isLoadingImage, heroName, selectedHero]);


    const {
        completion,
        complete,
        isLoading: isLoadingStory,
        error,
    } = useCompletion({
        api: '/api/generate-story',
        onFinish: async (_prompt, completionText) => {
            if (!session?.user?.id || !completionText) return;
            const storyDataForSaving = {
                hero: selectedHero,
                heroName: heroName.trim(),
                setting: selectedSetting,
                storyLength: selectedLength,
                moral: selectedMoral,
                theme: "N/A"
            };
            try {
                const saveResponse = await fetch('/api/stories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: session.user.id,
                        content: completionText.trim(),
                        character: storyDataForSaving.hero,
                        heroName: storyDataForSaving.heroName,
                        setting: storyDataForSaving.setting,
                        storyLength: storyDataForSaving.storyLength,
                        moral: storyDataForSaving.moral,
                        theme: storyDataForSaving.theme,
                    }),
                });
                const saveData = await saveResponse.json();
                if (!saveResponse.ok) {
                    toast.warning("Story generated, but failed to save.", { description: saveData.error });
                } else {
                    const savedStoryId = saveData.storyId;
                    setCurrentStoryId(savedStoryId);
                    if (completionText && savedStoryId) {
                        generateImage(completionText.trim(), savedStoryId);
                    }
                }
            } catch (err: any) {
                toast.error("Failed to save story.", { description: err.message });
            }
        },
        onError: (err) => {
            toast.error('Story Generation Failed', { description: err.message });
        },
    });

    useEffect(() => {
        if (isLoadingStory) {
            setGeneratedImageUrl(null);
            setCurrentStoryId(null);
        }
    }, [isLoadingStory]);

    const handlePresetSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitDisabled || !session?.user?.id) return;

        setGeneratedImageUrl(null);
        setCurrentStoryId(null);

        const heroLabel = characters.find(c => c.id === selectedHero)?.label || 'a character';
        const settingLabel = settings.find(s => s.id === selectedSetting)?.label || 'a place';
        const lengthLabel = storyLengths.find(l => l.id === selectedLength)?.label || 'a certain';
        const moralLabel = morals.find(m => m.id === selectedMoral)?.label || 'an important lesson';

        const userPrompt = `Write a children's bedtime story about a ${heroLabel.toLowerCase()} named "${heroName.trim()}".
        The story takes place in a ${settingLabel.toLowerCase()}.
        It should be a ${lengthLabel.toLowerCase().replace(' (~','').replace(' min)','')} story.
        The story should convey a moral about ${moralLabel.toLowerCase()}.
        Make it engaging, imaginative, and suitable for bedtime. Directly start with the story content.`;

        const payload = {
            userId: session.user.id,
            source: 'preset',
            // Send labels for better AI understanding if the API is generic
            characterType: selectedHero, // e.g. 'dragon'
            characterLabel: heroLabel,
            heroName: heroName.trim(),
            setting: selectedSetting, // e.g. 'magical-forest'
            settingLabel: settingLabel,
            storyLength: selectedLength, // e.g. 'short'
            storyLengthLabel: lengthLabel,
            moral: selectedMoral, // e.g. 'friendship'
            moralLabel: moralLabel,
        };
        complete(userPrompt, { body: { data: payload } });
    };

    const isSubmitDisabled =
        isLoadingStory || isLoadingImage ||
        !selectedHero || !heroName.trim() || !selectedSetting || !selectedLength || !selectedMoral;

    return (
        // Card-like container for the form and the generated story
        // Allow this main wrapper to be wider for the story card
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
                                    variant="outline" // Use outline and style selected state manually
                                    onClick={() => setSelectedHero(hero.id)}
                                    className={`flex flex-col items-center justify-center p-3 h-auto min-h-[70px] space-y-1 rounded-lg transition-all text-xs font-medium 
                                                border
                                                ${selectedHero === hero.id
                                                    ? 'bg-gray-800 text-white border-gray-800 ring-2 ring-gray-700' // Dark gray selected
                                                    : 'bg-gray-200 text-gray-700 border-gray-200 hover:bg-gray-300' // Light gray unselected
                                                }`}
                                >
                                    <hero.icon className={`h-5 w-5 mb-0.5 ${selectedHero === hero.id ? 'text-white' : hero.colorClass || 'text-gray-600'}`} />
                                    <span>{hero.label}</span>
                                </Button>
                            ))}
                        </div>
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
                                {settings.filter(s => s.id !== 'custom').map((setting) => (
                                    <SelectItem key={setting.id} value={setting.id} className="focus:bg-gray-100">
                                        {setting.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                                    ? 'bg-gray-500 text-white border-gray-500 ring-2 ring-gray-400' // Medium gray selected
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
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className={`w-full transition-transform duration-150 bg-gray-900 hover:bg-gray-800 text-white text-base font-semibold py-3
                                    ${isSubmitDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'
                            }`}
                        disabled={isSubmitDisabled}
                    >
                        {(isLoadingStory || isLoadingImage) ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-5 w-5" /> // Changed to Sparkles for variety
                        )}
                        Create My Story
                    </Button>
                     {error && (
                         <p className="text-sm text-red-600 text-center mt-2 flex items-center justify-center gap-1">
                             <AlertTriangle className="h-4 w-4" /> Story Error: {error.message}
                         </p>
                     )}
                 </form>
            </div>

             {/* Result Display Card - now outside the max-w-lg of the form card */}
             {(isLoadingStory || isLoadingImage || completion) && (
                 <div className="mt-10 bg-white text-gray-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
                     <div className="text-center">
                        <h3 className="font-semibold text-2xl text-gray-800">Generated Story</h3>
                        <p className="text-md text-gray-600 mt-1">Here's the magical tale crafted for you.</p>
                     </div>

                     {isLoadingImage && (
                         <div className="flex flex-col justify-center items-center h-72 bg-gray-50 rounded-lg border border-gray-200">
                             <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                             <p className="ml-2 text-gray-600 mt-3 text-base">Generating Illustration...</p>
                         </div>
                     )}
                     {generatedImageUrl && !isLoadingImage && (
                         <div className="flex justify-center my-6">
                             <NextImage src={generatedImageUrl} alt="Generated Story Illustration" width={512} height={512} className="rounded-xl shadow-xl border-2 border-gray-100" unoptimized />
                         </div>
                     )}
                     {!generatedImageUrl && !isLoadingImage && completion && currentStoryId && (
                        <div className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg border border-gray-200">
                            <ImageIcon className="inline-block h-6 w-6 mr-2 text-blue-500"/> 
                            <span className="align-middle text-base">Illustration coming soon...</span>
                        </div>
                    )}

                     {isLoadingStory && !completion && (
                         <div className="space-y-3 py-4">
                             <Skeleton className="h-5 w-full bg-gray-200 rounded" />
                             <Skeleton className="h-5 w-full bg-gray-200 rounded" />
                             <Skeleton className="h-5 w-[85%] bg-gray-200 rounded" />
                             <p className="text-base text-gray-500 text-center pt-3">Crafting your magical story...</p>
                         </div>
                     )}
                     {completion && (
                         <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                             {completion.split('\n\n').map((paragraph, index) => (
                                 paragraph.trim() && <p key={index} className="mb-4">{paragraph}</p>
                             ))}
                         </div>
                     )}
                 </div>
             )}
        </div>
    );
}