// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/providers/ThemeToggle';
import { usePathname } from 'next/navigation'; // 1. Import usePathname
import { cn } from '@/lib/utils'; // 2. Import cn utility

const Navbar = () => {
  const { session, supabase } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // 3. Get the current path
  const isLandingPage = pathname === '/'; // 4. Check if it's the landing page

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    // 5. Apply conditional classes using cn()
    <nav
      className={cn(
        "sticky top-0 w-full z-50", // Common sticky styles
        isLandingPage
          ? "bg-[#1E1532]/90 backdrop-blur-sm" // Landing: Purpleish background, NO border-b by default
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b" // App: Theme background, WITH border-b
      )}
    >
      {/* Container remains the same */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <Link href="/" className={cn(
            "text-2xl font-semibold flex items-center",
             isLandingPage ? "text-white" : "text-foreground" // Adjust text color if needed
             )}>
          Tale Tinker
        </Link>

        <div className="flex items-center gap-2">
          {/* 6. Conditionally render ThemeToggle only if NOT on landing page */}
          {!isLandingPage && <ThemeToggle />}

          {/* Conditional Auth Links - Logic remains the same */}
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/stories">
                <Button variant="ghost">My Stories</Button>
              </Link>
              {/* <Link href="/profile">
                 <Button variant="ghost">Profile</Button>
               </Link> */}
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              {/* Logged Out Links */}
              <Link href="/about" passHref>
                 {/* Adjust button style for landing page if needed */}
                 <Button variant={isLandingPage ? "outline" : "ghost"} className={cn(isLandingPage && "text-white border-white/20 bg-transparent hover:bg-white/10")}>
                  About
                 </Button>
              </Link>
              {/* <Link href="/pricing" passHref>
                <Button variant={isLandingPage ? "outline" : "ghost"} className={cn(isLandingPage && "text-white border-white/20 bg-transparent hover:bg-white/10")}>Pricing</Button>
              </Link> */}
              <Link href="/auth" passHref>
                {/* Use primary button style for both, potentially override for landing if desired */}
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                   Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
        {/* Mobile Menu Placeholder */}
        {/* <div className="md:hidden">...</div> */}
      </div>
    </nav>
  );
};

export default Navbar;