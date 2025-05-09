// src/components/landing/Features.tsx
import React from 'react';
import FeatureCard from './FeatureCard';
import { Edit3, Mic2, Wand2, Puzzle, BookOpen, Smile } from 'lucide-react'; // Added more icons

const featuresData = [
  {
    icon: Puzzle, // Using Puzzle for Interactive Stories
    title: "Interactive Stories",
    description: "Dive into tales where choices shape the adventure. Fun for all!",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    icon: Mic2,
    title: "Voice Magic",
    description: "Hear stories narrated with delightful voices and sound effects.",
    bgColor: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    icon: BookOpen, // Using BookOpen for Creative Corner
    title: "Creative Corner",
    description: "Spark imagination with story starters, drawing prompts, and more.",
    bgColor: "bg-sky-100", // Using a blueish sky color
    iconColor: "text-sky-600",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="landing-heading">Magical Features for Little Dreamers</h2>
        {/* <p className="landing-subheading">
          Discover a world of enchantment designed to spark creativity and joy in every child.
        </p> */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {featuresData.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              bgColor={feature.bgColor}
              iconColor={feature.iconColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;