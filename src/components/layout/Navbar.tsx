// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
// import { ThemeToggle } from '@/components/providers/ThemeToggle'; // Not shown on landing page design
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
// import Image from 'next/image'; // If using an image logo

const Navbar = () => {
  const { session, supabase } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Landing page specific links
  const landingNavLinks = [
    { href: '#hero', label: 'Home' }, // Assuming #hero is the ID of your Hero section
    { href: '#features', label: 'Features' }, // Assuming #features is the ID of your Features section
    { href: '#testimonials', label: 'Parents' }, // Linking Parents to testimonials as an example
    // Add more landing-page specific links here if "How It Works" or actual "Stories" (showcase) sections exist
    // { href: '#how-it-works', label: 'How It Works' },
  ];

  // App specific links (when user is logged in)
  const appNavLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/stories', label: 'My Stories' },
    // { href: '/profile', label: 'Profile'}
  ];


  return (
    <nav
      className={cn(
        "sticky top-0 w-full z-50 transition-all duration-300",
        isLandingPage
          ? "bg-transparent py-2" // Landing page: transparent, adjust padding if needed
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm" // App: Theme background
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <Link href="/" className={cn(
            "text-2xl font-bold flex items-center", // Increased font weight
             isLandingPage ? "text-purple-700" : "text-foreground"
             )}>
          {/* <Image src="/logo-placeholder.svg" alt="StoryMagic Logo" width={32} height={32} className="mr-2" /> */}
          Tale Tinker
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {isLandingPage && !session && landingNavLinks.map(link => (
            <Link key={link.label} href={link.href} passHref>
              <Button variant="ghost" className="text-slate-700 hover:text-purple-600">
                {link.label}
              </Button>
            </Link>
          ))}
          {session && appNavLinks.map(link => (
             <Link key={link.label} href={link.href} passHref>
              <Button variant="ghost" className={isLandingPage ? "text-slate-700 hover:text-purple-600" : ""}>
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* {!isLandingPage && <ThemeToggle />} */}

          {session ? (
            <Button onClick={handleSignOut} variant={isLandingPage ? "outline" : "default"} className={cn(isLandingPage && "border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700")}>
              Sign Out
            </Button>
          ) : (
            <>
              <Link href="/auth" passHref>
                 <Button variant="ghost" className={cn(isLandingPage ? "text-slate-700 hover:text-purple-600" : "text-foreground")}>
                   Login
                 </Button>
              </Link>
              <Link href="/auth" passHref>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5 py-2.5">
                   Try Free
                </Button>
              </Link>
            </>
          )}
        </div>
        {/* Mobile Menu Placeholder - Implement if needed */}
        {/* <div className="md:hidden">...</div> */}
      </div>
    </nav>
  );
};

export default Navbar;