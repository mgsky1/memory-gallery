import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        'warm-gray': {
          100: '#f5f5f4',
          200: '#e7e5e4',
          400: '#a8a29e',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config 