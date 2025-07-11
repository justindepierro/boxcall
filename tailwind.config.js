export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
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

        // athletic
        'h-athletic': ['"Oswald"', 'sans-serif'],
        'b-athletic': ['"Inter"', 'sans-serif'],
        'm-athletic': ['"Share Tech Mono"', 'monospace'],

        // tech
        'h-tech': ['"Orbitron"', 'sans-serif'],
        'b-tech': ['"Roboto"', 'sans-serif'],
        'm-tech': ['"JetBrains Mono"', 'monospace'],

        // casual
        'h-casual': ['"Comic Neue"', 'sans-serif'],
        'b-casual': ['"Open Sans"', 'sans-serif'],
        'm-casual': ['"Courier Prime"', 'monospace'],
      },
    },
  },
  plugins: [],
}