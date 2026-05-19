import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef0f9',
          100: '#d5d9f1',
          200: '#aab3e4',
          300: '#7f8dd6',
          400: '#5567c9',
          500: '#2a41bb',
          600: '#1B2B6B',
          700: '#16246b',
          800: '#111b52',
          900: '#0d1439',
        },
        secondary: {
          50: '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f28b8b',
          500: '#8B1A1A',
          600: '#7a1717',
          700: '#621212',
          800: '#4e0f0f',
          900: '#3d0b0b',
        },
        accent: {
          50: '#fdf8e7',
          100: '#faf0c8',
          200: '#f4e094',
          300: '#eccf5e',
          400: '#d4aa2e',
          500: '#C9A227',
          600: '#b38d22',
          700: '#92731b',
          800: '#745b16',
          900: '#5e4a12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      boxShadow: {
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px 0 rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

export default config
