// src/app/(app)/layout.tsx
import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Ensure this outer div allows children to grow
    <div className="min-h-screen flex flex-col">

      {/* Header remains the same */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        {/* Apply max-width, centering, and padding CONSISTENTLY */}
        <div className="flex h-16 items-center justify-between w-full max-w-7xl mx-auto px-4 md:px-6"> 
           <span className="font-semibold">App Name</span>
           <ThemeToggle />
        </div>
      </header>

      {/* ---- MODIFICATION AREA ---- */}
      {/* Make the main area a flex container that pushes content down */}
      {/* and use padding on this instead of the child */}
      <div className="flex-grow w-full flex flex-col items-center py-6 px-4 md:px-6"> {/* Centering happens here */}
          {/* The actual main content area - now give it max-width and ensure it takes needed width */}
          <main className="w-full max-w-7xl"> {/* Adjust max-width as needed (e.g., max-w-5xl, max-w-6xl) */}
            {children}
          </main>
      </div>
      {/* ---- END MODIFICATION AREA ---- */}


      {/* Footer remains the same */}
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
           <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
              &copy; {new Date().getFullYear()} Tale Tinker App.
           </p>
        </div>
      </footer>
    </div>
  );
}