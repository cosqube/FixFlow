/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F4F1EA',
        primary: '#151515',
        secondary: '#6B6B67',
        accent: '#E63946', // Industrial red/vermilion
        warning: '#F5A623',
        critical: '#D0021B',
        success: '#27AE60',
        surface: '#EAE5D9', // Slightly darker than background for contrast areas
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'solid': '4px 4px 0px 0px rgba(21, 21, 21, 1)',
      }
    },
  },
  plugins: [],
}

