// src/components/home/Hero.tsx
"use client"; 

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react'; 
import Image from 'next/image'; 

const Hero = () => {
  return (
    <section className="container mx-auto px-4 pt-16 min-h-screen flex flex-col justify-center">

      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">

        <motion.div
          className="w-full md:w-1/2 lg:w-5/12 flex justify-center md:justify-end" 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Image
            src="/HeroImage.png" 
            alt="Hero illustration for Tale Tinker"
            width={1024} 
            height={1024} 
            className="w-full max-w-md lg:max-w-lg h-auto rounded-lg shadow-xl" 
            priority 
          />
        </motion.div>

        <motion.div
          className="w-full md:w-1/2 lg:w-7/12 text-center md:text-left" 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-500 leading-tight">
            Craft Magical Bedtime Stories
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto md:mx-0"> 
            Create personalized bedtime stories that spark imagination and bring families together.
          </p>
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-3 rounded-full shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50 h-auto"
            >
              Start Creating Stories
            </Button>
          </Link>
        </motion.div>

      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
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