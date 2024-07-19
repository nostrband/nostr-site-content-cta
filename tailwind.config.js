module.exports = {
  content: ['./src/**/*.{html,js,ts}'],
  theme: {
    extend: {
      keyframes: {
        slideInBlurredTop: {
          '0%': {
            transform: 'translateY(200%)',
            transformOrigin: '50% 0%',
            filter: 'blur(40px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            transformOrigin: '50% 50%',
            filter: 'blur(0)',
            opacity: '1',
          },
        },
      },
      animation: {
        'slide-in-blurred-top': 'slideInBlurredTop 0.2s cubic-bezier(0.785, 0.135, 0.150, 0.860) both',
      },
    },
  },
  plugins: [],
}
