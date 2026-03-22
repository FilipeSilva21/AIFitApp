/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A', // slate-900
          card: '#1E293B', // slate-800
          border: '#334155', // slate-700
        },
        primary: {
          DEFAULT: '#06B6D4', // cyan-500
          hover: '#0891B2', // cyan-600
          glow: 'rgba(6, 182, 212, 0.5)'
        },
        accent: {
          DEFAULT: '#8B5CF6', // violet-500
          hover: '#7C3AED', // violet-600
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #8B5CF633 0deg, #06B6D433 180deg, #8B5CF633 360deg)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
