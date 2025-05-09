// src/components/landing/TestimonialCard.tsx
"use client";
import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  rating: number;
  quote: string;
  avatar: string;
  avatarFallback: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  rating,
  quote,
  avatar,
  avatarFallback,
}) => {
  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-lg h-full flex flex-col">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-purple-200 flex items-center justify-center text-purple-700 font-semibold">
          {/* Basic Image component with fallback to initials */}
          <Image
            src={avatar}
            alt={name}
            width={48}
            height={48}
            className="object-cover"
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none'; // Hide image on error
                // Optionally, show fallback text or a default avatar icon
                const fallbackEl = document.createElement('span');
                fallbackEl.textContent = avatarFallback;
                fallbackEl.className = "w-12 h-12 flex items-center justify-center text-xl font-semibold text-purple-600 bg-purple-100 rounded-full";
                if (target.parentElement) {
                    target.parentElement.appendChild(fallbackEl);
                }
            }}
          />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">{name}</h4>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed flex-grow">“{quote}”</p>
    </div>
  );
};

export default TestimonialCard;