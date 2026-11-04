/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FCFAF8',
        sand: '#F5EDE6',
        ink: '#2A2420',
        inkSoft: '#6B6058',
        clay: '#C49A7A',
        terra: '#D17E6B',
        sage: '#9CB1A1',
        rose: '#E3C2C2',
        blush: '#F2DCD5',
        danger: '#B4432F',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(196, 154, 122, 0.15)',
      }
    },
  },
  plugins: [],
};