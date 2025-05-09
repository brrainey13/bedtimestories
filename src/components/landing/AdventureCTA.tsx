// src/components/landing/AdventureCTA.tsx
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

const AdventureCTA = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-3xl m-4 md:m-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image (Order changed for mobile first: image on top) */}
          <div className="flex justify-center md:order-2">
            {/* User needs to add 'adventure-cta-image.png' to public folder */}
            <Image
              src="/adventure-cta-image.png" // Placeholder - User needs to add this image
              alt="Child reading a magical book"
              width={450}
              height={450}
              className="rounded-lg shadow-xl max-w-sm w-full md:max-w-md"
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/450x450/E9E1FF/7C3AED?text=Add+Image+Here")} // Fallback
            />
          </div>

          {/* Text Content */}
          <div className="text-center md:text-left md:order-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Your Adventure Today!
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Unlock a universe of stories and fun. Join StoryMagic and let the adventures begin.
            </p>
            <ul className="space-y-2 mb-8 text-left inline-block">
              {[
                "100+ Magical Stories",
                "Interactive Games & Activities",
                "Educational & Fun Content",
              ].map((item, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
                  {item}
                </li>
              ))}
            </ul>
            <div>
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-50 text-lg px-10 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 h-auto"
                >
                  Try 30 Days Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdventureCTA;