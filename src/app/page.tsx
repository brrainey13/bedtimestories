// src/app/page.tsx
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import FloatingOrbs from '@/components/shared/FloatingOrbs';
// Import Footer when ready
// import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    // Override background and text color for landing page specifically
    // Use the specific color value or a named color from tailwind.config
    <div className="relative isolate bg-[#1E1532] text-white min-h-screen overflow-x-hidden">
      <FloatingOrbs /> {/* Orbs are behind everything */}
      {/* Pass a prop to Navbar/Footer if they need to know they're on the landing page */}
      <Navbar />
      <main>
        <Hero />
        {/* Add other sections like Features, Testimonials, CTA here later */}
        {/* <Features /> */}
        {/* <Testimonials /> */}
        {/* <CallToAction /> */}
      </main>
      {/* <Footer /> */}
    </div>
  );
}