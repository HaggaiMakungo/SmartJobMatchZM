/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary color - Gunmetal (Deep blue-gray)
        primary: {
          DEFAULT: '#202c39',
          100: '#06090b',
          200: '#0c1116',
          300: '#131a21',
          400: '#19222c',
          500: '#202c39',
          600: '#3e556e',
          700: '#5c7fa4',
          800: '#93aac2',
          900: '#c9d4e1',
        },
        // Secondary color - Gunmetal variant (Slightly lighter blue-gray)
        secondary: {
          DEFAULT: '#283845',
          100: '#080b0e',
          200: '#10161b',
          300: '#172129',
          400: '#1f2c36',
          500: '#283845',
          600: '#456077',
          700: '#6589a7',
          800: '#99b1c4',
          900: '#ccd8e2',
        },
        // Accent color - Sage (Muted olive-green)
        sage: {
          DEFAULT: '#b8b08d',
          100: '#282519',
          200: '#504b32',
          300: '#78704b',
          400: '#9f9566',
          500: '#b8b08d',
          600: '#c6c0a5',
          700: '#d5d0bb',
          800: '#e3e0d2',
          900: '#f1efe8',
        },
        // Highlight color - Peach Yellow (Warm, inviting)
        peach: {
          DEFAULT: '#f2d492',
          100: '#453208',
          200: '#8b6410',
          300: '#d09618',
          400: '#eab84c',
          500: '#f2d492',
          600: '#f5dca7',
          700: '#f7e5bd',
          800: '#faeed3',
          900: '#fcf6e9',
        },
        // Action color - Atomic Tangerine (Energetic orange)
        tangerine: {
          DEFAULT: '#f29559',
          100: '#3d1c05',
          200: '#7b370a',
          300: '#b8530f',
          400: '#ed701d',
          500: '#f29559',
          600: '#f4ab7b',
          700: '#f7c09c',
          800: '#fad5bd',
          900: '#fceade',
        },
      },
      fontFamily: {
        sans: ['System'],
        mono: ['Courier'],
      },
    },
  },
  plugins: [],
}
