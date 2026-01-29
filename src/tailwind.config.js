/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'carniblue': '#23a9e4',
        'carnidark': '#1a1a1a',
      },
    },
  },
  plugins: [],
}