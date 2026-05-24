/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark:    '#050b18',
        darker:  '#020810',
        card:    '#0a1628',
        border:  '#1a2744',
        accent:  '#2563eb',
        glow:    '#38bdf8',
        neon:    '#06b6d4',
        danger:  '#ef4444',
        success: '#22c55e',
        muted:   '#64748b',
        gold:    '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow:  '0 0 24px rgba(56, 189, 248, 0.5)',
        blue:  '0 0 24px rgba(37, 99, 235, 0.5)',
        card:  '0 4px 24px rgba(0,0,0,0.5)',
        neon:  '0 0 24px rgba(6, 182, 212, 0.5)',
      },
      backgroundImage: {
        'gradient-gaming':  'linear-gradient(135deg, #050b18 0%, #0a1628 50%, #050b18 100%)',
        'gradient-card':    'linear-gradient(135deg, #0a1628 0%, #0d1e35 100%)',
        'gradient-accent':  'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
        'gradient-hero':    'linear-gradient(135deg, #1d4ed8 0%, #0891b2 50%, #0e7490 100%)',
        'gradient-button':  'linear-gradient(135deg, #2563eb, #0891b2)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:   { '0%': { transform: 'translateY(24px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        glowPulse: { '0%,100%': { boxShadow: '0 0 20px rgba(56,189,248,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(56,189,248,0.7)' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
};