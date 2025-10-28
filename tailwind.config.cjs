/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-1': 'var(--brand-1)',
        'brand-2': 'var(--brand-2)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to top right, var(--brand-1), var(--brand-2))',
      },
    },
  },
  plugins: [],
};
