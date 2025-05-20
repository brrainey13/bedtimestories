// tailwind.config.ts
/** @type {import('tailwindcss').Config} */
module.exports = {
  // darkMode: ["class"], // REMOVE THIS LINE
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
      padding: "1rem",
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
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))", // Border color for inputs
        ring: "hsl(var(--ring))", // Focus ring color
        background: "hsl(var(--background))", // Main page background
        foreground: "hsl(var(--foreground))", // Main text color
        primary: { // Main action color (e.g., for the primary button)
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: { // Secondary elements
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: { // Muted backgrounds and text
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: { // Accents, hover states
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: { // Card backgrounds
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
         // You can keep your brand colors if they are used generally,
         // but ensure they don't conflict with the light-only theme.
         // For the target UI, we'll mostly use grays.
        'brand-purple': {
           DEFAULT: '#6D28D9', // A general purple, if needed elsewhere
         },
        'brand-gray': { // Grays for UI elements as per target
            50: '#F9FAFB',  // Very light gray for page backgrounds
            100: '#F3F4F6', // Light gray for card backgrounds/unselected buttons
            200: '#E5E7EB', // Borders, unselected button backgrounds
            300: '#D1D5DB', // Borders
            400: '#9CA3AF',
            500: '#6B7280', // Medium gray for selected story length
            600: '#4B5563', // Text
            700: '#374151', // Darker text, labels
            800: '#1F2937', // Selected hero buttons
            900: '#111827', // Main "Create My Story" button
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
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