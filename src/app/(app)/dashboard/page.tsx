// src/app/(app)/dashboard/page.tsx
'use client';

import React from 'react';
import PresetGenerator from './components/PresetGenerator';

export default function DashboardPage() {
  return (
    // The PresetGenerator now has its own card-like background
    // The page itself can have a very light gray background, set in AppLayout
    <div className="py-8 sm:py-12 space-y-8 sm:space-y-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-2">Create Your Magical Story</h1>
      <p className="text-base sm:text-lg text-gray-700 text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        Use the presets below to guide the creation of your unique story.
      </p>

      <div>
        <PresetGenerator />
      </div>
    </div>
  );
}