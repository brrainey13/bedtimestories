// src/app/(app)/stories/page.tsx
// MODIFIED: To fetch and display the actual story title and use it for image alt text.
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Define a type for the story data we fetch
interface Story {
    id: string;
    created_at: string;
    title: string; // <<< MODIFIED: Added title
    theme: string | null;
    character: string | null;
    setting: string | null;
    content: string;
    image_url: string | null;
}

export default function MyStoriesPage() {
    const { session } = useAuth();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStories = async () => {
            if (!session?.user?.id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            const supabase = createClient();

            try {
                const { data, error: fetchError } = await supabase
                    .from('stories')
                    // <<< MODIFIED: Added 'title' to select
                    .select('id, created_at, title, theme, character, setting, content, image_url')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (fetchError) {
                    throw fetchError;
                }

                setStories(data || []);
            } catch (err: any) {
                console.error("Error fetching stories:", err);
                setError(err.message || "Failed to load stories.");
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, [session]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Storybook</h1>
            <p className="text-muted-foreground">
                Rediscover the magical tales you've created.
            </p>

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                       <Card key={i}>
                           <CardHeader>
                               <Skeleton className="h-48 w-full rounded-t-lg" />
                           </CardHeader>
                           <CardContent className="space-y-2">
                               <Skeleton className="h-4 w-3/4" />
                               <Skeleton className="h-4 w-1/2" />
                           </CardContent>
                           <CardFooter>
                               <Skeleton className="h-8 w-24" />
                           </CardFooter>
                       </Card>
                    ))}
                </div>
            )}

            {error && (
                 <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Stories</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                 </Alert>
            )}

            {!loading && !error && stories.length === 0 && (
                 <div className="text-center py-16 border border-dashed rounded-lg">
                     <h2 className="text-xl font-semibold mb-2">Your Storybook is Empty</h2>
                     <p className="text-muted-foreground mb-4">Looks like you haven't created any stories yet.</p>
                     <Button asChild>
                        <Link href="/dashboard">Create Your First Story</Link>
                     </Button>
                 </div>
            )}

            {!loading && !error && stories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stories.map((story) => (
                        <Card key={story.id} className="flex flex-col overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="p-0">
                                {story.image_url ? (
                                    <Image
                                        src={story.image_url}
                                        // <<< MODIFIED: Improved alt text using story.title
                                        alt={story.title && story.title !== "N/A" ? `Illustration for "${story.title}"` : `Illustration for story ${story.id}`}
                                        width={400}
                                        height={300}
                                        className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="h-48 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                                        <span>No Image Yet</span>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="flex-grow pt-4 space-y-2">
                                <CardTitle className="text-lg line-clamp-1">
                                    {/* <<< MODIFIED: Prioritize story.title */}
                                    {story.title && story.title !== "N/A" ? story.title : 
                                     (story.theme && story.theme !== 'Chat Generated' ? story.theme :
                                     story.character && story.character !== 'Chat Generated' ? `About ${story.character}` :
                                     'A Generated Story')}
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    Created {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                                </CardDescription>
                                <p className="text-sm line-clamp-3">
                                    {story.content}
                                </p>
                            </CardContent>
                             <CardFooter>
                                {/* Link to view full story page, disabled for now but ready */}
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/story/${story.id}`}>View Story</Link>
                                </Button>
                             </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}