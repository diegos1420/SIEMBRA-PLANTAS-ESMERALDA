/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          verde: '#3A5421',
          'verde-hover': '#2e431a',
          'verde-dark': '#1c2b0f',
          'verde-light': '#e8efe2',
          crema: '#F4EFE3',
          'crema-light': '#FBF9F4',
          'crema-dark': '#E6DCC8',
          ocre: '#C96B28',
          'ocre-hover': '#b05b1e',
          'ocre-light': '#FDF4EB',
          carbon: '#2D2E26',
          'carbon-muted': '#5C5E54',
          'carbon-light': '#8C8E82',
          border: '#DDD6C7'
        },
        semaforo: {
          excelente: '#3A5421',
          atencion: '#D9A726',
          riesgo: '#C96B28',
          critico: '#B83232',
          info: '#2D2E26'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
        display: ['Outfit', 'Arial', 'sans-serif']
      },
      boxShadow: {
        'card': '0 4px 14px 0 rgba(45, 46, 38, 0.06)',
        'card-hover': '0 10px 25px -3px rgba(45, 46, 38, 0.12)',
        'modal': '0 20px 40px -15px rgba(45, 46, 38, 0.3)',
      }
    },
  },
  plugins: [],
}
