/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'fwc-bg': '#050509',
        'fwc-card': '#0E0E13',
        'fwc-card-elevated': '#161620',
        'fwc-gold': '#F3A81D',
        'fwc-red': '#D80027',
        'fwc-green': '#009A44',
        'fwc-blue': '#0052B4',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
