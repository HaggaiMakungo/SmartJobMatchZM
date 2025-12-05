/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tangerine: '#F2994A',
        peach: '#F2D492',
        sage: '#A4B494',
        gunmetal: '#2D3142',
      },
    },
  },
}
