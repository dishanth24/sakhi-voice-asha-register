/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D6B6E',
          light: '#14919B',
          dark: '#094F52',
        },
        surface: '#FFFFFF',
        background: '#F8F6F1',
        'text-primary': '#1A1A2E',
        'text-secondary': '#4A5568',
        amber: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          dark: '#991B1B',
        },
        success: {
          DEFAULT: '#059669',
          light: '#D1FAE5',
        },
        dark: {
          bg: '#0F172A',
          surface: '#1E293B',
          text: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
