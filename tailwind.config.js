module.exports = {
  content: ['./src/**/*.{html,js,ts}'],
  theme: {
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['18px', '28px'],
      xl: ['20px', '28px'],
      '2xl': ['24px', '32px'],
      '3xl': ['30px', '36'],
      '4xl': ['36px', '40px'],
      '5xl': ['48px', '1'],
      '6xl': ['60px', '1'],
      '7xl': ['72px', '1'],
      '8xl': ['96px', '1'],
      '9xl': ['128px', '1'],
    },
    extend: {
      keyframes: {
        slideInBlurredTop: {
          '0%': {
            transform: 'translate(-50%,-200%)',
            transformOrigin: '50% 0%',
            filter: 'blur(40px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translate(-50%, -50%)',
            transformOrigin: '50% 50%',
            filter: 'blur(0)',
            opacity: '1',
          },
        },
        slideInBottom: {
          '0%': {
            '-webkit-transform': 'translateY(1000px)',
            transform: 'translateY(1000px)',
            opacity: 0,
          },
          '100%': {
            '-webkit-transform': 'translateY(0)',
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
      },
      animation: {
        'slide-in-blurred-top': 'slideInBlurredTop 0.2s cubic-bezier(0.785, 0.135, 0.150, 0.860) both',
        'slide-in-bottom': 'slideInBottom 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}
