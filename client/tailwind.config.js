/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        status: {
          new: '#3B82F6',
          contacted: '#8B5CF6',
          qualified: '#06B6D4',
          proposal: '#F59E0B',
          negotiation: '#F97316',
          won: '#10B981',
          lost: '#EF4444',
        },
        score: {
          hot: '#10B981',
          warm: '#F59E0B',
          cold: '#EF4444',
        },
      },
    },
  },
  plugins: [],
};
