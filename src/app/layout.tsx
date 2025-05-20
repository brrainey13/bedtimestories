// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { ThemeProvider } from "@/components/providers/ThemeProvider"; // REMOVE
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tale Tinker - Craft Magical Bedtime Stories",
  description: "Create personalized bedtime stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Remove suppressHydrationWarning if ThemeProvider is completely gone
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="light" // Set to light
          enableSystem={false} // Disable system theme
          disableTransitionOnChange
        > */}
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}