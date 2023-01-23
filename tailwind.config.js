module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
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
  plugins: [],
}
