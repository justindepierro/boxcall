import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],

  safelist: [
    {
      pattern: /^font-(h|b|m)-(classic|modern|professional|athletic|tech|casual)$/,
    },
  ],

  theme: {
    extend: {
      fontFamily: {
        inherit: 'inherit',
        header: 'inherit',
        body: 'inherit',
        mono: 'inherit',

        // === THEME FONT MAPS ===

        // athletic
        'h-athletic': ['"Oswald"', 'sans-serif'],
        'b-athletic': ['"Inter"', 'sans-serif'],
        'm-athletic': ['"Share Tech Mono"', 'monospace'],

        // casual
        'h-casual': ['"Comic Neue"', 'sans-serif'],
        'b-casual': ['"Open Sans"', 'sans-serif'],
        'm-casual': ['"Courier Prime"', 'monospace'],

        // classic
        'h-classic': ['"Merriweather Sans"', 'sans-serif'],
        'b-classic': ['"Inter"', 'sans-serif'],
        'm-classic': ['"Fira Mono"', 'monospace'],

        // modern
        'h-modern': ['"Inter"', 'sans-serif'],
        'b-modern': ['"Inter"', 'sans-serif'],
        'm-modern': ['"Fira Mono"', 'monospace'],

        // professional
        'h-professional': ['"Merriweather Sans"', 'sans-serif'],
        'b-professional': ['"Fira Sans"', 'sans-serif'],
        'm-professional': ['"Fira Mono"', 'monospace'],

        // tech
        'h-tech': ['"Orbitron"', 'sans-serif'],
        'b-tech': ['"Roboto"', 'sans-serif'],
        'm-tech': ['"JetBrains Mono"', 'monospace'],
      },

      colors: {
        // 🌈 Dynamic theme bindings to CSS variables
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
    plugin(function ({ addUtilities, theme }) {
      const families = theme('fontFamily');
      const utilities = {};

      for (const [key, value] of Object.entries(families)) {
        utilities[`.font-${key}`] = { fontFamily: value };
      }

      addUtilities(utilities, ['responsive']);

      addUtilities({
        '.font-header': { fontFamily: 'inherit' },
        '.font-body': { fontFamily: 'inherit' },
        '.font-mono': { fontFamily: 'inherit' },
      });
    }),
  ],
};
