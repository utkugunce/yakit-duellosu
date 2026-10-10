/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        utku: {
          light: '#f0f9ff',
          DEFAULT: '#0284c7',
          dark: '#0369a1',
          border: '#38bdf8',
        },
        gozde: {
          light: '#fff1f2',
          DEFAULT: '#e11d48',
          dark: '#be123c',
          border: '#fb7185',
        }
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'SF Mono',
          'Menlo',
          'Monaco',
          'Consolas',
          'ui-monospace',
          'monospace'
        ]
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom, 16px)',
        'safe-top': 'env(safe-area-inset-top, 0px)',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sheetUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'sheet-up': 'sheetUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) both',
        'fade-in': 'fadeIn 0.2s ease-out both',
      }
    },
  },
  plugins: [],
}
