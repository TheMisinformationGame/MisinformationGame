module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      scale: {
        '-1': '-1'
      },
      transitionProperty: {
        'height': 'height'
      },
      width: {
        "xl": "36rem"
      },
      maxWidth: {
        "mini": "1.5rem"
      },
      boxShadow: {
        'up': '0 10px 20px 5px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active'],
      dropShadow: ['hover'],
      scale: ['group-hover']
    },
  },
  plugins: [],
}
