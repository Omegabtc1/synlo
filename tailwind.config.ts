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
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg:      '#f8f7f4',
        surface: '#ffffff',
        border:  '#e5e4e0',
        'border-2': '#d1cfc9',
        text:    '#111110',
        'text-2': '#57534e',
        'text-3': '#a8a29e',
        accent:  '#e8410a',
        'accent-2': '#f97316',
        dark:    '#111110',
        'dark-2': '#1c1917',
        'dark-3': '#292524',
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)',
        modal: '0 24px 64px rgba(0,0,0,0.14)',
        'accent-glow': '0 4px 16px rgba(232,65,10,0.35)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #e8410a, #f97316)',
        'dark-gradient': 'linear-gradient(135deg, #111110, #1c1917)',
      },
    },
  },
  plugins: [],
}

export default config
