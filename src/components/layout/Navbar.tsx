// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import useRouter
import { ThemeToggle } from '@/components/ThemeToggle'; // Import ThemeToggle

const Navbar = () => {
  const { session, supabase } = useAuth(); // Get session and supabase client
  const router = useRouter();

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/'); // Redirect to home after sign out
    router.refresh(); // Refresh to update server components
  };

  return (
    <nav className="sticky top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"> {/* Updated for sticky */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <Link href="/" className="text-2xl font-semibold flex items-center">
          Tale Tinker
        </Link>

        <div className="flex items-center gap-2">
          {/* Always show ThemeToggle */}
          <ThemeToggle />

          {/* Conditional Rendering based on session */}
          {session ? (
            <>
               {/* Logged In Links (Example) */}
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
              {/* Use Link components for Next.js navigation */}
              <Link href="/about" passHref>
                 <Button variant="ghost">About</Button>
              </Link>
              {/* <Link href="/pricing" passHref>
                <Button variant="ghost">Pricing</Button>
              </Link> */}
              <Link href="/auth" passHref>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                   Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
        {/* Consider mobile menu later */}
        {/* <div className="md:hidden">...</div> */}
      </div>
    </nav>
  );
};

export default Navbar;