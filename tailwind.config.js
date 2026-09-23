/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Indian Railways Palette ──────────────────────
        ir: {
          navy:      '#0B1F3A',   // Primary Dark — sidebar, headings
          blue:      '#123A8C',   // Primary Blue — active nav, primary buttons
          royal:     '#0056B3',   // Accent Blue — links, info elements
          lightbg:   '#E8F1FF',   // Light Blue BG — AI panels, info surfaces
          palebg:    '#F2F6FC',   // Soft Blue Surface — selected rows, hover
          border:    '#D9E2EC',   // Blue-Gray Border
          text:      '#172B4D',   // Primary Text — Dark Navy
          sub:       '#5E6C84',   // Secondary Text — Slate Gray
          green:     '#16804B',   // Railway Green — success/approved
          amber:     '#D88900',   // Amber — warning/pending
          red:       '#C62828',   // Railway Red — critical/conflict
          yellow:    '#FDCC0D',   // Safety Yellow — highlight accent
          bg:        '#F4F7FA',   // Page Background
        },
        // Keep existing navy scale for backward compat
        navy: {
          50:  '#f0f4ff',
          100: '#dbe4ff',
          200: '#b3c7f7',
          300: '#7ea4ed',
          400: '#4d7de0',
          500: '#2a5fc5',
          600: '#1e4aa8',
          700: '#163886',
          800: '#0f2760',
          900: '#091840',
          950: '#050e25',
        },
        railway: {
          blue:    '#1e4aa8',
          navy:    '#091840',
          red:     '#c0392b',
          saffron: '#e67e22',
          green:   '#27ae60',
          gray:    '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
}
