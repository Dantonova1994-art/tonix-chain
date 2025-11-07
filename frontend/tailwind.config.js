/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00ffff',
          blue: '#0088ff',
        },
      },
      backgroundImage: {
        'cosmic-gradient': 'radial-gradient(circle at top, #00ffff 0%, #000055 50%, #000000 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00ffff 0%, #0088ff 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'Satoshi', 'Poppins', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

