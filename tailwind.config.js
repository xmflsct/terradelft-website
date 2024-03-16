/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#292524',
        secondary: '#bd2716',
        background: '#f5f5f4',
        disabled: '#acacac'
      },
      flex: {
        2: '2 2 0%'
      },
      padding: {
        100: '100%'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}
