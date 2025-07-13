import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Mono', 'monospace'],
      serif: ['Merriweather', 'serif'],
    },
    extend: {
      fontFamily: {
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
    },
  },
  plugins: [
    plugin(function ({ addUtilities, theme }) {
      const families = theme('fontFamily');
      const newUtilities = {};

      for (const [key, value] of Object.entries(families)) {
        newUtilities[`.font-${key}`] = { fontFamily: value };
      }

      addUtilities(newUtilities, ['responsive']);
    }),
  ],
};
