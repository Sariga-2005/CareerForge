/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // CareerForge Brand Colors - Vibrant Professional Theme
        // Based on logo: Deep navy shield, vibrant blue accents
        primary: {
          DEFAULT: '#1E3A5F',  // Deep navy from logo
          50: '#E8EEF4',
          100: '#D1DCE9',
          200: '#A3B9D3',
          300: '#7596BD',
          400: '#4773A7',
          500: '#2B5797',
          600: '#1E3A5F',  // Main deep navy
          700: '#162B47',
          800: '#0F1D2F',
          900: '#070E17',
        },
        secondary: {
          DEFAULT: '#4A90D9',  // Vibrant blue from logo
          50: '#EBF4FC',
          100: '#D7E9F9',
          200: '#AFD3F3',
          300: '#87BDED',
          400: '#5FA7E7',
          500: '#4A90D9',  // Main vibrant blue
          600: '#3274BE',
          700: '#265992',
          800: '#1A3E66',
          900: '#0E233A',
        },
        // Accent for highlights and CTAs
        accent: {
          DEFAULT: '#3498DB',  // Bright blue for actions
          50: '#EBF5FC',
          100: '#D7EBF9',
          200: '#AFD7F3',
          300: '#87C3ED',
          400: '#5FAFE7',
          500: '#3498DB',
          600: '#2980B9',
          700: '#1F6690',
          800: '#154D67',
          900: '#0B333E',
        },
        // Background colors - Clean whites and soft grays
        surface: {
          DEFAULT: '#FFFFFF',
          50: '#FFFFFF',
          100: '#FAFBFC',
          200: '#F5F7FA',
          300: '#EDF1F5',
          400: '#E1E6ED',
          500: '#CBD4E0',
        },
        // Text colors with high contrast
        text: {
          DEFAULT: '#1A2B3C',
          primary: '#1A2B3C',
          secondary: '#3D5168',
          muted: '#637793',
          light: '#9AACBF',
        },
        // Semantic Colors
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#92400E',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#991B1B',
        },
        info: {
          DEFAULT: '#0EA5E9',
          light: '#E0F2FE',
          dark: '#0369A1',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'card-lg': '0 10px 40px -10px rgba(30, 58, 95, 0.2)',
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'glow': '0 0 20px rgba(74, 144, 217, 0.4)',
        'glow-primary': '0 0 30px rgba(30, 58, 95, 0.3)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'inner-glow': 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-right': 'slideRight 0.4s ease-out',
        'slide-left': 'slideLeft 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
        'bounce-soft': 'bounceSoft 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'gradient': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
