// src/app/(app)/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, Bot } from 'lucide-react';
import PresetGenerator from './components/PresetGenerator'; // Import new component
import ChatInterface from './components/ChatInterface';   // Import new component

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('presets'); // Default tab

  return (
    <div className="space-y-6"> {/* Reduced top-level spacing */}
      <h1 className="text-3xl font-bold text-center">Create Your Magical Story</h1>
      <p className="text-muted-foreground text-center max-w-2xl mx-auto">
        Choose your adventure! Use presets for guided creation or chat directly with our story AI to bring your ideas to life.
      </p>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto"> {/* Center tabs */}
          <TabsTrigger value="presets"><Wand2 className="mr-2 h-4 w-4" />Presets</TabsTrigger>
          <TabsTrigger value="chat"><Bot className="mr-2 h-4 w-4" />Chat</TabsTrigger>
        </TabsList>

        {/* --- Presets Tab --- */}
         <TabsContent value="presets" className="mt-6">
              <PresetGenerator /> {/* Render the dedicated component */}
         </TabsContent>

        {/* --- Chat Tab --- */}
        <TabsContent value="chat" className="mt-6 flex justify-center"> {/* Center chat interface */}
             <div className="w-full max-w-4xl"> {/* Constrain chat width */}
                 <ChatInterface /> {/* Render the dedicated component */}
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}