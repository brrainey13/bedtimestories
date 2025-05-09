// src/components/landing/FinalCTA.tsx
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FinalCTA = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-8 md:p-12 rounded-3xl text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Begin Your Magical Story Journey
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of happy families creating magical memories together.
            Unlock a world of imagination today!
          </p>
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-purple-50 text-lg px-10 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 h-auto"
            >
              Start Free Trial
            </Button>
          </Link>
          <p className="text-sm opacity-80 mt-4">
            No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;