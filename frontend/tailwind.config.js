/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        acid: '#CCFF00',
        forge: { bg: '#0A0A0A', card: '#111111', border: '#1E1E1E', muted: '#2A2A2A', text: '#888888' }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif']
      }
    }
  },
  plugins: []
}
