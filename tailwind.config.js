/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Saira Stencil One"', '"Arial Black"', 'sans-serif'],
        body: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        theme: {
          bg: 'var(--bg-primary)',
          'bg-alt': 'var(--bg-secondary)',
          'bg-muted': 'var(--bg-tertiary)',
          card: 'var(--bg-card)',
          'card-hover': 'var(--bg-card-hover)',
          text: 'var(--text-primary)',
          'text-alt': 'var(--text-secondary)',
          'text-muted': 'var(--text-tertiary)',
          'text-faint': 'var(--text-muted)',
          border: 'var(--border-primary)',
          'border-subtle': 'var(--border-secondary)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          'accent-muted': 'var(--accent-muted)',
        },
        venom: {
          400: '#e23040',
          500: '#c1121f',
          600: '#9c0e19',
        },
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}
