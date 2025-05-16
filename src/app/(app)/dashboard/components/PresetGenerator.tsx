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
  morals, // Ensure this is correctly exported from presetOptions.ts
  PresetOption
} from '@/config/presetOptions';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Wand2, Loader2, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import NextImage from 'next/image'; // Renamed to avoid conflict with ImageIcon
import { useCompletion } from '@ai-sdk/react';

// Helper function (can be moved to lib/utils if used elsewhere)
// const getFinalPresetValue = (selectedValue: string, customValue: string) => { // No longer needed for this UI
//   return selectedValue === 'custom' ? customValue.trim() : selectedValue;
// };

export default function PresetGenerator() {
    const { session } = useAuth();

    // --- New State for the "Quick Story Builder" UI ---
    const [selectedHero, setSelectedHero] = useState<string>(characters.find(c => c.id !== 'custom')?.id || '');
    const [heroName, setHeroName] = useState('');
    const [selectedSetting, setSelectedSetting] = useState<string>(settings.find(s => s.id !== 'custom')?.id || '');
    const [selectedLength, setSelectedLength] = useState<string>(storyLengths.find(l => l.id !== 'custom')?.id || '');
    const [selectedMoral, setSelectedMoral] = useState<string>(morals[0]?.id || ''); // Assuming morals exist and have at least one entry

    // --- Generation State (from original PresetGenerator) ---
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);

    // --- Generate Image (remains mostly the same from original) ---
    const generateImage = useCallback(async (storyContent: string, storyId: string) => {
        if (!session?.user?.id || !storyContent || isLoadingImage) return;
        setIsLoadingImage(true);
        setGeneratedImageUrl(null);

        const firstParagraph = storyContent.split('\n\n')[0] || storyContent;
        const imagePrompt = `Children's storybook illustration style, depicting the main scene or feeling from: "${firstParagraph.substring(0, 250)}...". Simple, colorful, whimsical, friendly, focusing on ${heroName || selectedHero}.`;

        console.log("Requesting image generation...");
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
                console.log(`Updating story ${storyId} with image URL...`);
                const updateResponse = await fetch(`/api/stories/${storyId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: imgData.imageUrl }),
                });
                const updateData = await updateResponse.json();
                if (!updateResponse.ok) console.warn("Failed to update story with image URL:", updateData.error);
                else console.log("Successfully associated image with story.");
            } else throw new Error("Image URL not found in response.");
        } catch (err: any) {
            console.error("Image generation or update error:", err);
            toast.error('Image Generation Failed', { description: err.message });
        } finally {
            setIsLoadingImage(false);
        }
    }, [session?.user?.id, isLoadingImage, heroName, selectedHero]);


    // --- useCompletion Hook (adapted for new inputs) ---
    const {
        completion,
        complete,
        isLoading: isLoadingStory,
        error,
        stop,
    } = useCompletion({
        api: '/api/generate-story',
        onFinish: async (_prompt, completionText) => {
            console.log("useCompletion onFinish triggered.");
            if (!session?.user?.id || !completionText) return;

            const storyDataForSaving = {
                hero: selectedHero, // The type of hero, e.g., 'dragon'
                heroName: heroName.trim(),
                setting: selectedSetting,
                storyLength: selectedLength,
                moral: selectedMoral,
                theme: "N/A" // Since theme is removed from UI, pass a default
            };

            try {
                console.log("Saving story text to database...");
                const saveResponse = await fetch('/api/stories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: session.user.id,
                        content: completionText.trim(),
                        character: storyDataForSaving.hero, // Map to existing 'character' field in DB
                        heroName: storyDataForSaving.heroName, // Potentially new field, or just part of content
                        setting: storyDataForSaving.setting,
                        storyLength: storyDataForSaving.storyLength,
                        moral: storyDataForSaving.moral,       // Potentially new field
                        theme: storyDataForSaving.theme,
                    }),
                });
                const saveData = await saveResponse.json();
                if (!saveResponse.ok) {
                    console.error("Failed to save story:", saveData.error);
                    toast.warning("Story generated, but failed to save.", { description: saveData.error });
                } else {
                    const savedStoryId = saveData.storyId;
                    console.log("Story saved with ID:", savedStoryId);
                    setCurrentStoryId(savedStoryId);
                    if (completionText && savedStoryId) {
                        generateImage(completionText.trim(), savedStoryId);
                    }
                }
            } catch (err: any) {
                console.error("Error saving story:", err);
                toast.error("Failed to save story.", { description: err.message });
            }
        },
        onError: (err) => {
            console.error("Story Generation Error (useCompletion):", err);
            toast.error('Story Generation Failed', { description: err.message });
        },
    });

    useEffect(() => {
        if (isLoadingStory) {
            setGeneratedImageUrl(null);
            setCurrentStoryId(null);
        }
    }, [isLoadingStory]);

    // --- Submit Handler (adapted for new UI) ---
    const handlePresetSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitDisabled || !session?.user?.id) return;

        setGeneratedImageUrl(null);
        setCurrentStoryId(null);

        const heroLabel = characters.find(c => c.id === selectedHero)?.label || 'a character';

        const userPrompt = `Write a children's bedtime story about a ${heroLabel.toLowerCase()} named "${heroName.trim()}".
        The story takes place in a ${settings.find(s => s.id === selectedSetting)?.label.toLowerCase()}.
        It should be a ${storyLengths.find(l => l.id === selectedLength)?.label.toLowerCase().replace(' (~','').replace(' min)','')} story.
        The story should convey a moral about ${morals.find(m => m.id === selectedMoral)?.label.toLowerCase()}.
        Make it engaging, imaginative, and suitable for bedtime. Directly start with the story content.`;

        const payload = {
            userId: session.user.id,
            source: 'preset', // Keep source as 'preset' or change if API differentiates
            characterType: selectedHero, // e.g. 'dragon'
            heroName: heroName.trim(),
            setting: selectedSetting,
            storyLength: selectedLength,
            moral: selectedMoral,
            // No explicit 'theme' is sent from UI
        };

        console.log("Triggering completion with prompt:", userPrompt);
        console.log("Sending body data:", payload);
        complete(userPrompt, { body: { data: payload } });
    };

    const isSubmitDisabled =
        isLoadingStory || isLoadingImage ||
        !selectedHero || !heroName.trim() || !selectedSetting || !selectedLength || !selectedMoral;

    return (
        // Converted to a single column layout for the form as per "Quick Story Builder"
        <div className="max-w-lg mx-auto space-y-8"> {/* Centered and max-width */}
             <form onSubmit={handlePresetSubmit} className="space-y-6">
                {/* Hero Selection */}
                <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">Choose Your Hero</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {characters.filter(c => c.id !== 'custom').map((hero) => (
                            <Button
                                key={hero.id}
                                type="button"
                                variant={selectedHero === hero.id ? 'default' : 'outline'}
                                onClick={() => setSelectedHero(hero.id)}
                                className={`flex flex-col items-center justify-center p-3 h-auto min-h-[80px] space-y-1 rounded-lg transition-all text-xs
                                            ${selectedHero === hero.id
                                                ? 'bg-gray-700 text-white shadow-md ring-2 ring-gray-500 dark:bg-purple-600 dark:ring-purple-400'
                                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-300 border-gray-300 dark:border-slate-600'
                                            }`}
                            >
                                <hero.icon className={`h-6 w-6 mb-1 ${selectedHero === hero.id ? 'text-white' : hero.colorClass.replace(/border-|bg-/g, '') || 'text-gray-700 dark:text-purple-400'}`} />
                                <span className="font-medium">{hero.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Hero's Name */}
                <div>
                    <Label htmlFor="heroName" className="text-sm font-medium text-gray-600 dark:text-gray-300">Hero's Name</Label>
                    <Input
                        id="heroName"
                        type="text"
                        value={heroName}
                        onChange={(e) => setHeroName(e.target.value)}
                        placeholder="Enter a name..."
                        className="mt-1 w-full dark:bg-slate-700 dark:border-slate-600"
                        required
                    />
                </div>

                {/* Story Setting */}
                <div>
                    <Label htmlFor="storySetting" className="text-sm font-medium text-gray-600 dark:text-gray-300">Story Setting</Label>
                    <Select value={selectedSetting} onValueChange={setSelectedSetting}>
                        <SelectTrigger id="storySetting" className="w-full mt-1 dark:bg-slate-700 dark:border-slate-600">
                            <SelectValue placeholder="Select a setting" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-700">
                            {settings.filter(s => s.id !== 'custom').map((setting) => (
                                <SelectItem key={setting.id} value={setting.id} className="dark:focus:bg-slate-600">
                                    {setting.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Story Length */}
                <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">Story Length</Label>
                    <div className="grid grid-cols-3 gap-3">
                        {storyLengths.filter(l => l.id !== 'custom').map((length) => (
                            <Button
                                key={length.id}
                                type="button"
                                variant={selectedLength === length.id ? 'default' : 'outline'}
                                onClick={() => setSelectedLength(length.id)}
                                className={`rounded-md text-sm h-10 ${selectedLength === length.id ? 'bg-gray-700 text-white dark:bg-purple-600' : 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-300 border-gray-300 dark:border-slate-600'}`}
                            >
                                {length.label.replace(' (~', '').replace(' Min)', '').replace('Medium', 'Med')} {/* Shorten label */}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Story Moral */}
                <div>
                    <Label htmlFor="storyMoral" className="text-sm font-medium text-gray-600 dark:text-gray-300">Story Moral</Label>
                    <Select value={selectedMoral} onValueChange={setSelectedMoral}>
                        <SelectTrigger id="storyMoral" className="w-full mt-1 dark:bg-slate-700 dark:border-slate-600">
                            <SelectValue placeholder="Select a moral" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-700">
                            {morals.map((moral) => (
                                <SelectItem key={moral.id} value={moral.id} className="dark:focus:bg-slate-600">
                                    {moral.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className={`w-full border-2 transition-transform duration-150 bg-gray-800 hover:bg-gray-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700 ${
                        isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'
                    }`}
                    disabled={isSubmitDisabled}
                >
                    {(isLoadingStory || isLoadingImage) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Create My Story
                </Button>
                 {error && (
                     <p className="text-sm text-destructive text-center mt-2 flex items-center justify-center gap-1">
                         <AlertTriangle className="h-4 w-4" /> Story Error: {error.message}
                     </p>
                 )}
             </form>

             {/* Result Display Card - This part remains similar */}
             {(isLoadingStory || isLoadingImage || completion) && (
                 <div className="border bg-card text-card-foreground rounded-xl shadow-sm p-6 space-y-6">
                     <div className="grid gap-1.5">
                        <h3 className="font-semibold text-lg">Generated Story</h3>
                        <p className="text-sm text-muted-foreground">Here's the magical tale crafted for you.</p>
                     </div>

                     {isLoadingImage && (
                         <div className="flex justify-center items-center h-64 bg-muted rounded-md">
                             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                             <p className="ml-2 text-muted-foreground">Generating Illustration...</p>
                         </div>
                     )}
                     {generatedImageUrl && !isLoadingImage && (
                         <div className="flex justify-center">
                             <NextImage src={generatedImageUrl} alt="Generated Story Illustration" width={512} height={512} className="rounded-lg shadow-md" unoptimized />
                         </div>
                     )}
                     {!generatedImageUrl && !isLoadingImage && completion && currentStoryId && (
                        <div className="text-center text-muted-foreground py-4">
                            <ImageIcon className="inline-block h-5 w-5 mr-1"/> Image will appear here once generated.
                        </div>
                    )}

                     {isLoadingStory && !completion && (
                         <div className="space-y-2">
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-[75%]" />
                             <p className="text-sm text-muted-foreground text-center mt-2">Generating story text...</p>
                         </div>
                     )}
                     {completion && (
                         <div className="prose dark:prose-invert max-w-none">
                             {completion.split('\n\n').map((paragraph, index) => (
                                 paragraph.trim() && <p key={index}>{paragraph}</p>
                             ))}
                         </div>
                     )}
                 </div>
             )}
        </div>
    );
}