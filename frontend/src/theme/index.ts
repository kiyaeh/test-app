const theme = {
  colors: {
    // Backgrounds — layered depth
    bg0: '#080B12',       // deepest canvas
    bg1: '#0E1118',       // sidebar
    bg2: '#131720',       // cards
    bg3: '#1A2030',       // elevated / hover
    bg4: '#212840',       // active / selected

    // Brand — electric violet
    brand:      '#8B5CF6',
    brandLight: '#A78BFA',
    brandDark:  '#6D28D9',
    brandGlow:  'rgba(139,92,246,0.22)',

    // Accent — rose
    rose:     '#F43F5E',
    roseGlow: 'rgba(244,63,94,0.18)',

    // Accent — cyan
    cyan:     '#06B6D4',
    cyanGlow: 'rgba(6,182,212,0.15)',

    // Text hierarchy
    text1: '#F0F4FF',   // headings
    text2: '#B8C4D8',   // body
    text3: '#6B7A99',   // muted / labels
    text4: '#3D4A63',   // faint / disabled

    // Borders
    border1: 'rgba(255,255,255,0.06)',
    border2: 'rgba(139,92,246,0.35)',

    // Status
    error:   '#F87171',
    errorBg: 'rgba(248,113,113,0.1)',
    success: '#34D399',

    // Legacy aliases
    primary:    '#8B5CF6',
    surface:    '#131720',
    background: '#080B12',
    text:       '#F0F4FF',
    textMuted:  '#6B7A99',
    border:     'rgba(255,255,255,0.06)',
  },
  fontSizes: [11, 13, 15, 18, 22, 30, 44],
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64],
  radii: [0, 6, 10, 16, 9999],
  breakpoints: ['576px', '768px', '992px', '1200px'],
  fonts: {
    body:    "'Inter', system-ui, sans-serif",
    heading: "'Inter', system-ui, sans-serif",
  },
  fontWeights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
};

export type Theme = typeof theme;
export default theme;
