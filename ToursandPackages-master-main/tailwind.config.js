/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0D9488",
        "secondary": "#14B8A6",
        "dark": "#0F172A",
        "accent": "#F43F5E",
        "cat-amber": "#D97706",
        "cat-blue": "#3B82F6",
        "cat-emerald": "#10B981",
        "cat-rose": "#F43F5E",
        "cat-purple": "#8B5CF6",
        "background-light": "#F8FAFC",
        "background-dark": "#0F172A",
        "card-bg": "#FFFFFF",
        "border-color": "#E2E8F0"
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "serif": ["Playfair Display", "serif"]
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
