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
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b shadow-sm">
  <nav
    className="flex items-center justify-between h-20 max-w-7xl mx-auto px-4 md:px-8"
    aria-label="Main navigation"
  >
    <div className="flex items-center">
      <Link href="/dashboard" className="font-bold text-lg text-gray-900 hover:text-blue-700 transition-colors">
        Tale Tinker
      </Link>
    </div>
    <div className="flex items-center space-x-6">
      <Link
        href="/stories"
        className="text-base font-medium text-gray-700 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded transition-colors"
      >
        My Stories
      </Link>
      <Link
        href="/profile"
        className="text-base font-medium text-gray-700 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded transition-colors"
      >
        Profile
      </Link>
    </div>
  </nav>
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