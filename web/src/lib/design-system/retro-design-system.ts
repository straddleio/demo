/**
 * 8-Bit Retro Gaming Design System
 * Inspired by Fintech NerdCon aesthetic
 *
 * Use with shadcn/ui components for a pixel-perfect retro vibe
 */

type ColorScale = Record<string | number, string>;

const hexToRgb = (hex: string): string => {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;
  const int = parseInt(value, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `${r} ${g} ${b}`;
};

const colorVar = (variable: string): string => `rgb(var(${variable}) / <alpha-value>)`;

export const designSystem = {
  // Core Color Palette
  colors: {
    // Primary Neon Cyan (main accent)
    primary: {
      50: '#E0FFFF',
      100: '#B8FFFF',
      200: '#8FFFFE',
      300: '#66FFFE',
      400: '#3DFDFE',
      500: '#00FFFF', // Main cyan
      600: '#00D9D9',
      700: '#00B3B3',
      800: '#008C8C',
      900: '#006666',
      DEFAULT: '#00FFFF',
    },

    // Electric Blue (secondary accent)
    secondary: {
      50: '#E6F0FF',
      100: '#CCE0FF',
      200: '#99C2FF',
      300: '#66A3FF',
      400: '#3385FF',
      500: '#0066FF', // Main blue
      600: '#0052CC',
      700: '#003D99',
      800: '#002966',
      900: '#001433',
      DEFAULT: '#0066FF',
    },

    // Hot Magenta/Pink
    accent: {
      50: '#FFE6F5',
      100: '#FFCCEB',
      200: '#FF99D6',
      300: '#FF66C2',
      400: '#FF33AD',
      500: '#FF0099', // Main magenta
      600: '#CC007A',
      700: '#99005C',
      800: '#66003D',
      900: '#33001F',
      DEFAULT: '#FF0099',
    },

    // Golden Yellow (for special elements)
    gold: {
      50: '#FFF9E6',
      100: '#FFF3CC',
      200: '#FFE799',
      300: '#FFDB66',
      400: '#FFCF33',
      500: '#FFC300', // Main gold
      600: '#CC9C00',
      700: '#997500',
      800: '#664E00',
      900: '#332700',
      DEFAULT: '#FFC300',
    },

    // Status Accent Colors
    'accent-green': {
      DEFAULT: '#39FF14', // Neon green
      dark: '#00FF00',
    },
    'accent-red': {
      DEFAULT: '#FF0040', // Neon red/pink
      dark: '#FF0000',
    },
    'accent-blue': {
      DEFAULT: '#4169FF', // Electric blue
      dark: '#0066FF',
    },

    // Base Dark Colors
    background: {
      DEFAULT: '#0A0E1A', // Deep navy black
      dark: '#050810',
      card: '#0F1524',
      elevated: '#1A2032',
    },

    // Neutral grays with slight blue tint
    neutral: {
      50: '#F0F2F5',
      100: '#E1E5EA',
      200: '#C3CBD5',
      300: '#A5B1C0',
      400: '#8797AB',
      500: '#697D96',
      600: '#546478',
      700: '#3F4B5A',
      800: '#2A323C',
      900: '#15191E',
      DEFAULT: '#697D96',
    },
  },

  // Typography Scale
  typography: {
    fonts: {
      // Pixel fonts (you'll need to import these)
      pixel: '"Press Start 2P", "Courier New", monospace',
      pixelAlt: '"VT323", monospace',
      body: '"Space Mono", "Roboto Mono", monospace',
      display: '"Orbitron", sans-serif',
      kyu: '"Kyu", "Orbitron", sans-serif',
      sans: 'system-ui, -apple-system, sans-serif',
    },

    sizes: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
      '6xl': '3.75rem', // 60px
      '7xl': '4.5rem', // 72px
      '8xl': '6rem', // 96px
    },
  },

  // Spacing (follows 8px grid)
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    32: '8rem', // 128px
  },

  // Border Radius (mostly sharp for retro feel)
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px - subtle
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    pixel: '2px', // intentionally pixel-y
  },

  // Effects
  effects: {
    // Glow effects for neon elements
    glowCyan:
      '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3), 0 0 30px rgba(0, 255, 255, 0.1)',
    glowBlue:
      '0 0 10px rgba(0, 102, 255, 0.5), 0 0 20px rgba(0, 102, 255, 0.3), 0 0 30px rgba(0, 102, 255, 0.1)',
    glowMagenta:
      '0 0 10px rgba(255, 0, 153, 0.5), 0 0 20px rgba(255, 0, 153, 0.3), 0 0 30px rgba(255, 0, 153, 0.1)',
    glowGold:
      '0 0 10px rgba(255, 195, 0, 0.5), 0 0 20px rgba(255, 195, 0, 0.3), 0 0 30px rgba(255, 195, 0, 0.1)',

    // Scanline effect
    scanlines:
      'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0px, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 2px)',

    // CRT effect
    crt: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.15) 100%)',
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
} as const;

