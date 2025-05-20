// src/app/(app)/layout.tsx
import React from 'react';
import Link from 'next/link';
// import { ThemeToggle } from '@/components/providers/ThemeToggle'; // REMOVE

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="flex h-16 items-center justify-between w-full max-w-7xl mx-auto px-4 md:px-6">
           <Link href="/dashboard" className="font-semibold mr-6 text-gray-800"> {/* Ensure text color is good for light bg */}
                App Name
           </Link>
           <nav className="flex items-center space-x-4 lg:space-x-6 mr-auto">
               <Link href="/stories" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                   My Stories
               </Link>
               <Link href="/profile" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                   Profile
               </Link>
           </nav>
           {/* <ThemeToggle /> REMOVE */}
        </div>
      </header>

      <div className="flex-grow w-full flex flex-col items-center py-6 px-4 md:px-6 bg-gray-50"> {/* Added light gray bg for content area */}
          <main className="w-full max-w-7xl">
            {children}
          </main>
      </div>

      <footer className="py-6 md:px-8 md:py-0 border-t bg-background"> {/* Ensure footer bg is appropriate */}
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
           <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
              © {new Date().getFullYear()} Tale Tinker App.
           </p>
        </div>
      </footer>
    </div>
  );
}