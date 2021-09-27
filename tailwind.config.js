module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      width: {"30": "7.5rem"}
    },
    boxShadow: {
      'up': '0 10px 20px 5px rgba(0, 0, 0, 0.3)',
    }
  },
  variants: {
    extend: {
      dropShadow: ['hover'],
      scale: ['group-hover']
    },
  },
  plugins: [],
}
