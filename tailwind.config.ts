import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        bg: '#09090b',
        surface: '#111113',
        card: '#18181b',
        border: '#27272a',
        muted: '#3f3f46',
        accent: {
          DEFAULT: '#f97316',
          dim: 'rgba(249,115,22,0.12)',
          glow: 'rgba(249,115,22,0.3)',
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
        },
        synlo: {
          orange: '#f97316',
          amber: '#fbbf24',
          purple: '#a855f7',
          green: '#22c55e',
          red: '#ef4444',
          blue: '#3b82f6',
        },
      },
      borderRadius: {
        synlo: '14px',
        'synlo-sm': '8px',
        'synlo-lg': '20px',
        'synlo-xl': '28px',
      },
      boxShadow: {
        'glow-orange': '0 0 40px rgba(249,115,22,0.2)',
        'glow-sm': '0 4px 20px rgba(249,115,22,0.25)',
        'card': '0 1px 3px rgba(0,0,0,0.5)',
        'elevated': '0 20px 40px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'fade-in': 'fadeIn 0.3s ease both',
        'pulse-dot': 'pulseDot 2s infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 70%)',
        'card-glow': 'linear-gradient(135deg, rgba(249,115,22,0.05) 0%, transparent 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
export default config
