// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keeping Geist fonts
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tale Tinker - Craft Magical Bedtime Stories", // Updated Title
  description: "Create personalized bedtime stories.", // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add className="dark" here!
    <html lang="en" className="dark">
      <body
        // You can keep the font variables if you like Geist
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        // No need for bg/text classes here anymore, globals.css handles it
      >
        {children}
      </body>
    </html>
  );
}