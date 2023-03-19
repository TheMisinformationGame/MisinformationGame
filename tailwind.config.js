module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['Noto\\ Sans', 'Helvetica', 'Arial', 'sans-serif'],
                'roboto': ['Roboto', 'Noto\\ Sans', 'Helvetica', 'Arial', 'sans-serif']
            },
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
                "mini": "1.5rem",
                "home": "800px"
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
                brand: {
                    400: '#16418A',
                    500: '#006be2',
                    600: '#227be2'
                }
            }
        },
    },
    plugins: [],
}
