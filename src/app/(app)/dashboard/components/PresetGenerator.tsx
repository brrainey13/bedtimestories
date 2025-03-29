// src/app/(app)/dashboard/components/PresetGenerator.tsx
'use client';

import React, { useState, FormEvent, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PresetSelector from '@/components/presets/PresetSelector';
import { themes, characters, settings, storyLengths } from '@/config/presetOptions';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Wand2, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

// Helper function (can be moved to lib/utils if used elsewhere)
const getFinalPresetValue = (selectedValue: string, customValue: string) => {
  return selectedValue === 'custom' ? customValue.trim() : selectedValue;
};

export default function PresetGenerator() {
    const { session } = useAuth();

    // Preset State
    const [selectedTheme, setSelectedTheme] = useState('');
    const [customTheme, setCustomTheme] = useState('');
    const [selectedCharacter, setSelectedCharacter] = useState('');
    const [customCharacter, setCustomCharacter] = useState('');
    const [selectedSetting, setSelectedSetting] = useState('');
    const [customSetting, setCustomSetting] = useState('');
    const [selectedLength, setSelectedLength] = useState('');
    const [customLength, setCustomLength] = useState('');

    // Generation State
    const [isLoadingStory, setIsLoadingStory] = useState(false);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [generatedStory, setGeneratedStory] = useState<string | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [currentStoryId, setCurrentStoryId] = useState<string | null>(null); // Store ID for image update
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setIsLoadingStory(false);
        setIsLoadingImage(false);
        setGeneratedStory(null);
        setGeneratedImageUrl(null);
        setCurrentStoryId(null);
        setError(null);
    };

    // --- Generate Image ---
    const generateImage = useCallback(async (storyContent: string, storyId: string) => {
        if (!session?.user?.id || !storyContent || isLoadingImage) return;
        setIsLoadingImage(true);
        setGeneratedImageUrl(null); // Clear previous image
        setError(null);

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

                // Now, update the story record with the image URL
                console.log(`Updating story ${storyId} with image URL...`);
                const updateResponse = await fetch(`/api/stories/${storyId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: imgData.imageUrl }),
                });
                const updateData = await updateResponse.json();
                 if (!updateResponse.ok) {
                    console.warn("Failed to update story with image URL:", updateData.error);
                    // Don't necessarily throw an error, but log it
                 } else {
                    console.log("Successfully associated image with story.");
                 }

            } else {
                throw new Error("Image URL not found in response.");
            }
        } catch (err: any) {
            console.error("Image generation or update error:", err);
            setError(`Image Error: ${err.message}`);
            toast.error('Image Generation Failed', { description: err.message });
        } finally {
            setIsLoadingImage(false);
        }
    }, [session?.user?.id, isLoadingImage]); // Removed dependency on currentStoryId as it's passed directly


    // --- Generate Story (using fetch directly) ---
    const handlePresetSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitDisabled || !session?.user?.id) return;

        resetState(); // Clear previous results
        setIsLoadingStory(true);

        const presets = {
            theme: getFinalPresetValue(selectedTheme, customTheme),
            character: getFinalPresetValue(selectedCharacter, customCharacter),
            setting: getFinalPresetValue(selectedSetting, customSetting),
            storyLength: getFinalPresetValue(selectedLength, customLength),
        };

        const payload = {
            userId: session.user.id,
            source: 'preset',
            ...presets // Include theme, character, etc.
        };

        console.log("Submitting presets:", payload);

        try {
            // 1. Call generate-story API
            const response = await fetch('/api/generate-story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: payload }), // Send presets in 'data'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Story generation failed: ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error("Response body is null");
            }

            // 2. Process the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let storyContent = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                storyContent += chunk;
                setGeneratedStory(storyContent); // Update state progressively
            }
            const finalStoryText = storyContent.trim(); // Get final complete text
             setGeneratedStory(finalStoryText); // Set final text
            console.log("Story generation finished.");
            toast.success("Story Generated!");

            // 3. Save the generated story text to DB
            console.log("Saving story text to database...");
            const saveResponse = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.user.id,
                    content: finalStoryText,
                    ...presets // Send presets data for saving
                }),
            });

            const saveData = await saveResponse.json();

            if (!saveResponse.ok) {
                console.error("Failed to save story:", saveData.error);
                // Continue to image generation but maybe show a warning
                toast.warning("Story generated, but failed to save.", { description: saveData.error });
            } else {
                const savedStoryId = saveData.storyId;
                console.log("Story saved with ID:", savedStoryId);
                setCurrentStoryId(savedStoryId); // Store the ID

                // 4. Trigger image generation now that we have the story and its ID
                if (finalStoryText && savedStoryId) {
                    generateImage(finalStoryText, savedStoryId);
                }
            }

        } catch (err: any) {
            console.error("Story generation or saving error:", err);
            setError(`Story Error: ${err.message}`);
            toast.error('Story Generation Failed', { description: err.message });
        } finally {
            setIsLoadingStory(false); // Story text loading is finished here
            // Image loading state is handled separately in generateImage
        }
    };


    // Derived State
    const isSubmitDisabled =
        isLoadingStory || isLoadingImage ||
        (!selectedTheme || (selectedTheme === 'custom' && !customTheme)) ||
        (!selectedCharacter || (selectedCharacter === 'custom' && !customCharacter)) ||
        (!selectedSetting || (selectedSetting === 'custom' && !customSetting)) ||
        (!selectedLength || (selectedLength === 'custom' && !customLength));


    return (
        <div className="space-y-8">
             {/* Preset Form */}
             <form onSubmit={handlePresetSubmit} className="space-y-8 mb-10">
                 <PresetSelector title="Choose a Theme" options={themes} selectedValue={selectedTheme} onValueChange={setSelectedTheme} customValue={customTheme} onCustomValueChange={setCustomTheme} customPlaceholder="E.g., A story about overcoming shyness" isTextArea={true} />
                 <PresetSelector title="Select Your Hero" options={characters} selectedValue={selectedCharacter} onValueChange={setSelectedCharacter} customValue={customCharacter} onCustomValueChange={setCustomCharacter} customPlaceholder="E.g., A brave squirrel with a tiny sword" isTextArea={true} />
                 <PresetSelector title="Pick the Perfect Setting" options={settings} selectedValue={selectedSetting} onValueChange={setSelectedSetting} customValue={customSetting} onCustomValueChange={setCustomSetting} customPlaceholder="E.g., A bustling city made of clouds" isTextArea={true} />
                 <PresetSelector title="Choose a Story Length" options={storyLengths} selectedValue={selectedLength} onValueChange={setSelectedLength} customValue={customLength} onCustomValueChange={setCustomLength} customPlaceholder="E.g., 7 minutes" isTextArea={false} />

                 <Button type="submit" size="lg" className="w-full" disabled={isSubmitDisabled}>
                     {(isLoadingStory || isLoadingImage) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                     Generate Story & Image with Presets
                 </Button>
                 {error && <p className="text-sm text-destructive text-center mt-2">{error}</p>}
             </form>

             {/* Result Display Card */}
             {(isLoadingStory || isLoadingImage || generatedStory) && (
                 <Card>
                     <CardHeader>
                         <CardTitle>Generated Story</CardTitle>
                         <CardDescription>Here's the magical tale crafted from your selections.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-6">
                         {/* Image Display */}
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
                         {!generatedImageUrl && !isLoadingImage && generatedStory && currentStoryId && ( // Show placeholder only if story done, ID exists, and image not loading/loaded
                            <div className="text-center text-muted-foreground py-4">
                                <ImageIcon className="inline-block h-5 w-5 mr-1"/> Image will appear here once generated.
                            </div>
                        )}


                         {/* Text Display */}
                         {isLoadingStory && !generatedStory && ( // Show skeleton only during initial story load
                             <div className="space-y-2">
                                 <Skeleton className="h-4 w-full" />
                                 <Skeleton className="h-4 w-full" />
                                 <Skeleton className="h-4 w-[75%]" />
                                 <p className="text-sm text-muted-foreground text-center mt-2">Generating story text...</p>
                             </div>
                         )}
                         {generatedStory && (
                             <div className="prose dark:prose-invert max-w-none">
                                 {/* Render paragraphs nicely */}
                                 {generatedStory.split('\n\n').map((paragraph, index) => (
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