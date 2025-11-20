import { designSystem } from '@/lib/design-system/retro-design-system';

const readCssVar = (name: string, fallback: string): string => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  return value?.trim() || fallback;
};

export const SPRITE_CONFIG = {
  font: {
    get family(): string {
      return readCssVar('--font-pixel', designSystem.typography.fonts.pixel);
    },
    sizes: {
      small: 12,
      medium: 16,
      large: 24,
      xlarge: 32,
    },
  },
  glow: {
    blur: 4,
    offsetX: 0,
    offsetY: 0,
  },
  colors: {
    get cyan(): string {
      return readCssVar('--color-primary', designSystem.colors.primary.DEFAULT);
    },
    get magenta(): string {
      return readCssVar('--color-accent', designSystem.colors.accent.DEFAULT);
    },
    get yellow(): string {
      return readCssVar('--color-gold', designSystem.colors.gold.DEFAULT);
    },
    get green(): string {
      return readCssVar('--color-accent-green', designSystem.colors['accent-green'].DEFAULT);
    },
    get white(): string {
      return readCssVar('--color-text-inverse', '#FFFFFF');
    },
    get black(): string {
      return readCssVar('--color-background', designSystem.colors.background.dark);
    },
  },
};
