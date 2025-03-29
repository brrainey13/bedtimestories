// src/app/(app)/dashboard/components/ChatInterface.tsx
'use client';

import React, { FormEvent, useCallback } from 'react';
import { useChat, Message } from '@ai-sdk/react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { SendHorizonal, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
// Image component not used directly here unless displaying images in chat
// import Image from 'next/image';

export default function ChatInterface() {
    const { session } = useAuth();

    // --- Save Chat Story Callback ---
    // This function is called *after* the AI response is fully received.
    const saveChatStory = useCallback(async (lastAssistantMessage: Message) => {
        if (!session?.user?.id || !lastAssistantMessage?.content) {
             console.warn("Cannot save chat story: Missing user session or content.");
             return;
        }

        console.log("Attempting to save chat-generated story...");

        try {
            const saveResponse = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.user.id,
                    content: lastAssistantMessage.content,
                    theme: 'Chat Generated', // Indicate source
                    character: 'Chat Generated',
                    setting: 'Chat Generated',
                    storyLength: 'Chat Generated',
                }),
            });

            const saveData = await saveResponse.json();

            if (!saveResponse.ok) {
                console.error("Failed to save chat story:", saveData.error);
                toast.warning("Chat response received, but failed to save.", { description: saveData.error });
            } else {
                console.log("Chat story saved successfully with ID:", saveData.storyId);
                // Optionally associate image if generated for chat messages
                // toast.success("Chat story saved!");
            }
        } catch (err: any) {
             console.error("Error saving chat story:", err);
             toast.error("Failed to save chat story.", { description: err.message });
        }
    }, [session?.user?.id]);

    // --- useChat Hook Setup ---
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit, // Use the default handleSubmit for the form
        isLoading,
        error,
        stop,
        // append, // Not directly used here, handleSubmit handles it
        // setMessages // Could be used to clear chat
    } = useChat({
        api: '/api/generate-story', // AI Generation Endpoint
        // Send userId with *every* message for verification on the backend
        body: {
            // We wrap the actual data inside a 'data' object matching the API expectation
            data: {
                 userId: session?.user?.id,
                 source: 'chat' // Indicate chat source
            }
        },
        // Trigger save when assistant finishes streaming
        onFinish: (message: Message) => {
            console.log("useChat onFinish triggered for message:", message.id, "Role:", message.role);
            if (message.role === 'assistant') {
                console.log("Assistant finished, triggering save function.");
                saveChatStory(message); // Save the completed assistant message
                // Optionally trigger image generation here too
                // generateImageForChatMessage(message.content, savedStoryId);
            }
        },
        onError: (err: Error) => {
            toast.error('Chat Error', {
                description: err.message || 'Failed to get chat response.',
            });
        },
    });


    return (
         <div className="flex flex-col h-[70vh] w-full"> {/* Adjust height as needed */}
            <ScrollArea className="flex-grow p-4 border rounded-md mb-4 bg-muted/50">
                 {messages.length === 0 && !isLoading && (
                    <p className="text-center text-muted-foreground p-8">
                        Start chatting with the story AI! Ask it to write or continue a story about anything you can imagine.
                    </p>
                 )}
                {messages.map((m) => (
                    <div key={m.id} className={cn("mb-4 flex gap-3", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                        {m.role !== 'user' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                        <div
                            className={cn(
                                "p-3 rounded-lg max-w-[85%]", // Allow slightly wider messages
                                m.role === 'user'
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-background border rounded-bl-none"
                            )}
                        >
                            <p className="whitespace-pre-wrap">{m.content}</p>
                             {/* Add logic here to display image if generated for chat message */}
                        </div>
                        {m.role === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                    </div>
                ))}
                 {/* Display loading indicator for assistant response */}
                 {isLoading && messages[messages.length -1]?.role === 'user' && ( // Show only when expecting assistant reply
                     <div className="flex justify-start gap-3 mb-4">
                         <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                         <div className="p-3 rounded-lg bg-background border rounded-bl-none">
                             <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                         </div>
                     </div>
                 )}
            </ScrollArea>

           {/* Standard chat input form */}
           <form onSubmit={handleSubmit} className="flex gap-2 items-start"> {/* Use items-start for Textarea */}
             <Textarea
              name="prompt" // Default name expected by useChat's handleSubmit
              value={input}
              onChange={handleInputChange}
              placeholder="Ask the AI to write or continue a story..."
              className="flex-grow resize-none"
              rows={1} // Start small, auto-grows with 'field-sizing-content' in CSS
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); // Prevent newline on Enter
                  // Type assertion needed as FormEvent<HTMLFormElement> is expected
                  handleSubmit(e as any as FormEvent<HTMLFormElement>);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <SendHorizonal className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
            {isLoading && (
                <Button type="button" variant="outline" size="icon" onClick={stop}>
                    <Loader2 className="h-4 w-4 animate-spin" /> {/* Use Loader for stop button too */}
                    <span className="sr-only">Stop</span>
                </Button>
            )}
          </form>
           {error && <p className="text-sm text-destructive text-center mt-2">{error.message}</p>}
        </div>
    );
}