type ThemePalette = {
  primary: string;
  secondary: string;
  accent: string;
  gold: string;
  accentGreen: string;
  accentRed: string;
  accentBlue: string;
  background: {
    base: string;
    dark: string;
    card: string;
    elevated: string;
  };
  neutral: ColorScale;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  selection: {
    background: string;
    text: string;
  };
  effects: {
    glowPrimary: string;
    glowSecondary: string;
    glowAccent: string;
    glowGold: string;
    scanlines: string;
    crt: string;
  };
  shadows?: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
};

const defaultShadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 6px 14px rgba(0, 0, 0, 0.4)',
  lg: '0 14px 30px rgba(0, 0, 0, 0.5)',
  xl: '0 24px 48px rgba(0, 0, 0, 0.6)',
};

const darkTheme: ThemePalette = {
  primary: designSystem.colors.primary.DEFAULT,
  secondary: designSystem.colors.secondary.DEFAULT,
  accent: designSystem.colors.accent.DEFAULT,
  gold: designSystem.colors.gold.DEFAULT,
  accentGreen: designSystem.colors['accent-green'].DEFAULT,
  accentRed: designSystem.colors['accent-red'].DEFAULT,
  accentBlue: designSystem.colors['accent-blue'].DEFAULT,
  background: {
    base: designSystem.colors.background.DEFAULT,
    dark: designSystem.colors.background.dark,
    card: designSystem.colors.background.card,
    elevated: designSystem.colors.background.elevated,
  },
  neutral: designSystem.colors.neutral,
  text: {
    primary: designSystem.colors.neutral[100],
    secondary: designSystem.colors.neutral[300],
    muted: designSystem.colors.neutral[500],
    inverse: '#0A0E1A',
  },
  selection: {
    background: 'rgba(0, 255, 255, 0.18)',
    text: designSystem.colors.primary.DEFAULT,
  },
  effects: {
    glowPrimary: designSystem.effects.glowCyan,
    glowSecondary: designSystem.effects.glowBlue,
    glowAccent: designSystem.effects.glowMagenta,
    glowGold: designSystem.effects.glowGold,
    scanlines: designSystem.effects.scanlines,
    crt: designSystem.effects.crt,
  },
  shadows: defaultShadows,
};

const flexokiNeutral: ColorScale = {
  50: '#F2F0E5',
  100: '#E6E4D9',
  150: '#DAD8CE',
  200: '#CECDC3',
  300: '#B7B5AC',
  400: '#9F9D96',
  500: '#878580',
  600: '#6F6E69',
  700: '#575653',
  800: '#403E3C',
  900: '#282726',
  DEFAULT: '#6F6E69',
};

