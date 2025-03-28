// src/components/shared/FloatingOrbs.tsx
"use client"; // Needs client-side hooks and animation

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Orb {
  id: number;
  top: string;
  left: string;
  size: number;
  color: string;
  blur: string;
  opacity: number;
  delay: number;
  duration: number;
  yMovement: number[];
}

const colors = [
  'rgba(236, 72, 153, 0.5)', // Pink
  'rgba(168, 85, 247, 0.5)', // Purple
  'rgba(59, 130, 246, 0.5)', // Blue
  'rgba(34, 197, 94, 0.5)', // Green
  'rgba(249, 115, 22, 0.5)', // Orange
  'rgba(250, 204, 21, 0.5)', // Yellow
];

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

const FloatingOrbs: React.FC<{ count?: number }> = ({ count = 15 }) => {
  const [orbs, setOrbs] = useState<Orb[]>([]);

  useEffect(() => {
    const generatedOrbs = Array.from({ length: count }).map((_, i) => {
      const size = getRandom(10, 30);
      return {
        id: i,
        top: `${getRandom(5, 95)}%`,
        left: `${getRandom(5, 95)}%`,
        size: size,
        color: colors[Math.floor(Math.random() * colors.length)],
        blur: `blur(${getRandom(2, 6)}px)`,
        opacity: getRandom(0.3, 0.8),
        delay: getRandom(0, 5), // Animation delay
        duration: getRandom(5, 15), // Animation duration
        // Randomize direction and distance slightly
        yMovement: Math.random() > 0.5 ? [0, getRandom(-5, -15), 0] : [0, getRandom(5, 15), 0],
      };
    });
    setOrbs(generatedOrbs);
  }, [count]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            top: orb.top,
            left: orb.left,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            backgroundColor: orb.color,
            filter: orb.blur,
            opacity: orb.opacity,
          }}
          animate={{
            y: orb.yMovement, // Animate y position
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            repeatType: 'mirror', // Makes it go back and forth smoothly
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default FloatingOrbs;