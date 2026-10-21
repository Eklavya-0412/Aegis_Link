/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

/*
 * Aegis Link — warm, calm palette.
 * The goal is a page that feels reassuring: low-glare warm backgrounds, a muted
 * slate-blue primary, soft sage for "all good", honey for attention and a
 * softened terracotta for critical states (always paired with an icon + label).
 */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
      // Type scale — each step pairs a size with a line height tuned for UI text.
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],      // 11px — eyebrows, chart ticks
        xs: ['0.75rem', { lineHeight: '1.125rem' }],         // 12px — metadata, badges
        '13': ['0.8125rem', { lineHeight: '1.25rem' }],      // 13px — labels, table cells, small buttons
        sm: ['0.875rem', { lineHeight: '1.375rem' }],        // 14px — body
        base: ['0.9375rem', { lineHeight: '1.5rem' }],       // 15px — card titles
        lg: ['1.0625rem', { lineHeight: '1.5rem' }],         // 17px — section titles
        xl: ['1.25rem', { lineHeight: '1.75rem' }],          // 20px — page titles
        '2xl': ['1.5rem', { lineHeight: '2rem' }],           // 24px — metric values
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],      // 30px — auth / landing headings
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      colors: {
        // Primary: muted slate blue (#7A9CC6 at 400). Buttons use 600+ for readable white text.
        brand: {
          50: '#F3F6FB',
          100: '#E4EBF5',
          200: '#CAD8EB',
          300: '#A6BEDD',
          400: '#7A9CC6',
          500: '#5F84B3',
          600: '#4E70A0',
          700: '#405C85',
          800: '#364D6D',
          900: '#2F415A',
          950: '#1F2B3C',
        },
        // Neutrals: warm surfaces (50–300), slate-charcoal text (600–800), midnight navy (900+).
        slate: {
          50: '#F8F6F3',
          100: '#F1EEE9',
          200: '#E7E2DB',
          300: '#D6D0C7',
          400: '#A39D94',
          500: '#6E6C6A',
          600: '#525661',
          700: '#3B4350',
          800: '#2A3240',
          900: '#1E2733',
          950: '#141B24',
        },
        // Success / "all good": muted sage (#629A7D at 500).
        emerald: {
          50: '#F1F7F3',
          100: '#DFEDE4',
          200: '#C0DBCA',
          300: '#9AC4AB',
          400: '#7AAF90',
          500: '#629A7D',
          600: '#4E8067',
          700: '#3F6853',
          800: '#345444',
          900: '#2B4538',
          950: '#17261F',
        },
        // Attention: warm honey.
        amber: {
          50: '#FCF7EC',
          100: '#F8EBCC',
          200: '#F0D597',
          300: '#E6BB61',
          400: '#DCA23A',
          500: '#C98A24',
          600: '#A86E1C',
          700: '#87561A',
          800: '#6F461B',
          900: '#5E3B1A',
          950: '#351F0B',
        },
        // Critical: softened terracotta — still unmistakable, never neon.
        red: {
          50: '#FDF3F1',
          100: '#FBE4E0',
          200: '#F5C6BE',
          300: '#EC9E92',
          400: '#DF7466',
          500: '#CF5646',
          600: '#B5432F',
          700: '#963626',
          800: '#7C2F23',
          900: '#672A21',
          950: '#38130E',
        },
        // Informational: calm sky blue.
        sky: {
          50: '#F2F7FB',
          100: '#E1EDF6',
          200: '#C4DBEE',
          300: '#9AC1E1',
          400: '#6EA3D0',
          500: '#4D88BC',
          600: '#3D6F9F',
          700: '#345A81',
          800: '#2E4C6A',
          900: '#2A4158',
          950: '#1B2A3A',
        },
        // AI-generated content: soft lavender.
        violet: {
          50: '#F6F4FB',
          100: '#ECE8F7',
          200: '#DAD2EF',
          300: '#BFB2E2',
          400: '#A18FD1',
          500: '#8873BF',
          600: '#725CA8',
          700: '#5E4B8B',
          800: '#4E4072',
          900: '#42375E',
          950: '#2A2240',
        },
        // Main page background (low-glare warm white).
        canvas: '#F8F6F3',
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(60 50 40 / 0.04)',
        card: '0 1px 2px 0 rgb(60 50 40 / 0.04), 0 4px 12px -4px rgb(60 50 40 / 0.06)',
        pop: '0 16px 40px -12px rgb(40 35 30 / 0.22), 0 4px 12px -4px rgb(40 35 30 / 0.08)',
      },
      spacing: {
        sidebar: '15rem',
      },
      keyframes: {
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(250%)' },
        },
      },
      animation: {
        progress: 'progress 0.9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
