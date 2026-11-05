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
        background: '#F7F8F4',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#1D332B',
          secondary: '#4B5563',
          muted: '#64748B',
          subtle: '#94A3B8',
        },
        accent: {
          DEFAULT: '#264C3F',
          hover: '#183B2E',
          subtle: '#EEF2E8',
          dark: '#203E32',
        },
        accessible: {
          DEFAULT: '#087F6D',
          hover: '#066355',
          subtle: '#E6F4F1',
          border: '#A7F3D0',
        },
        warning: {
          DEFAULT: '#B66A08',
          hover: '#925407',
          subtle: '#FEF3C7',
          border: '#FDE68A',
        },
        disruption: {
          DEFAULT: '#C43D43',
          hover: '#A32F34',
          subtle: '#FEE2E2',
          border: '#FECACA',
        },
        subtle: {
          border: '#DCE1D7',
          hover: '#F1F5F9',
        },
        operator: {
          bg: '#F7F8F4',
          surface: '#FFFFFF',
          card: '#EEF2E8',
          border: '#DCE1D7',
          ink: '#1D332B',
          accent: '#264C3F',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        heading: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(20, 36, 58, 0.05), 0 2px 4px -2px rgba(20, 36, 58, 0.05)',
        'floating': '0 10px 25px -5px rgba(20, 36, 58, 0.12), 0 8px 10px -6px rgba(20, 36, 58, 0.08)',
      }
    },
  },
  plugins: [],
}

