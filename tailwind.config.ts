import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './App.tsx'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Work Sans"', 'sans-serif'],
        mono: ['"Source Code Pro"', 'monospace'],
      },
      colors: {
        'primary-bg': 'rgb(var(--color-primary-bg) / <alpha-value>)',
        'secondary-bg': 'rgb(var(--color-secondary-bg) / <alpha-value>)',
        'border-dark': 'rgb(var(--color-border-dark) / <alpha-value>)',
        'accent-primary': 'rgb(var(--color-accent-primary) / <alpha-value>)',
        'accent-secondary': 'rgb(var(--color-accent-secondary) / <alpha-value>)',
        'text-body': 'rgb(var(--color-text-body) / <alpha-value>)',
        'text-heading': 'rgb(var(--color-text-heading) / <alpha-value>)',
        'text-muted-1': 'rgb(var(--color-text-muted-1) / <alpha-value>)',
        'text-muted-2': 'rgb(var(--color-text-muted-2) / <alpha-value>)',
        'risk-critical': 'rgb(var(--color-risk-critical) / <alpha-value>)',
        'risk-high': 'rgb(var(--color-risk-high) / <alpha-value>)',
        'risk-suspicious': 'rgb(var(--color-risk-suspicious) / <alpha-value>)',
        'risk-safe': 'rgb(var(--color-risk-safe) / <alpha-value>)',
        'risk-info': 'rgb(var(--color-risk-info) / <alpha-value>)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'progress-fill-live': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'log-scroll': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
        'scan-beam': {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        'node-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.3)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'progress-fill-live': 'progress-fill-live 3.5s ease-out forwards',
        'log-scroll': 'log-scroll 5s linear infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'scan-beam': 'scan-beam 2s ease-in-out infinite',
        'node-pulse': 'node-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
