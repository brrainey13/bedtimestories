// src/app/(app)/dashboard/page.tsx
'use client';

import React from 'react';
// Removed: import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Removed: import { Bot } from 'lucide-react'; // Wand2 is still used by PresetGenerator's button
import PresetGenerator from './components/PresetGenerator';
// Removed: import ChatInterface from './components/ChatInterface';

export default function DashboardPage() {
  // Removed: const [activeTab, setActiveTab] = useState('presets');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Create Your Magical Story</h1>
      <p className="text-muted-foreground text-center max-w-2xl mx-auto">
        Use the presets below to guide the creation of your unique story.
      </p>

      {/* Removed Tabs structure */}
      {/* Directly render PresetGenerator */}
      <div className="mt-6"> {/* Added a div for consistent margin like TabsContent had */}
        <PresetGenerator />
      </div>
    </div>
  );
}