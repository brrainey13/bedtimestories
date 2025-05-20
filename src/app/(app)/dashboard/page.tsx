// src/app/(app)/dashboard/page.tsx
'use client';

import React from 'react';
import PresetGenerator from './components/PresetGenerator';

export default function DashboardPage() {
  return (
    // The PresetGenerator now has its own card-like background
    // The page itself can have a very light gray background, set in AppLayout
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">Create Your Magical Story</h1>
      <p className="text-gray-600 text-center max-w-2xl mx-auto">
        Use the presets below to guide the creation of your unique story.
      </p>

      <div className="mt-6">
        <PresetGenerator />
      </div>
    </div>
  );
}