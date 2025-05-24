// src/config/presetOptions.ts

import {
  BookOpen, Wand2, Users, Mountain, PawPrint, Crown, Sword, Clock, Plus, LucideIcon,
  Rocket, Waves, Castle, Trees,
  Heart, Shield, Smile, Star // Added for Morals
} from "lucide-react";

export interface PresetOption {
  id: string;
  label: string;
  description: string; // May not be used in the new UI but good to keep for data structure
  icon: LucideIcon;
  colorClass: string; // For icon coloring if needed
}

// Story Themes (No longer used in this UI component, but keep for potential future use)
export const themes: PresetOption[] = [
  // ... your themes ...
  {
    id: "adventure",
    label: "Adventure",
    description: "An exciting journey filled with challenges.",
    icon: Mountain,
    colorClass: "text-orange-400",
  },
  // ... more themes
];

// Story Characters (Used for Hero Buttons)
export const characters: PresetOption[] = [
  { id: "dragon", label: "Dragon", description: "A friendly dragon.", icon: PawPrint, colorClass: "text-red-500" },
  { id: "wizard", label: "Wizard", description: "A wise wizard.", icon: Wand2, colorClass: "text-indigo-500" },
  { id: "princess", label: "Princess", description: "A brave princess.", icon: Crown, colorClass: "text-pink-500" },
  { id: "knight", label: "Knight", description: "A noble knight.", icon: Sword, colorClass: "text-slate-500" },
  { id: "custom", label: "Custom Hero", description: "Invent your own hero.", icon: Plus, colorClass: "text-gray-500" },
];

// Story Settings (Used for Setting Dropdown)
export const settings: PresetOption[] = [
  { id: "magical-forest", label: "Magical Forest", description: "An enchanted forest.", icon: Trees, colorClass: "text-emerald-500" },
  { id: "castle", label: "Castle", description: "An ancient castle.", icon: Castle, colorClass: "text-amber-500" },
  { id: "space", label: "Space", description: "The vastness of space.", icon: Rocket, colorClass: "text-violet-500" },
  { id: "underwater-kingdom", label: "Underwater Kingdom", description: "A kingdom beneath the waves.", icon: Waves, colorClass: "text-blue-400" }, 
  { id: "custom", label: "Custom Setting", description: "Describe your own setting.", icon: Plus, colorClass: "text-gray-500" },
];

// Story Lengths (Used for Length Buttons)
export const storyLengths: PresetOption[] = [
  { id: "short", label: "Short", description: "~3 Min", icon: Clock, colorClass: "text-yellow-600" },
  { id: "medium", label: "Medium", description: "~5 Min", icon: Clock, colorClass: "text-orange-500" },
  { id: "long", label: "Long", description: "~10 Min", icon: Clock, colorClass: "text-red-500" },
  // { id: "custom", label: "Custom Length", description: "Specify length.", icon: Plus, colorClass: "text-gray-500" }, // Not used
];

// Story Morals (Used for Moral Dropdown)
export const morals: PresetOption[] = [
  { id: "friendship", label: "Friendship", description: "About friends.", icon: Users, colorClass: "text-green-500" },
  { id: "bravery", label: "Bravery", description: "Being courageous.", icon: Shield, colorClass: "text-red-600" },
  { id: "kindness", label: "Kindness", description: "Being kind to others.", icon: Heart, colorClass: "text-pink-400" },
  { id: "honesty", label: "Honesty", description: "Telling the truth.", icon: Smile, colorClass: "text-blue-500" }, // Using Smile icon
  { id: "perseverance", label: "Perseverance", description: "Never giving up.", icon: Star, colorClass: "text-yellow-500" },
  { id: "custom", label: "Custom Moral", description: "Define your own moral.", icon: Plus, colorClass: "text-gray-500" },
];