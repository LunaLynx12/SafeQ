/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        quantum: {
          50: '#faf7ff',
          100: '#f3edff',
          200: '#e9ddff',
          300: '#d4c1ff',
          400: '#b794f6',
          500: '#9f7aea',
          600: '#8b5cf6',
          700: '#7c3aed',
          800: '#6b46c1',
          900: '#553c9a',
        },
        cyber: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        neon: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        }
      },
      backgroundImage: {
        'quantum-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'cyber-gradient': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        'neon-gradient': 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        'dark-gradient': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 5px #8b5cf6, 0 0 10px #8b5cf6, 0 0 15px #8b5cf6' },
          'to': { boxShadow: '0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 30px #8b5cf6' },
        }
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
};