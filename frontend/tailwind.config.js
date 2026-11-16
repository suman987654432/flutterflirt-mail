/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          900: '#2e1065',
        },
        mail: {
          blue: '#1a56db',
          pink: '#f43f5e',
          dark: '#0f172a',
        }
      },
    },
  },
  plugins: [],
};

