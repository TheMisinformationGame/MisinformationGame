module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      width: {"30": "7.5rem"}
    },
  },
  variants: {
    extend: {
      dropShadow: ['hover'],
      scale: ['group-hover']
    },
  },
  plugins: [],
}
