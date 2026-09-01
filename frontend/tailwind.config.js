/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'db-red': 'var(--db-red)',
        'db-navy': 'var(--db-navy)',
        'db-black': 'var(--db-black)',
        'db-white': 'var(--db-white)',
        'db-gray-100': 'var(--db-gray-100)',
        'db-gray-200': 'var(--db-gray-200)',
        'blue': '#0066FF',
      },
      fontFamily: {
        sans: ['CustomFont', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      },
    },
  },
  plugins: [],
}
