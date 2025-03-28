// tailwind.config.ts
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"], // Or 'media' if you prefer
    content: [
      './pages/**/*.{ts,tsx}',
      './components/**/*.{ts,tsx}',
      './app/**/*.{ts,tsx}',
      './src/**/*.{ts,tsx}', // Ensure src is included
    ],
    prefix: "",
    theme: {
      container: { // Keep container settings if you had them
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        colors: {
          border: "hsl(var(--border))", // Use HSL vars for shadcn compatibility
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))", // Reference the CSS variable
          foreground: "hsl(var(--foreground))", // Reference the CSS variable
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
          // You can still add specific color names if needed
          'deep-purple': '#1E1532',
          'brand-purple': '#9b87f5',
          'brand-pink': '#ec4899', // Example pink
        },
        borderRadius: { // Keep border radius settings
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        keyframes: { // Keep keyframes if you had them
           // ... your keyframes
        },
        animation: {
           // ... your animations
        },
      },
    },
    plugins: [require("tailwindcss-animate")], // Keep plugins
  }