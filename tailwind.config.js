/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'coin-spin': 'coin-spin 3s linear infinite',
        'reward-burst': 'reward-burst 1s ease-out',
        'progress-glow': 'progress-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

