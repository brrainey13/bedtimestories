// src/components/landing/LandingFooter.tsx
import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, BookHeart } from 'lucide-react'; // BookHeart for logo

const LandingFooter = () => {
  return (
    <footer className="bg-brand-purple-darker text-slate-300 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center text-2xl font-bold text-white mb-3">
              <BookHeart className="h-8 w-8 mr-2 text-pink-400" />
              StoryMagic
            </Link>
            <p className="text-sm leading-relaxed">
              Making bedtime stories magical for every child.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-semibold text-white mb-3">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="#hero" className="hover:text-pink-400 transition-colors">Home</Link></li>
              <li><Link href="#features" className="hover:text-pink-400 transition-colors">Features</Link></li>
              <li><Link href="#testimonials" className="hover:text-pink-400 transition-colors">Testimonials</Link></li>
              {/* <li><Link href="/pricing" className="hover:text-pink-400 transition-colors">Pricing</Link></li> */}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-semibold text-white mb-3">Support</h5>
            <ul className="space-y-2 text-sm">
              {/* <li><Link href="/faq" className="hover:text-pink-400 transition-colors">FAQ</Link></li> */}
              <li><Link href="/contact" className="hover:text-pink-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-pink-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-pink-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h5 className="font-semibold text-white mb-3">Follow Us</h5>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook" className="hover:text-pink-400 transition-colors">
                <Facebook size={20} />
              </Link>
              <Link href="#" aria-label="Twitter" className="hover:text-pink-400 transition-colors">
                <Twitter size={20} />
              </Link>
              <Link href="#" aria-label="Instagram" className="hover:text-pink-400 transition-colors">
                <Instagram size={20} />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} StoryMagic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;