const flexokiLightTheme: ThemePalette = {
  primary: '#205EA6',      // Blue
  secondary: '#24837B',    // Cyan
  accent: '#A02F6F',       // Magenta
  gold: '#AD8301',         // Yellow
  accentGreen: '#66800B',  // Green
  accentRed: '#AF3029',    // Red
  accentBlue: '#205EA6',   // Blue
  background: {
    base: '#FFFCF0',       // Paper
    dark: '#F2F0E5',       // Base-50
    card: '#F2F0E5',       // Base-50
    elevated: '#FFFCF0',   // Paper
  },
  neutral: flexokiNeutral,
  text: {
    primary: '#100F0F',    // Black
    secondary: '#575653',  // Base-700
    muted: '#6F6E69',      // Base-600
    inverse: '#FFFCF0',    // Paper
  },
  selection: {
    background: 'rgba(32, 94, 166, 0.15)',
    text: '#100F0F',
  },
  effects: {
    glowPrimary: '0 0 8px rgba(32, 94, 166, 0.2), 0 0 16px rgba(32, 94, 166, 0.15)',
    glowSecondary: '0 0 8px rgba(36, 131, 123, 0.2), 0 0 16px rgba(36, 131, 123, 0.15)',
    glowAccent: '0 0 8px rgba(160, 47, 111, 0.2), 0 0 16px rgba(160, 47, 111, 0.15)',
    glowGold: '0 0 8px rgba(173, 131, 1, 0.2), 0 0 16px rgba(173, 131, 1, 0.15)',
    scanlines:
      'repeating-linear-gradient(0deg, rgba(16, 15, 15, 0.02) 0px, rgba(16, 15, 15, 0.02) 1px, transparent 1px, transparent 2px)',
    crt: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0) 0%, rgba(16, 15, 15, 0.03) 100%)',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(16, 15, 15, 0.06)',
    md: '0 4px 6px -1px rgba(16, 15, 15, 0.08), 0 2px 4px -1px rgba(16, 15, 15, 0.04)',
    lg: '0 10px 15px -3px rgba(16, 15, 15, 0.1), 0 4px 6px -2px rgba(16, 15, 15, 0.05)',
    xl: '0 20px 25px -5px rgba(16, 15, 15, 0.12), 0 10px 10px -5px rgba(16, 15, 15, 0.04)',
  },
};

const fontVars = `
  --font-pixel: ${designSystem.typography.fonts.pixel};
  --font-pixel-alt: ${designSystem.typography.fonts.pixelAlt};
  --font-body: ${designSystem.typography.fonts.body};
  --font-display: ${designSystem.typography.fonts.display};
  --font-kyu: ${designSystem.typography.fonts.kyu};
`;

const themeDefinitions = [
  { id: 'dark', selector: ':root', palette: darkTheme },
  {
    id: 'light',
    selector: "[data-theme='light']",
    palette: flexokiLightTheme,
  },
  // Future palettes can be added here
  {
    id: 'flexoki',
    selector: "[data-theme='flexoki']",
    palette: flexokiLightTheme,
  },
] as const;

