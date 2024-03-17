/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F7F7F8',
          100: '#EBE8F2',
          200: '#CFC4E9',
          300: '#AE94E5',
          400: '#8D63E9',
          500: '#6821FC',
          600: '#571ED2',
          700: '#4B269C',
          800: '#402A6F',
          900: '#302744',
          950: '#28262C',
        },
      },
    },
  },
  plugins: [],
}
