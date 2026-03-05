import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '640px',
      // => @media (min-width: 640px) { ... }

      md: '768px',
      // => @media (min-width: 768px) { ... }

      lg: '1024px',
      // => @media (min-width: 1024px) { ... }

      xl: '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      fontSize: {
        '4xl': '2.25rem',
        '2xl': '1.5rem',
        lg: '1.125rem',
        md: '1rem',
        sm: '0.875rem',
        xs: '0.75rem',
      },
      boxShadow: {
        top: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        left: '-4px 0 6px -1px rgba(0, 0, 0, 0.1)',
        right: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        influencer: {
          primary: 'var(--influencer-primary)',
          secondary: 'var(--influencer-secondary)',
        },
        brand: {
          primary: 'var(--brand-primary)',
          primary_10: 'var(--brand-primary_10)',
          secondary: 'var(--brand-secondary)',
        },
      },
      spacing: {
        72: '18rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
