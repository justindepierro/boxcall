/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html', // root HTML file
    './src/**/*.{html,js,jsx,ts,tsx}', // all files in /src
    './public/**/*.{html,js}', // (optional) if you use public JS or HTML
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
