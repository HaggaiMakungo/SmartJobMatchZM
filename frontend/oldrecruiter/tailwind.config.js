/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Mobile app color palette - Gunmetal, Peach, Tangerine
        gunmetal: {
          DEFAULT: '#202c39',
          50: '#e8eaed',
          100: '#c5cad2',
          200: '#9ea7b4',
          300: '#778396',
          400: '#596980',
          500: '#3c506a',  
          600: '#344862',
          700: '#283d57',
          800: '#202c39',  // Primary gunmetal
          900: '#12161c',
        },
        peach: {
          DEFAULT: '#f2d492',
          50: '#fefbf5',
          100: '#fdf6e5',
          200: '#fbeec2',
          300: '#f9e59f',
          400: '#f5dca7',  // Border in light mode
          500: '#f2d492',  // Main peach
          600: '#eab84c',
          700: '#d69a32',
          800: '#b67d25',
          900: '#8d5e1c',
        },
        tangerine: {
          DEFAULT: '#f29559',
          50: '#fef5ef',
          100: '#fde7d7',
          200: '#fccfaf',
          300: '#f4ab7b',  // Hover state
          400: '#ed701d',  // Darker accent
          500: '#f29559',  // Main tangerine
          600: '#e87e3d',
          700: '#d66624',
          800: '#b44f16',
          900: '#8f3d10',
        },
        sage: {
          DEFAULT: '#b8b08d',
          50: '#f7f6f2',
          100: '#edeae0',
          200: '#d5d0bb',  // Light sage
          300: '#78704b',  // Dark sage
          400: '#9d957a',
          500: '#b8b08d',  // Main sage
          600: '#a39a7d',
          700: '#8d846c',
          800: '#756d5a',
          900: '#5d5647',
        },
        // Keep shadcn/ui compatibility
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
