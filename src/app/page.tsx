// src/app/page.tsx
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import FloatingOrbs from '@/components/shared/FloatingOrbs';
// Import Footer later when you build it
// import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="relative isolate"> {/* isolate helps with z-index */}
      {/* Background Orbs - Rendered first, positioned absolutely */}
      <FloatingOrbs />

      {/* Content */}
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