/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6F1',
        sand: '#F1E8DE',
        ink: '#2A2420',
        inkSoft: '#6B6058',
        clay: '#B98A6B',
        terra: '#C97B63',
        sage: '#8FA88F',
        blush: '#E8C7BD',
        danger: '#B4432F',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};