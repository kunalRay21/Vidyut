/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: '#FF9933',
          300: '#FFB870',
          400: '#FFA84D',
          500: '#FF9933',
          600: '#E68020',
        },
        chakraNavy: {
          DEFAULT: '#000080',
          400: '#1E2F97',
          500: '#000080',
          600: '#000066',
        },
        indiaGreen: {
          DEFAULT: '#138808',
          400: '#1BA80C',
          500: '#138808',
          600: '#0E6B05',
        },
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
