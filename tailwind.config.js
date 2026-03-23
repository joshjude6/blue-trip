// tailwind.config.js
import colors from 'tailwindcss/colors';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        blue: colors.red,
      },
      fontFamily: {
        kalmansk: ['Kalmansk', 'sans-serif'],
        saotorpes: ['SaoTorpes', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
