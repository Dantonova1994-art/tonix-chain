/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        tonixCyan: "#00FFFF",
        tonixBlue: "#007BFF"
      }
    }
  },
  plugins: []
};

