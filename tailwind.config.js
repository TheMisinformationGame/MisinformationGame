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
        'up': '0 10px 10px 5px rgba(0, 0, 0, 1)',
        'floatingbutton': '0 1px 6px -1px rgba(0,0,0,0.65)',
      },
      colors: {
        gray: {
          25: '#FDFEFF',
          975: '#040302',
        },
      }
    },
  },
  plugins: [],
}
