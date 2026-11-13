/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lava: {
          50: '#fff2f0',
          100: '#ffe1dd',
          500: '#ff3621',
          600: '#e02410',
          700: '#b81c0c',
        },
        navy: {
          800: '#1B3139',
          900: '#111F24',
          950: '#0B1317',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
