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
        background: '#F7F9FC',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#14243A',
          secondary: '#4B5563',
          muted: '#64748B',
          subtle: '#94A3B8',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          subtle: '#EFF6FF',
          dark: '#1E40AF',
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
          border: '#E2E8F0',
          hover: '#F1F5F9',
        },
        operator: {
          bg: '#0B132B',
          surface: '#1C2541',
          card: '#1F2A48',
          border: '#3A506B',
          ink: '#F8FAFC',
          accent: '#4895EF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'sans-serif'],
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

