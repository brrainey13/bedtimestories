// src/components/home/Hero.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 min-h-[calc(100vh-4rem)] flex items-center">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Text Content */}
        <motion.div
          className="text-center md:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-slate-900 leading-tight">
            Where Stories
            <br />
            Come <span className="text-pink-500">Alive</span> with
            <br />
            <span className="text-purple-600">Magic</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg mx-auto md:mx-0">
            Join us on a magical journey where every child becomes part of
            their favorite stories. Create, explore, and imagine together!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-3 rounded-full shadow-lg h-auto w-full sm:w-auto"
              >
                Start Your Story
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="bg-pink-100 hover:bg-pink-200 text-pink-600 border-pink-300 text-lg px-8 py-3 rounded-full shadow-lg h-auto w-full sm:w-auto"
              onClick={() => alert("Demo video functionality to be implemented!")} // Placeholder action
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Image
            src="/HeroImage.png" // User-provided image
            alt="Children reading a magical story book"
            width={550}
            height={550}
            className="w-full max-w-md lg:max-w-xl h-auto rounded-lg"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;