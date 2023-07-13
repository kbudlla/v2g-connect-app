/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    // Ensure we don't override any antd styles
    preflight: false,
  },
  theme: {
    extend: {},
    fontFamily: {
      body: ['Roboto', 'sans-serif'],
    },
  },
  plugins: [],
};
