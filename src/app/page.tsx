// src/app/page.tsx
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import Features from '@/components/landing/Features';
import AdventureCTA from '@/components/landing/AdventureCTA';
import Testimonials from '@/components/landing/Testimonials';
import FinalCTA from '@/components/landing/FinalCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Home() {
  return (
    // Main container for the landing page with a light gradient background
    <div className="bg-gradient-to-br from-[#FAF7FF] to-[#F3EEFF] text-slate-800 min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <AdventureCTA />
        <Testimonials />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}