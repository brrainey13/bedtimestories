// src/components/landing/Testimonials.tsx
import React from 'react';
import TestimonialCard from './TestimonialCard';

const testimonialsData = [
  {
    name: "Sandra's Mom",
    rating: 5,
    quote: "My daughter loves the interactive stories. It's made bedtime so much more fun!",
    avatar: "/avatar-sandra.png", // User needs to add this
    avatarFallback: "SM",
  },
  {
    name: "Tom's Dad",
    rating: 5,
    quote: "The educational value combined with fun stories is exactly what we were looking for.",
    avatar: "/avatar-tom.png", // User needs to add this
    avatarFallback: "TD",
  },
  {
    name: "Emma's Mom",
    rating: 5,
    quote: "The voice effects and music make every story a magical experience!",
    avatar: "/avatar-emma.png", // User needs to add this
    avatarFallback: "EM",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="landing-heading">Happy Little Readers</h2>
        {/* <p className="landing-subheading">
          See what parents are saying about their StoryMagic experience.
        </p> */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              rating={testimonial.rating}
              quote={testimonial.quote}
              avatar={testimonial.avatar}
              avatarFallback={testimonial.avatarFallback}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;