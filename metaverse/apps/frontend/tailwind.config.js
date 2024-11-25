/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
   extend: {
      animation: {
        'twinkle': 'twinkle 2s infinite',
      },
    },
  },
  plugins: [],
}