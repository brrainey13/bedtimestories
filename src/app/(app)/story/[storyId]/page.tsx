// src/app/(app)/story/[storyId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { ArrowLeft, Loader2, AlertTriangle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface StoryData {
  id: string;
  content: string;
  imageUrl?: string | null;
  heroName?: string;
  character?: string;
  setting?: string;
  moral?: string;
  // Add any other relevant fields from your story model
}

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;

  const [story, setStory] = useState<StoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) return;

    const fetchStory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/stories/${storyId}`);
        // if (!response.ok) {
        //   const errorData = await response.json();
        //   throw new Error(errorData.error || `Failed to fetch story: ${response.statusText}`);
        // }
        // const data: StoryData = await response.json();
        // setStory(data);

        // Placeholder data for now
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        if (storyId === 'error-test') {
            throw new Error('This is a test error fetching the story!');
        }
        // Simulate finding a story
        setStory({
          id: storyId,
          content: `This is a placeholder story about a brave hero named Placeholder Hero in a magical land. It's a tale of adventure and wonder, designed to captivate young minds before bedtime.\n\nParagraph two of the story continues the adventure, describing the challenges faced and the friends made along the way. The world is rich with detail, sparking the imagination.`,
          imageUrl: '/adventure-cta-image.png',
          heroName: 'Placeholder Hero',
          character: 'Wizard',
          setting: 'Magical Forest',
          moral: 'Bravery'
        });

      } catch (err: any) {
        console.error('Failed to fetch story:', err);
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <Skeleton className="h-8 w-3/4" /> {/* Title skeleton */}
        <Skeleton className="w-full h-72 rounded-lg" /> {/* Image skeleton */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 text-center space-y-4">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-semibold text-red-700">Failed to Load Story</h2>
        <p className="text-red-600">{error}</p>
        <Button onClick={() => router.push('/dashboard')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 text-center space-y-4">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto" />
        <h2 className="text-2xl font-semibold text-gray-700">Story Not Found</h2>
        <p className="text-gray-500">The story you are looking for does not exist or could not be loaded.</p>
        <Button onClick={() => router.push('/dashboard')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const storyTitle = story.heroName ? `${story.heroName}, the ${story.character}` : `A Wondrous Tale`;

  return (
    <article className="max-w-3xl mx-auto p-4 py-8 md:p-8 md:py-12 bg-white shadow-xl rounded-lg my-8">
      <div className="mb-6">
        <Button onClick={() => router.push('/dashboard')} variant="outline" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">
          {storyTitle}
        </h1>
        <p className="text-center text-gray-600 text-sm">
          A magical tale from the {story.setting}, teaching us about {story.moral}.
        </p>
      </div>

      {story.imageUrl && (
        <div className="my-8 flex justify-center">
          <NextImage 
            src={story.imageUrl} 
            alt={`Illustration for ${storyTitle}`} 
            width={512} 
            height={512} 
            className="rounded-xl shadow-lg border-2 border-gray-100 object-cover"
            priority // Good for LCP
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-4">
        {story.content.split('\n\n').map((paragraph, index) => (
          paragraph.trim() && <p key={index}>{paragraph}</p>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <Button onClick={() => router.push('/dashboard')} variant="default">
          Create Another Story
        </Button>
      </div>
    </article>
  );
}
