import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        clinic: {
          primary: '#0F766E',
          dark: '#0B4F4A',
          tint: '#7FCFC4',
          alert: '#E0795B',
          page: '#F2FAF9',
          side: '#E6F6F4',
          ink: '#0F2B2B',
          muted: '#4A6666',
          border: '#D5E8E5',
        },
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
