// src/app/(app)/dashboard/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PresetSelector from '@/components/presets/PresetSelector';
import { themes, characters, settings, storyLengths, PresetOption } from '@/config/presetOptions';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner'; // <-- Import from sonner
import { SendHorizonal, Bot, User, Wand2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { session } = useAuth();
  // No longer need useToast -> const { toast } = useToast();

  // --- Preset State ---
  const [selectedTheme, setSelectedTheme] = useState('');
  const [customTheme, setCustomTheme] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [customCharacter, setCustomCharacter] = useState('');
  const [selectedSetting, setSelectedSetting] = useState('');
  const [customSetting, setCustomSetting] = useState('');
  const [selectedLength, setSelectedLength] = useState('');
  const [customLength, setCustomLength] = useState('');
  const [isPresetLoading, setIsPresetLoading] = useState(false);
  const [presetError, setPresetError] = useState<string | null>(null);

  // --- Chat State (using Vercel AI SDK) ---
  const {
    messages: chatMessages,
    input: chatInput,
    handleInputChange: handleChatInputChange,
    handleSubmit: handleChatSubmit,
    isLoading: isChatLoading,
    error: chatError,
    reload: reloadChat,
    stop: stopChat,
  } = useChat({
    api: '/api/generate-story',
    body: {
      userId: session?.user?.id,
    },
    onError: (err: any) => {
      // Use sonner toast for chat errors
      toast.error('Chat Error', {
        description: err.message || 'Failed to get response from chat.',
      });
    },
  });

  // --- Result State ---
  const [generatedStoryContent, setGeneratedStoryContent] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // --- Derived State ---
  const isPresetSubmitDisabled =
    isPresetLoading ||
    (!selectedTheme || (selectedTheme === 'custom' && !customTheme)) ||
    (!selectedCharacter || (selectedCharacter === 'custom' && !customCharacter)) ||
    (!selectedSetting || (selectedSetting === 'custom' && !customSetting)) ||
    (!selectedLength || (selectedLength === 'custom' && !customLength));

  // --- Handlers ---
  const handlePresetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPresetSubmitDisabled || !session?.user?.id) return;

    setIsPresetLoading(true);
    setPresetError(null);
    setGeneratedStoryContent(null);
    setGeneratedImageUrl(null);

    const payload = {
      userId: session.user.id,
      theme: selectedTheme === 'custom' ? customTheme : selectedTheme,
      character: selectedCharacter === 'custom' ? customCharacter : selectedCharacter,
      setting: selectedSetting === 'custom' ? customSetting : selectedSetting,
      storyLength: selectedLength === 'custom' ? customLength : selectedLength,
      source: 'preset',
    };

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }

      // Handle streaming response for presets
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let done = false;

      while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: true });

          // Extremely basic handling (needs improvement for robust stream parsing)
          const textMatch = chunk.match(/0:"([^"]*)"/);
          if (textMatch && textMatch[1]) {
              fullText += JSON.parse(`"${textMatch[1]}"`);
              setGeneratedStoryContent(fullText);
          }
      }
      setGeneratedStoryContent(fullText); // Final update

      // Use sonner for success
      toast.success("Story Generated!", {
        description: "Your story from presets has been created.",
      });

    } catch (error: any) {
      console.error("Preset generation error:", error);
      const errorMsg = error.message || 'Failed to generate story from presets.';
      setPresetError(errorMsg);
      // Use sonner for preset errors
      toast.error('Preset Generation Error', {
        description: errorMsg,
      });
    } finally {
      setIsPresetLoading(false);
    }
  };

  // --- JSX ---
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Create Your Magical Story</h1>
      <p className="text-muted-foreground text-center">
        Choose your adventure! Use presets for guided creation or chat directly with our story AI.
      </p>

      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets"><Wand2 className="mr-2 h-4 w-4" />Presets</TabsTrigger>
          <TabsTrigger value="chat"><Bot className="mr-2 h-4 w-4" />Chat</TabsTrigger>
        </TabsList>

        {/* --- Presets Tab --- */}
        <TabsContent value="presets" className="mt-6">
          <form onSubmit={handlePresetSubmit} className="space-y-8">
             {/* PresetSelectors go here (code omitted for brevity, same as before) */}
              <PresetSelector
                title="Choose a Theme"
                options={themes}
                selectedValue={selectedTheme}
                onValueChange={setSelectedTheme}
                customValue={customTheme}
                onCustomValueChange={setCustomTheme}
                customPlaceholder="E.g., A story about overcoming shyness"
                isTextArea={true}
              />
              <PresetSelector
                title="Select Your Hero"
                options={characters}
                selectedValue={selectedCharacter}
                onValueChange={setSelectedCharacter}
                customValue={customCharacter}
                onCustomValueChange={setCustomCharacter}
                customPlaceholder="E.g., A brave squirrel with a tiny sword"
                isTextArea={true}
              />
              <PresetSelector
                title="Pick the Perfect Setting"
                options={settings}
                selectedValue={selectedSetting}
                onValueChange={setSelectedSetting}
                customValue={customSetting}
                onCustomValueChange={setCustomSetting}
                customPlaceholder="E.g., A bustling city made of clouds"
                isTextArea={true}
              />
              <PresetSelector
                title="Choose a Story Length"
                options={storyLengths}
                selectedValue={selectedLength}
                onValueChange={setSelectedLength}
                customValue={customLength}
                onCustomValueChange={setCustomLength}
                customPlaceholder="E.g., 7 minutes"
                isTextArea={false} // Use Input for length
              />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPresetSubmitDisabled || isPresetLoading}
            >
              {isPresetLoading ? (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                 <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Story with Presets
            </Button>
             {/* Display preset error inline */}
            {presetError && <p className="text-sm text-destructive text-center">{presetError}</p>}
          </form>
        </TabsContent>

        {/* --- Chat Tab --- */}
        <TabsContent value="chat" className="mt-6 flex flex-col h-[60vh]">
            <ScrollArea className="flex-grow p-4 border rounded-md mb-4 bg-muted/50">
                 {/* Chat Messages Rendering (same as before) */}
                 {chatMessages.length === 0 && !isChatLoading && (
                    <p className="text-center text-muted-foreground p-8">
                        Start chatting with the story AI! Ask it to write a story about anything you can imagine.
                    </p>
                 )}
                {chatMessages.map((m) => (
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
                            <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                        {m.role === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                    </div>
                ))}
                 {isChatLoading && chatMessages[chatMessages.length -1]?.role !== 'assistant' && (
                     <div className="flex justify-start gap-3 mb-4">
                         <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                         <div className="p-3 rounded-lg bg-background border rounded-bl-none">
                             <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                         </div>
                     </div>
                 )}
            </ScrollArea>

          <form onSubmit={handleChatSubmit} className="flex gap-2 items-center">
            {/* Chat Input Form (same as before) */}
             <Textarea
              value={chatInput}
              onChange={handleChatInputChange}
              placeholder="Tell the AI what kind of story you want..."
              className="flex-grow resize-none"
              rows={1}
              disabled={isChatLoading}
            />
            <Button type="submit" size="icon" disabled={isChatLoading || !chatInput.trim()}>
              <SendHorizonal className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
            {isChatLoading && (
                <Button type="button" variant="outline" size="icon" onClick={stopChat}>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="sr-only">Stop</span>
                </Button>
            )}
          </form>
           {/* Chat error already handled by toast in useChat onError */}
        </TabsContent>
      </Tabs>

       {/* --- Generated Story Display Area (Primarily for Presets) --- */}
       {(isPresetLoading || generatedStoryContent) && (
         <Card className="mt-10">
             {/* Display Card (same as before) */}
              <CardHeader>
                <CardTitle>Generated Story</CardTitle>
                <CardDescription>Here's the story created from your presets.</CardDescription>
              </CardHeader>
              <CardContent>
                {isPresetLoading && !generatedStoryContent && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[75%]" />
                  </div>
                )}
                {generatedStoryContent && (
                  <div className="prose dark:prose-invert max-w-none">
                    {generatedStoryContent.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </CardContent>
         </Card>
       )}
    </div>
  );
}