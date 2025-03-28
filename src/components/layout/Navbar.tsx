// src/components/layout/Navbar.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';

const Navbar = () => {
  const session = null; // Stub

  return (
    // Keep outer nav full width, with background/border
    <nav className="fixed w-full z-50 bg-[#1E1532]/90 backdrop-blur-sm border-b border-white/10">
      {/* Apply container for padding, but use max-width for alignment */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl"> {/* ADD max-w-* here */}
        {/* Left: Title */}
        <Link href="/" className="text-2xl font-semibold text-white flex items-center">
          Tale Tinker
        </Link>

        {/* Right: Navigation (Desktop) */}
        {/* Keep this structure */}
        <div className="hidden md:flex items-center gap-2">
          {/* ... (Logged out links using Button variants) ... */}
           <> {/* Logged Out Links */}
              <Link href="/about">
                 {/* Use outline variant, adjust colors if needed for purple bg */}
                <Button variant="outline" className="text-white border-white/20 bg-transparent hover:bg-white/10">
                  About
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="text-white border-white/20 bg-transparent hover:bg-white/10">
                  Pricing
                </Button>
              </Link>
              <Link href="/auth"> {/* Link to your auth page */}
                 {/* Keep gradient button */}
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5">
                  Get Started
                </Button>
              </Link>
            </>
        </div>

        {/* Mobile Menu Button - Placeholder */}
        <div className="md:hidden">
          <button className="text-white">
             {/* SVG */}
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;