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
        base: {
          light: '#FAFAF8',
          dark: '#16161A',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1F1F24',
        },
        primary: {
          light: '#1A1A1E',
          dark: '#F2F2F0',
        },
        secondary: {
          light: '#6B6B70',
          dark: '#9A9AA0',
        },
        accent: '#6C5CE7',
        success: {
          DEFAULT: '#2ECC71',
          tint: '#EAFBF1',
        },
        error: {
          DEFAULT: '#FF6B6B',
          tint: '#FFF0F0',
        },
        warning: {
          DEFAULT: '#FFB020',
          tint: '#FFF8E8',
        },
        divider: {
          light: '#EAEAE8',
          dark: '#2A2A30',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
