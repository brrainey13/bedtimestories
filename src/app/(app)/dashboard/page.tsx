// src/app/(app)/dashboard/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, useCallback, useMemo } from 'react';
// Removed 'ai' import, useChat handles stream parsing
import { useChat, Message } from '@ai-sdk/react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PresetSelector from '@/components/presets/PresetSelector';
import { themes, characters, settings, storyLengths } from '@/config/presetOptions'; // Removed PresetOption type if unused here
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { SendHorizonal, Bot, User, Wand2, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function DashboardPage() {
  const { session } = useAuth();

  // --- Preset State ---
  const [selectedTheme, setSelectedTheme] = useState('');
  const [customTheme, setCustomTheme] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [customCharacter, setCustomCharacter] = useState('');
  const [selectedSetting, setSelectedSetting] = useState('');
  const [customSetting, setCustomSetting] = useState('');
  const [selectedLength, setSelectedLength] = useState('');
  const [customLength, setCustomLength] = useState('');
  const [activeTab, setActiveTab] = useState('presets'); // Track the active tab

  // --- Image State ---
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  // Store the ID of the message for which the image was generated
  const [imageForMessageId, setImageForMessageId] = useState<string | null>(null);

  // --- Utility Function ---
  const getFinalPresetValue = (selectedValue: string, customValue: string) => {
    return selectedValue === 'custom' ? customValue : selectedValue;
  };

   // --- Image Generation Trigger ---
   const generateImageForStory = useCallback(async (storyText: string, messageId: string) => {
    if (!session?.user?.id || !storyText || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setGeneratedImageUrl(null); // Clear previous image if generating new
    setImageForMessageId(messageId); // Associate image with this message

    // Construct a prompt for the image based on presets or story summary
    // Use presets only if the *current* active tab WAS presets when submit happened
    // Or, more simply, derive from story text content
    const firstParagraph = storyText.split('\n\n')[0] || storyText;
    const imagePrompt = `Children's storybook illustration style, depicting the main scene or feeling from: "${firstParagraph.substring(0, 200)}...". Simple, colorful, whimsical.`;

    console.log("Requesting image generation with prompt:", imagePrompt);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, userId: session.user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Image generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        toast.success("Image Generated!", { description: "An illustration for your story." });
      } else {
          throw new Error("Image URL not found in response.");
      }

    } catch (error: any) {
      console.error("Image generation error:", error);
      toast.error('Image Generation Error', { description: error.message });
    } finally {
      setIsGeneratingImage(false);
    }
  }, [session?.user?.id, isGeneratingImage]); // Removed preset state dependencies


  // --- useChat Hook Setup ---
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit, // Rename to avoid conflict
    isLoading: isChatLoading, // isLoading now refers to the whole useChat cycle
    error, // General error from useChat
    reload,
    stop,
    append, // We'll use append for presets
    setMessages // To potentially clear messages
  } = useChat({
    api: '/api/generate-story', // API endpoint for text generation
     // We'll pass userId in the body data for each request instead
    // initialMessages: [], // Start with empty messages
    // Send user ID with every message
    body: {
        userId: session?.user?.id,
    },
    // Trigger image generation when assistant message finishes
    onFinish: (message: Message) => {
        console.log("useChat onFinish triggered for message:", message.id, "Role:", message.role);
        // Check if the finished message is from the assistant and we are in preset mode or need an image
        // This logic might need refinement depending on exactly when you want images
         if (message.role === 'assistant' && activeTab === 'presets') {
             console.log("Assistant finished in preset tab, triggering image generation.");
             generateImageForStory(message.content, message.id);
         } else if (message.role === 'assistant' /* && some_other_condition_for_chat_images */) {
             // Optionally trigger image generation for chat messages too
             // generateImageForStory(message.content, message.id);
         }
    },
    onError: (err: Error) => {
        toast.error('Story Generation Error', {
            description: err.message || 'Failed to get response.',
        });
    },
  });


  // --- Custom Submit Handler for Presets ---
  const handlePresetSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isPresetSubmitDisabled || !session?.user?.id) return;

     // Clear previous non-chat messages and image state before submitting
     // Keep chat messages if user switches tabs back and forth
     // setMessages([]); // Option 1: Clear all messages
     setGeneratedImageUrl(null);
     setImageForMessageId(null);
     setIsGeneratingImage(false);

    const presetPayload = {
      userId: session.user.id,
      theme: getFinalPresetValue(selectedTheme, customTheme),
      character: getFinalPresetValue(selectedCharacter, customCharacter),
      setting: getFinalPresetValue(selectedSetting, customSetting),
      storyLength: getFinalPresetValue(selectedLength, customLength),
      source: 'preset', // Indicate the source
    };

    console.log("Submitting presets with payload:", presetPayload);

    // Use `append` to send preset data. We send a dummy user message
    // because `useChat` expects a message, but our API route will ignore it
    // and use the 'data' payload instead when source === 'preset'.
     append(
         { role: 'user', content: 'Generate story from presets.' }, // Dummy message content
         { data: presetPayload } // Send actual preset data here
     );
  };

  // --- Derived State ---
  const isPresetSubmitDisabled =
    isChatLoading || isGeneratingImage || // Use useChat's isLoading
    (!selectedTheme || (selectedTheme === 'custom' && !customTheme)) ||
    (!selectedCharacter || (selectedCharacter === 'custom' && !customCharacter)) ||
    (!selectedSetting || (selectedSetting === 'custom' && !customSetting)) ||
    (!selectedLength || (selectedLength === 'custom' && !customLength));

  // Determine which message content to display in the preset result card
   const presetResultMessage = useMemo(() => {
       // Find the last assistant message associated with the generated image
       if (imageForMessageId) {
           return messages.find(m => m.id === imageForMessageId && m.role === 'assistant');
       }
       // If no image yet, find the last assistant message (could be from presets or chat)
       return messages.filter(m => m.role === 'assistant').pop();
   }, [messages, imageForMessageId]);

   const presetStoryContent = presetResultMessage?.content ?? null;


  // --- JSX ---
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Create Your Magical Story</h1>
      <p className="text-muted-foreground text-center">
        Choose your adventure! Use presets for guided creation or chat directly with our story AI.
      </p>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets"><Wand2 className="mr-2 h-4 w-4" />Presets</TabsTrigger>
          <TabsTrigger value="chat"><Bot className="mr-2 h-4 w-4" />Chat</TabsTrigger>
        </TabsList>

        {/* --- Presets Tab --- */}
         <TabsContent value="presets" className="mt-6">
             {/* Preset Form */}
             <form onSubmit={handlePresetSubmit} className="space-y-8 mb-10">
                {/* PresetSelectors go here - same as before */}
                 <PresetSelector title="Choose a Theme" options={themes} selectedValue={selectedTheme} onValueChange={setSelectedTheme} customValue={customTheme} onCustomValueChange={setCustomTheme} customPlaceholder="E.g., A story about overcoming shyness" isTextArea={true} />
                 <PresetSelector title="Select Your Hero" options={characters} selectedValue={selectedCharacter} onValueChange={setSelectedCharacter} customValue={customCharacter} onCustomValueChange={setCustomCharacter} customPlaceholder="E.g., A brave squirrel with a tiny sword" isTextArea={true} />
                 <PresetSelector title="Pick the Perfect Setting" options={settings} selectedValue={selectedSetting} onValueChange={setSelectedSetting} customValue={customSetting} onCustomValueChange={setCustomSetting} customPlaceholder="E.g., A bustling city made of clouds" isTextArea={true} />
                 <PresetSelector title="Choose a Story Length" options={storyLengths} selectedValue={selectedLength} onValueChange={setSelectedLength} customValue={customLength} onCustomValueChange={setCustomLength} customPlaceholder="E.g., 7 minutes" isTextArea={false} />

                 <Button type="submit" size="lg" className="w-full" disabled={isPresetSubmitDisabled}>
                     {(isChatLoading || isGeneratingImage) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                     Generate Story & Image with Presets
                 </Button>
                 {error && <p className="text-sm text-destructive text-center">{error.message}</p>} {/* Display general useChat error */}
             </form>

             {/* Preset Result Display Card - Shows the result of the *last* assistant message */}
             {(isChatLoading || presetStoryContent) && (
                 <Card>
                     <CardHeader>
                         <CardTitle>Generated Story</CardTitle>
                         <CardDescription>Here's the story created from your presets.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-6">
                         {/* Image Display */}
                         {isGeneratingImage && (
                             <div className="flex justify-center items-center h-64 bg-muted rounded-md">
                                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                             </div>
                         )}
                         {generatedImageUrl && !isGeneratingImage && imageForMessageId === presetResultMessage?.id && (
                             <div className="flex justify-center">
                                 <Image src={generatedImageUrl} alt="Generated Story Illustration" width={512} height={512} className="rounded-lg shadow-md" unoptimized />
                             </div>
                         )}
                          {!generatedImageUrl && !isGeneratingImage && presetStoryContent && (
                            <div className="text-center text-muted-foreground">
                                <ImageIcon className="inline-block h-5 w-5 mr-1"/> Image will appear here once generated.
                            </div>
                        )}


                         {/* Text Display */}
                         {isChatLoading && !presetStoryContent && (
                             <div className="space-y-2">
                                 <Skeleton className="h-4 w-full" />
                                 <Skeleton className="h-4 w-full" />
                                 <Skeleton className="h-4 w-[75%]" />
                             </div>
                         )}
                         {presetStoryContent && (
                             <div className="prose dark:prose-invert max-w-none">
                                 {presetStoryContent.split('\n\n').map((paragraph, index) => (
                                     <p key={index}>{paragraph}</p>
                                 ))}
                             </div>
                         )}
                     </CardContent>
                 </Card>
             )}
         </TabsContent>


        {/* --- Chat Tab --- */}
        <TabsContent value="chat" className="mt-6 flex flex-col h-[60vh]">
            <ScrollArea className="flex-grow p-4 border rounded-md mb-4 bg-muted/50">
                 {messages.length === 0 && !isChatLoading && (
                    <p className="text-center text-muted-foreground p-8">
                        Start chatting with the story AI! Ask it to write a story about anything you can imagine.
                    </p>
                 )}
                {messages.map((m) => (
                    // Filter out the dummy preset message if needed, or adjust API not to require it
                    m.role === 'user' && m.content === 'Generate story from presets.' ? null : (
                     <div key={m.id} className={cn("mb-4 flex gap-3", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                        {m.role !== 'user' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                        <div
                            className={cn(
                                "p-3 rounded-lg max-w-[75%]",
                                m.role === 'user'
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-background border rounded-bl-none"
                            )}
                        >
                             {/* Render message content - could enhance to show tool calls later */}
                            <p className="whitespace-pre-wrap">{m.content}</p>
                            {/* Optionally display image associated with this assistant message */}
                             {m.role === 'assistant' && m.id === imageForMessageId && generatedImageUrl && !isGeneratingImage && (
                                 <div className="mt-2 border-t pt-2">
                                      <Image src={generatedImageUrl} alt="Illustration" width={256} height={256} className="rounded-md" unoptimized/>
                                 </div>
                             )}
                        </div>
                        {m.role === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                    </div>
                    )
                ))}
                 {/* Display loading indicator at the end if chat is loading */}
                 {isChatLoading && (
                     <div className="flex justify-start gap-3 mb-4">
                         <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                         <div className="p-3 rounded-lg bg-background border rounded-bl-none">
                             <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                         </div>
                     </div>
                 )}
            </ScrollArea>

           {/* Standard chat input form */}
           <form onSubmit={originalHandleSubmit} className="flex gap-2 items-center">
             <Textarea
              name="prompt" // Ensure name is prompt for useChat's default handler
              value={input}
              onChange={handleInputChange}
              placeholder="Tell the AI what kind of story you want..."
              className="flex-grow resize-none"
              rows={1}
              disabled={isChatLoading || isGeneratingImage} // Disable while anything is loading
            />
            <Button type="submit" size="icon" disabled={isChatLoading || isGeneratingImage || !input.trim()}>
              <SendHorizonal className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
            {(isChatLoading || isGeneratingImage) && (
                <Button type="button" variant="outline" size="icon" onClick={stop}>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="sr-only">Stop</span>
                </Button>
            )}
          </form>
           {error && <p className="text-sm text-destructive text-center mt-2">{error.message}</p>}
        </TabsContent>
      </Tabs>

    </div>
  );
}