const buildCssVarBlock = (selector: string, theme: ThemePalette): string => {
  const baseColors: Array<[string, string]> = [
    ['primary', theme.primary],
    ['secondary', theme.secondary],
    ['accent', theme.accent],
    ['gold', theme.gold],
    ['accent-green', theme.accentGreen],
    ['accent-red', theme.accentRed],
    ['accent-blue', theme.accentBlue],
  ];

  const baseLines = baseColors
    .map(
      ([name, value]) =>
        `  --color-${name}: ${value};\n  --color-${name}-rgb: ${hexToRgb(value)};`
    )
    .join('\n');

  const neutralLines = Object.entries(theme.neutral)
    .filter(([shade]) => shade !== 'DEFAULT')
    .map(
      ([shade, value]) =>
        `  --color-neutral-${shade}: ${value};\n  --color-neutral-${shade}-rgb: ${hexToRgb(value)};`
    )
    .join('\n');

  return `
${selector} {
  ${fontVars.trim()}
  ${baseLines}
  --color-background: ${theme.background.base};
  --color-background-rgb: ${hexToRgb(theme.background.base)};
  --color-background-dark: ${theme.background.dark};
  --color-background-dark-rgb: ${hexToRgb(theme.background.dark)};
  --color-background-card: ${theme.background.card};
  --color-background-card-rgb: ${hexToRgb(theme.background.card)};
  --color-background-elevated: ${theme.background.elevated};
  --color-background-elevated-rgb: ${hexToRgb(theme.background.elevated)};
  ${neutralLines}
  --color-text-primary: ${theme.text.primary};
  --color-text-primary-rgb: ${hexToRgb(theme.text.primary)};
  --color-text-secondary: ${theme.text.secondary};
  --color-text-secondary-rgb: ${hexToRgb(theme.text.secondary)};
  --color-text-muted: ${theme.text.muted};
  --color-text-muted-rgb: ${hexToRgb(theme.text.muted)};
  --color-text-inverse: ${theme.text.inverse};
  --color-text-inverse-rgb: ${hexToRgb(theme.text.inverse)};
  --color-selection-bg: ${theme.selection.background};
  --color-selection-text: ${theme.selection.text};
  --shadow-sm: ${theme.shadows?.sm ?? defaultShadows.sm};
  --shadow-md: ${theme.shadows?.md ?? defaultShadows.md};
  --shadow-lg: ${theme.shadows?.lg ?? defaultShadows.lg};
  --shadow-xl: ${theme.shadows?.xl ?? defaultShadows.xl};
  --effect-glow-primary: ${theme.effects.glowPrimary};
  --effect-glow-secondary: ${theme.effects.glowSecondary};
  --effect-glow-accent: ${theme.effects.glowAccent};
  --effect-glow-gold: ${theme.effects.glowGold};
  --effect-scanlines: ${theme.effects.scanlines};
  --effect-crt: ${theme.effects.crt};
}
`.trim();
};

export const cssVariables = themeDefinitions
  .map(({ selector, palette }) => buildCssVarBlock(selector, palette))
  .join('\n\n');

export const injectCssVariables = (): void => {
  if (typeof document === 'undefined') {
    return;
  }
  if (document.getElementById('retro-design-system-vars')) {
    return;
  }
  const style = document.createElement('style');
  style.id = 'retro-design-system-vars';
  style.innerHTML = cssVariables;
  document.head.append(style);
};

const neutralPalette = Object.fromEntries(
  Object.keys(designSystem.colors.neutral)
    .filter((key) => key !== 'DEFAULT')
    .map((shade) => [shade, colorVar(`--color-neutral-${shade}-rgb`)])
);

const surfacePalette = {
  DEFAULT: colorVar('--color-background-rgb'),
  dark: colorVar('--color-background-dark-rgb'),
  card: colorVar('--color-background-card-rgb'),
  elevated: colorVar('--color-background-elevated-rgb'),
};

const textPalette = {
  primary: colorVar('--color-text-primary-rgb'),
  secondary: colorVar('--color-text-secondary-rgb'),
  muted: colorVar('--color-text-muted-rgb'),
  inverse: colorVar('--color-text-inverse-rgb'),
};

