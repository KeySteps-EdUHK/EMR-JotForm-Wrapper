/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:   '#2b3990',
        orange: '#f99d33',
        pink:   '#f04e69',
        green:  '#8dbe50',
        yellow: '#f4d036',
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
