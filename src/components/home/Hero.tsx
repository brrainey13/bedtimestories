// src/components/home/Hero.tsx
"use client"; // Needed for Framer Motion

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react'; // Import the icon

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16"> {/* pt-16 for navbar height */}
      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Gradient Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-500 leading-tight">
            Craft Magical Bedtime Stories
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Create personalized bedtime stories that spark imagination and bring families together.
          </p>

          {/* CTA Button */}
          <Link href="/auth"> {/* Link to your auth page */}
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-3 rounded-full shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50 h-auto" // Added h-auto for padding control
            >
              Start Creating Stories
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }} // Simple bounce animation
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ArrowDown className="w-6 h-6 text-white/50" />
      </motion.div>
    </section>
  );
};

export default Hero;