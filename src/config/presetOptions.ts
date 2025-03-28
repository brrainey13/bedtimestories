// src/config/presetOptions.ts

import {
    BookOpen,
    Wand2,
    Users,
    Mountain,
    PawPrint,
    Crown,
    Sword,
    Clock,
    Plus,
    LucideIcon,
    Rocket, // Added for Space setting
    Waves, // Added for Ocean setting
    Castle, // Added for Castle setting
    Trees, // Added for Forest setting
  } from "lucide-react";
  
  export interface PresetOption {
    id: string;
    label: string;
    description: string;
    icon: LucideIcon;
    colorClass: string; // Using Tailwind class directly for simplicity
  }
  
  // Define story themes
  export const themes: PresetOption[] = [
    {
      id: "adventure",
      label: "Adventure",
      description: "An exciting journey filled with challenges.",
      icon: Mountain,
      colorClass: "border-orange-500/50 bg-orange-500/10 text-orange-400",
    },
    {
      id: "friendship",
      label: "Friendship",
      description: "Working together and building bonds.",
      icon: Users,
      colorClass: "border-green-500/50 bg-green-500/10 text-green-400",
    },
    {
      id: "learning",
      label: "Learning",
      description: "Discovering new things and growing.",
      icon: BookOpen,
      colorClass: "border-blue-500/50 bg-blue-500/10 text-blue-400",
    },
    {
      id: "magic",
      label: "Magic",
      description: "Mysterious powers and enchanting events.",
      icon: Wand2,
      colorClass: "border-purple-500/50 bg-purple-500/10 text-purple-400",
    },
    {
      id: "custom",
      label: "Custom Theme",
      description: "Create your own unique theme idea.",
      icon: Plus,
      colorClass: "border-gray-500/50 bg-gray-500/10 text-gray-400",
    },
  ];
  
  // Define story characters
  export const characters: PresetOption[] = [
    {
      id: "dragon",
      label: "Dragon",
      description: "A friendly, colorful dragon.",
      icon: PawPrint, // Using PawPrint as a placeholder
      colorClass: "border-red-500/50 bg-red-500/10 text-red-400",
    },
    {
      id: "princess",
      label: "Princess",
      description: "A brave and clever princess.",
      icon: Crown,
      colorClass: "border-pink-500/50 bg-pink-500/10 text-pink-400",
    },
    {
      id: "wizard",
      label: "Wizard",
      description: "A wise, sometimes silly, wizard.",
      icon: Wand2,
      colorClass: "border-indigo-500/50 bg-indigo-500/10 text-indigo-400",
    },
    {
      id: "knight",
      label: "Knight",
      description: "A noble knight who helps others.",
      icon: Sword,
      colorClass: "border-slate-500/50 bg-slate-500/10 text-slate-400",
    },
    {
      id: "custom",
      label: "Custom Character",
      description: "Invent your own unique character.",
      icon: Plus,
      colorClass: "border-gray-500/50 bg-gray-500/10 text-gray-400",
    },
  ];
  
  // Define story settings
  export const settings: PresetOption[] = [
    {
      id: "castle",
      label: "Castle",
      description: "An ancient magical castle.",
      icon: Castle,
      colorClass: "border-amber-500/50 bg-amber-500/10 text-amber-400",
    },
    {
      id: "forest",
      label: "Forest",
      description: "An enchanted forest.",
      icon: Trees,
      colorClass: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    },
    {
      id: "space",
      label: "Space",
      description: "The vast reaches of space.",
      icon: Rocket,
      colorClass: "border-violet-500/50 bg-violet-500/10 text-violet-400",
    },
    {
      id: "ocean",
      label: "Ocean",
      description: "The deep blue ocean mysteries.",
      icon: Waves,
      colorClass: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
    },
    {
      id: "custom",
      label: "Custom Setting",
      description: "Imagine your own unique place.",
      icon: Plus,
      colorClass: "border-gray-500/50 bg-gray-500/10 text-gray-400",
    },
  ];
  
  // Define story length options
  export const storyLengths: PresetOption[] = [
    {
      id: "3min",
      label: "Short (~3 Min)",
      description: "A quick, engaging tale.",
      icon: Clock,
      colorClass: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
    },
    {
      id: "5min",
      label: "Medium (~5 Min)",
      description: "A bit more detail and plot.",
      icon: Clock,
      colorClass: "border-orange-500/50 bg-orange-500/10 text-orange-400",
    },
    {
      id: "10min",
      label: "Long (~10 Min)",
      description: "A richer story adventure.",
      icon: Clock,
      colorClass: "border-red-500/50 bg-red-500/10 text-red-400",
    },
    {
      id: "custom",
      label: "Custom Length",
      description: "Specify your desired length.",
      icon: Plus,
      colorClass: "border-gray-500/50 bg-gray-500/10 text-gray-400",
    },
  ];
  
  // (Optional) Add mappings or descriptions if needed later, like in the original file
  // export const storyLengthToWords: Record<string, number> = { ... };