/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
      'spin-slow': 'spin 2.5s linear infinite',
    },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ['Inter', 'sans-serif'],
        bebas: ['"Bebas Neue"', 'cursive'],
      },
      colors: {
        'custom-dark': '#060B0D',
      },
    },
  },
  plugins: [],
};
