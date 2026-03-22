/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F0F1A',
          card: '#1A1A2E',
          border: '#2A2A3E',
        },
        income: '#00C897',
        expense: '#FF6B6B',
        accent: '#6C5CE7',
      },
    },
  },
  plugins: [],
};
