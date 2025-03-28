// src/app/(app)/layout.tsx
import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle'; // Import the toggle

// You might want a different Navbar/Sidebar for the app section
// import AppNavbar from '@/components/layout/AppNavbar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This div inherits the standard light/dark background from the body/ThemeProvider
    <div className="min-h-screen flex flex-col">
      {/* Example Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
           <span className="font-semibold">App Name</span>
           <ThemeToggle /> {/* Place the toggle button here */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container py-6"> {/* Added container & padding */}
        {children}
      </main>

      {/* Example Footer */}
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
           <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
              © {new Date().getFullYear()} Tale Tinker App.
           </p>
        </div>
      </footer>
    </div>
  );
}