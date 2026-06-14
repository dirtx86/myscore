import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        'accent-ink': 'var(--accent-ink)',
        live: 'var(--live)',
        danger: 'var(--danger)',
        warn: 'var(--warn)',
        info: 'var(--info)',
        'bg-0': 'var(--bg-0)',
        'bg-1': 'var(--bg-1)',
        'bg-2': 'var(--bg-2)',
        'bg-3': 'var(--bg-3)',
        'bg-inset': 'var(--bg-inset)',
        'text-base': 'var(--text)',
        'text-dim': 'var(--text-dim)',
        'text-mute': 'var(--text-mute)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        xs: 'var(--r-xs)',
        sm: 'var(--r-sm)',
        DEFAULT: 'var(--r)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },
      maxWidth: {
        page: 'var(--maxw)',
      },
      boxShadow: {
        card: 'var(--shadow)',
        sm: 'var(--shadow-sm)',
      },
    },
  },
  plugins: [],
} satisfies Config;
