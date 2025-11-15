/** @type {import('tailwindcss').Config} */
import { tailwindConfig } from './src/lib/design-system/retro-design-system';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      ...tailwindConfig.theme.extend,
    },
  },
  plugins: [],
};
