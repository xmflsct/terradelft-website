/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#394c50',
        secondary: '#bd2716',
        background: '#f4f4f4',
        placeholder: '#ddd'
      },
      flex: {
        2: '2 2 0%'
      },
      padding: {
        100: '100%'
      }
    }
  },
  plugins: []
}
