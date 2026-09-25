/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefcf6",
          100: "#d5f7e7",
          200: "#aeefd2",
          300: "#78e0b8",
          400: "#42c99b",
          500: "#1fae82",
          600: "#148c69",
          700: "#137056",
          800: "#135946",
          900: "#12493b",
        },
      },
    },
  },
  plugins: [],
};