export const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: colorVar('--color-primary-rgb'),
        secondary: colorVar('--color-secondary-rgb'),
        accent: colorVar('--color-accent-rgb'),
        gold: colorVar('--color-gold-rgb'),
        'accent-green': {
          DEFAULT: colorVar('--color-accent-green-rgb'),
          dark: colorVar('--color-accent-green-rgb'),
        },
        'accent-red': {
          DEFAULT: colorVar('--color-accent-red-rgb'),
          dark: colorVar('--color-accent-red-rgb'),
        },
        'accent-blue': {
          DEFAULT: colorVar('--color-accent-blue-rgb'),
          dark: colorVar('--color-accent-blue-rgb'),
        },
        background: surfacePalette,
        neutral: neutralPalette,
        text: textPalette,
        success: colorVar('--color-accent-green-rgb'),
        warning: colorVar('--color-gold-rgb'),
        error: colorVar('--color-accent-red-rgb'),
        info: colorVar('--color-accent-blue-rgb'),
      },
      fontFamily: {
        pixel: ['var(--font-pixel)', '"Press Start 2P"', '"Courier New"', 'monospace'],
        'pixel-alt': ['var(--font-pixel-alt)', '"VT323"', 'monospace'],
        body: ['var(--font-body)', '"Space Mono"', '"Roboto Mono"', 'monospace'],
        display: ['var(--font-display)', '"Orbitron"', 'sans-serif'],
        kyu: ['var(--font-kyu)', '"Orbitron"', 'sans-serif'],
      },
      fontSize: designSystem.typography.sizes,
      spacing: designSystem.spacing,
      borderRadius: designSystem.borderRadius,
      boxShadow: {
        'glow-cyan': 'var(--effect-glow-primary)',
        'glow-blue': 'var(--effect-glow-secondary)',
        'glow-magenta': 'var(--effect-glow-accent)',
        'glow-gold': 'var(--effect-glow-gold)',
        'glow-primary': 'var(--effect-glow-primary)',
        'glow-accent': 'var(--effect-glow-accent)',
        'glow-green':
          '0 0 10px rgb(var(--color-accent-green-rgb) / 0.5), 0 0 20px rgb(var(--color-accent-green-rgb) / 0.3)',
        'neon-primary':
          '0 0 10px rgb(var(--color-primary-rgb) / 0.5), 0 0 20px rgb(var(--color-primary-rgb) / 0.3)',
        'neon-primary-lg':
          '0 0 15px rgb(var(--color-primary-rgb) / 0.7), 0 0 30px rgb(var(--color-primary-rgb) / 0.5)',
        'neon-accent':
          '0 0 10px rgb(var(--color-accent-rgb) / 0.5), 0 0 20px rgb(var(--color-accent-rgb) / 0.3)',
        'neon-accent-lg':
          '0 0 15px rgb(var(--color-accent-rgb) / 0.7), 0 0 30px rgb(var(--color-accent-rgb) / 0.5)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        flicker: 'flicker 0.15s infinite',
        scan: 'scan 8s linear infinite',
        'pixel-fade-in': 'pixel-fade-in 0.3s ease-out',
        shake: 'shake 0.5s ease-in-out',
        sparkle: 'sparkle 1s ease-out forwards',
        'bounce-subtle': 'bounce-subtle 0.6s ease-in-out',
        'progress-ring': 'progress-ring 1.5s ease-out forwards',
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow:
              '0 0 10px rgb(var(--color-primary-rgb) / 0.5), 0 0 20px rgb(var(--color-primary-rgb) / 0.3)',
          },
          '50%': {
            boxShadow:
              '0 0 20px rgb(var(--color-primary-rgb) / 0.8), 0 0 30px rgb(var(--color-primary-rgb) / 0.5), 0 0 40px rgb(var(--color-primary-rgb) / 0.3)',
          },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pixel-fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Decision Animation Effects
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'reject-flash': {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
          '100%': { opacity: '0' },
        },
        'approve-glow': {
          '0%': { opacity: '0.3' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '0' },
        },
        sparkle: {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-50px) scale(0)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'progress-ring': {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: '0' },
        },
        'pulse-ring': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [
    // Add text shadow plugin for text-glow utilities
    function ({
      addUtilities,
    }: {
      addUtilities: (utilities: Record<string, Record<string, string>>) => void;
    }) {
      addUtilities({
        '.text-glow-primary': {
          textShadow:
            '0 0 10px rgb(var(--color-primary-rgb) / 0.8), 0 0 20px rgb(var(--color-primary-rgb) / 0.4)',
        },
        '.text-glow-secondary': {
          textShadow:
            '0 0 10px rgb(var(--color-secondary-rgb) / 0.8), 0 0 20px rgb(var(--color-secondary-rgb) / 0.4)',
        },
        '.text-glow-accent': {
          textShadow:
            '0 0 10px rgb(var(--color-accent-rgb) / 0.8), 0 0 20px rgb(var(--color-accent-rgb) / 0.4)',
        },
      });
    },
  ],
};

export type DesignSystem = typeof designSystem;
