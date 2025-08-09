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
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'h2, h3': {
              color: theme('colors.brand-teal'), // Changed this line
              marginTop: '1.5em', 
              marginBottom: '0.5em',
            },
            strong: {
              color: theme('colors.brand-dark'), 
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};