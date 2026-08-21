/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Saira Stencil One"', '"Arial Black"', 'sans-serif'],
        body: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        symbiote: {
          950: '#08080b',
          900: '#0e0e13',
          800: '#16161d',
          700: '#20202a',
          600: '#2c2c3a',
        },
        bone: {
          50: '#fafaf7',
          100: '#f0f0ea',
          300: '#cfcfc6',
          500: '#9b9b93',
          600: '#6f6f68',
        },
        venom: {
          400: '#e23040',
          500: '#c1121f',
          600: '#9c0e19',
        },
      },
    },
  },
  plugins: [],
}
