// src/app/(app)/dashboard/components/PresetGenerator.tsx
'use client';

import React, { useState, FormEvent, useCallback, useEffect } from 'react'; // Added useEffect
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PresetSelector from '@/components/presets/PresetSelector';
import { themes, characters, settings, storyLengths } from '@/config/presetOptions';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Wand2, Loader2, Image as ImageIcon, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import Image from 'next/image';
import { useCompletion } from '@ai-sdk/react'; // <--- IMPORT useCompletion

// Helper function (can be moved to lib/utils if used elsewhere)
const getFinalPresetValue = (selectedValue: string, customValue: string) => {
  return selectedValue === 'custom' ? customValue.trim() : selectedValue;
};

export default function PresetGenerator() {
    const { session } = useAuth();

    // Preset State (remains the same)
    const [selectedTheme, setSelectedTheme] = useState('');
    const [customTheme, setCustomTheme] = useState('');
    const [selectedCharacter, setSelectedCharacter] = useState('');
    const [customCharacter, setCustomCharacter] = useState('');
    const [selectedSetting, setSelectedSetting] = useState('');
    const [customSetting, setCustomSetting] = useState('');
    const [selectedLength, setSelectedLength] = useState('');
    const [customLength, setCustomLength] = useState('');

    // Generation State (simplified)
    // isLoadingStory comes from useCompletion now
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
    // error comes from useCompletion now

    // --- Generate Image (remains mostly the same) ---
    const generateImage = useCallback(async (storyContent: string, storyId: string) => {
        if (!session?.user?.id || !storyContent || isLoadingImage) return;
        setIsLoadingImage(true);
        setGeneratedImageUrl(null); // Clear previous image

        const firstParagraph = storyContent.split('\n\n')[0] || storyContent;
        const imagePrompt = `Children's storybook illustration style, depicting the main scene or feeling from: "${firstParagraph.substring(0, 250)}...". Simple, colorful, whimsical, friendly.`;

        console.log("Requesting image generation...");
        try {
            const imgResponse = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: imagePrompt, userId: session.user.id }),
            });

            const imgData = await imgResponse.json();

            if (!imgResponse.ok) {
                throw new Error(imgData.error || `Image generation failed: ${imgResponse.statusText}`);
            }

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
                 if (!updateResponse.ok) {
                    console.warn("Failed to update story with image URL:", updateData.error);
                 } else {
                    console.log("Successfully associated image with story.");
                 }
            } else {
                throw new Error("Image URL not found in response.");
            }
        } catch (err: any) {
            console.error("Image generation or update error:", err);
            toast.error('Image Generation Failed', { description: err.message });
        } finally {
            setIsLoadingImage(false);
        }
    }, [session?.user?.id, isLoadingImage]);


    // --- useCompletion Hook ---
    const {
        completion, // This holds the streamed, clean text content
        input,      // We can use this if needed, but presets drive the prompt
        // handleInputChange, // Not directly needed if only using presets
        complete,   // Function to trigger the completion API call
        isLoading: isLoadingStory, // isLoading is now managed by the hook
        error,      // Error state from the hook
        stop,       // Function to stop the stream
    } = useCompletion({
        api: '/api/generate-story', // Your existing story generation endpoint
        onFinish: async (_prompt, completionText) => {
            // This callback fires when the AI stream *finishes*
            console.log("useCompletion onFinish triggered.");
            if (!session?.user?.id || !completionText) return;

            // Get final preset values for saving
            const presets = {
                theme: getFinalPresetValue(selectedTheme, customTheme),
                character: getFinalPresetValue(selectedCharacter, customCharacter),
                setting: getFinalPresetValue(selectedSetting, customSetting),
                storyLength: getFinalPresetValue(selectedLength, customLength),
            };

            // --- Save Story ---
            try {
                console.log("Saving story text to database...");
                const saveResponse = await fetch('/api/stories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: session.user.id,
                        content: completionText.trim(), // Use the final text from the hook
                        ...presets
                    }),
                });
                const saveData = await saveResponse.json();
                if (!saveResponse.ok) {
                    console.error("Failed to save story:", saveData.error);
                    toast.warning("Story generated, but failed to save.", { description: saveData.error });
                } else {
                    const savedStoryId = saveData.storyId;
                    console.log("Story saved with ID:", savedStoryId);
                    setCurrentStoryId(savedStoryId); // Store the ID for image generation

                    // --- Generate Image ---
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
            // No need for separate setError state, use hook's error
        },
        // We'll construct the body inside handlePresetSubmit when calling `complete`
    });

    // Reset image/story ID when loading starts
    useEffect(() => {
        if (isLoadingStory) {
            setGeneratedImageUrl(null);
            setCurrentStoryId(null);
        }
    }, [isLoadingStory]);

    // --- Submit Handler (using useCompletion) ---
    const handlePresetSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitDisabled || !session?.user?.id) return;

        // Reset image/story ID state explicitly on new submission
        setGeneratedImageUrl(null);
        setCurrentStoryId(null);

        // 1. Get final preset values
        const presets = {
            theme: getFinalPresetValue(selectedTheme, customTheme),
            character: getFinalPresetValue(selectedCharacter, customCharacter),
            setting: getFinalPresetValue(selectedSetting, customSetting),
            storyLength: getFinalPresetValue(selectedLength, customLength),
        };

        // 2. Construct the prompt for the AI
        const userPrompt = `Write a children's bedtime story with the following elements:
        - Theme: ${presets.theme}
        - Main Character: ${presets.character}
        - Setting: ${presets.setting}
        - Desired Length: Approximately ${presets.storyLength} reading time. Make it engaging and imaginative.`;

        // 3. Construct the payload to send in the body (for endpoint validation/info)
        const payload = {
            userId: session.user.id,
            source: 'preset',
            ...presets
        };

        console.log("Triggering completion with prompt:", userPrompt);
        console.log("Sending body data:", payload);

        // 4. Call the `complete` function from useCompletion
        // Pass the prompt as the first argument
        // Pass the payload (including presets and userId) in the `body` option
        complete(userPrompt, { body: { data: payload } }); // Pass payload within 'data' key

        // No need for manual fetch, stream reading, or setIsLoadingStory(true)
        // useCompletion handles loading state and stream processing.
    };


    // Derived State (remains the same)
    const isSubmitDisabled =
        isLoadingStory || isLoadingImage ||
        (!selectedTheme || (selectedTheme === 'custom' && !customTheme)) ||
        (!selectedCharacter || (selectedCharacter === 'custom' && !customCharacter)) ||
        (!selectedSetting || (selectedSetting === 'custom' && !customSetting)) ||
        (!selectedLength || (selectedLength === 'custom' && !customLength));

    return (
        <div className="space-y-8">
             {/* Preset Form (remains the same) */}
             <form onSubmit={handlePresetSubmit} className="space-y-8 mb-10">
                 <PresetSelector title="Choose a Theme" options={themes} selectedValue={selectedTheme} onValueChange={setSelectedTheme} customValue={customTheme} onCustomValueChange={setCustomTheme} customPlaceholder="E.g., A story about overcoming shyness" isTextArea={true} />
                 <PresetSelector title="Select Your Hero" options={characters} selectedValue={selectedCharacter} onValueChange={setSelectedCharacter} customValue={customCharacter} onCustomValueChange={setCustomCharacter} customPlaceholder="E.g., A brave squirrel with a tiny sword" isTextArea={true} />
                 <PresetSelector title="Pick the Perfect Setting" options={settings} selectedValue={selectedSetting} onValueChange={setSelectedSetting} customValue={customSetting} onCustomValueChange={setCustomSetting} customPlaceholder="E.g., A bustling city made of clouds" isTextArea={true} />
                 <PresetSelector title="Choose a Story Length" options={storyLengths} selectedValue={selectedLength} onValueChange={setSelectedLength} customValue={customLength} onCustomValueChange={setCustomLength} customPlaceholder="E.g., 7 minutes" isTextArea={false} />

                 <Button type="submit" size="lg" className="w-full" disabled={isSubmitDisabled}>
                     {(isLoadingStory || isLoadingImage) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                     Generate Story & Image with Presets
                 </Button>
                 {/* Display error from the hook */}
                 {error && (
                     <p className="text-sm text-destructive text-center mt-2 flex items-center justify-center gap-1">
                         <AlertTriangle className="h-4 w-4" /> Story Error: {error.message}
                     </p>
                 )}
             </form>

             {/* Result Display Card */}
             {/* Show card if loading *or* if completion text exists */}
             {(isLoadingStory || isLoadingImage || completion) && (
                 <Card>
                     <CardHeader>
                         <CardTitle>Generated Story</CardTitle>
                         <CardDescription>Here's the magical tale crafted from your selections.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-6">
                         {/* Image Display (remains the same logic) */}
                         {isLoadingImage && (
                             <div className="flex justify-center items-center h-64 bg-muted rounded-md">
                                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                 <p className="ml-2 text-muted-foreground">Generating Illustration...</p>
                             </div>
                         )}
                         {generatedImageUrl && !isLoadingImage && (
                             <div className="flex justify-center">
                                 <Image src={generatedImageUrl} alt="Generated Story Illustration" width={512} height={512} className="rounded-lg shadow-md" unoptimized />
                             </div>
                         )}
                         {!generatedImageUrl && !isLoadingImage && completion && currentStoryId && (
                            <div className="text-center text-muted-foreground py-4">
                                <ImageIcon className="inline-block h-5 w-5 mr-1"/> Image will appear here once generated.
                            </div>
                        )}

                         {/* Text Display */}
                         {isLoadingStory && !completion && ( // Show skeleton only during initial story load
                             <div className="space-y-2">
                                 <Skeleton className="h-4 w-full" />
                                 <Skeleton className="h-4 w-full" />
                                 <Skeleton className="h-4 w-[75%]" />
                                 <p className="text-sm text-muted-foreground text-center mt-2">Generating story text...</p>
                             </div>
                         )}
                         {/* Render the 'completion' state which streams clean text */}
                         {completion && (
                             <div className="prose dark:prose-invert max-w-none">
                                 {completion.split('\n\n').map((paragraph, index) => (
                                     paragraph.trim() && <p key={index}>{paragraph}</p>
                                 ))}
                             </div>
                         )}
                     </CardContent>
                 </Card>
             )}
        </div>
    );
}