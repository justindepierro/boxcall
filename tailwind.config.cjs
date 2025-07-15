const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-[var(--color-bg)]',
    'text-[var(--color-text)]',
    'bg-[var(--color-accent)]',
    'border-[var(--color-border)]',
    'bg-[var(--color-sidebar)]',
    'text-[var(--color-header-text)]',
    'font-header',
    'font-body',
    'font-mono',
  ],
  theme: {
    extend: {
      fontFamily: {
        header: ['var(--font-header)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        main: 'var(--color-bg)',
        'text-main': 'var(--color-text)',
        'accent-main': 'var(--color-accent)',
        'border-main': 'var(--color-border)',
        'sidebar-main': 'var(--color-sidebar)',
        'header-main': 'var(--color-header)',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities, theme }) => {
      const fonts = theme('fontFamily');
      const newUtilities = {};
      for (const [key, value] of Object.entries(fonts)) {
        newUtilities[`.font-${key}`] = { fontFamily: value };
      }
      addUtilities(newUtilities, ['responsive']);
    }),
  ],
};
