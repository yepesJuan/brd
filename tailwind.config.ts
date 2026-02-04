import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Role-specific colors for badges
        tech: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        product: {
          50: '#faf5ff',
          500: '#a855f7',
          600: '#9333ea',
        },
        business: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
