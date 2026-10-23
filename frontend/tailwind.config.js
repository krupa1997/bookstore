/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#121316',
          card: '#1b1c20',
          sidebar: '#16171a',
          border: '#28292e',
          hover: '#222328',
          input: '#222328',
        },
        brand: {
          blue: '#1d70f5',
          'blue-hover': '#155cd0',
          accent: '#3b82f6',
          tag: '#60a5fa'
        }
      }
    },
  },
  plugins: [],
}
