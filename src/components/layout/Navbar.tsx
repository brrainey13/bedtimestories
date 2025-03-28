// src/components/layout/Navbar.tsx
"use client"; // Needed for potential future state (mobile menu)

import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming shadcn setup
import React from 'react'; // Import React if using state later

// Placeholder for mobile menu state if needed later
// const [isMenuOpen, setIsMenuOpen] = React.useState(false);

const Navbar = () => {
  // Placeholder for auth logic - assume logged out
  const session = null;

  return (
    <nav className="fixed w-full z-50 bg-[#1E1532]/90 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Title */}
        <Link href="/" className="text-2xl font-semibold text-white flex items-center">
          {/* Simple title for now, adjust spacing/font if needed */}
          Tale Tinker
        </Link>

        {/* Right: Navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <> {/* Logged In Links - Placeholder */}
              <Link href="/stories">
                <Button variant="outline" className="text-white border-white/20 bg-white/5 hover:bg-white/10">
                  My Stories
                </Button>
              </Link>
               <Link href="/profile">
                <Button variant="outline" className="text-white border-white/20 bg-white/5 hover:bg-white/10">
                  Profile
                </Button>
              </Link>
            </>
          ) : (
            <> {/* Logged Out Links */}
              <Link href="/about">
                <Button variant="outline" className="text-white border-white/20 bg-white/5 hover:bg-white/10">
                  About
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="text-white border-white/20 bg-white/5 hover:bg-white/10">
                  Pricing
                </Button>
              </Link>
              <Link href="/auth"> {/* Link to your auth page */}
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button - Placeholder */}
        <div className="md:hidden">
          {/* Add Menu icon and logic later */}
          <button className="text-white">
            {/* <Menu className="h-6 w-6" /> */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;