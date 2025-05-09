// tailwind.config.ts
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem", // Adjusted default padding for container
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'], // Example if using Geist
        // mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors from design (can also be defined as CSS vars)
        'brand-purple': {
          light: '#F3EEFF', // Light background shade
          DEFAULT: '#8B5CF6', // purple-500
          medium: '#7C3AED', // purple-600 (Primary buttons)
          dark: '#5B21B6',  // purple-700
          darker: '#1E1532', // Footer background
        },
        'brand-pink': {
          extralight: '#FFF5F7', // For demo button background
          light: '#FED7E2', // For demo button border
          DEFAULT: '#EC4899', // pink-500 (Accent text, gradients)
          medium: '#D946EF', // fuchsia-500 (For gradients)
        },
        'brand-blue': { // From hero image background
          sky: '#A7D7F7',
          deep: '#2E6BA3'
        },
        'slate': { // For text
           600: '#475569',
           700: '#334155',
           800: '#1e293b',
           900: '#0f172a',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)", // For larger cards
        '2xl': "calc(var(--radius) + 8px)",
        '3xl': "calc(var(--radius) + 16px)",
        'full': "9999px",
      },
      keyframes: {
         // ... your keyframes if any ...
      },
      animation: {
         // ... your animations if any ...
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}