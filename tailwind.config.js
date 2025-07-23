/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1a202c', // A dark charcoal/blue
        'brand-teal': '#00a896', // A vibrant teal/cyan
        'brand-blue': '#0284c7', // A slightly lighter blue for accents
      },
    },
  },
  plugins: [],
};