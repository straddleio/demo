# Ayu Light Theme Implementation

## Overview

A sophisticated light mode preset built on the shared theme tokens. Ayu is the out-of-the-box light palette, but the new token system makes it simple to swap in any palette (Ayu, Cattupicn, etc.) by editing `themeDefinitions` in `web/src/lib/design-system/retro-design-system.ts`.

## Design Philosophy

### Dark Mode (Existing)
- **Aesthetic**: Retro 8-bit gaming, neon lights, CRT glow
- **Colors**: Cyan (#00FFFF), Blue (#0066FF), Magenta (#FF0099), Gold (#FFC300)
- **Feel**: Night arcade, Blade Runner vibes, intense neon glow

### Light Mode (New - Ayu Light)
- **Aesthetic**: Warm daylight terminal, refined minimalism, sunlit workspace
- **Colors**: Cyan-Blue (#55B4D4), Rich Blue (#399EE6), Warm Orange (#FA8D3E), Amber Gold (#FFAA33)
- **Feel**: Clean paper terminal, sophisticated workspace, soft warm accents

## Color Palette

### Primary UI Colors
```css
--color-primary: #55B4D4        /* Bright cyan-blue for primary actions */
--color-secondary: #399EE6      /* Rich blue for secondary elements */
--color-accent: #FA8D3E         /* Warm orange for accents */
--color-gold: #FFAA33           /* Amber gold for highlights */
```

### Background Layers
```css
--color-background: #FCFCFC             /* Pure white base */
--color-background-dark: #F8F9FA        /* Subtle gray for panels */
--color-background-card: #F3F4F5        /* Card backgrounds */
--color-background-elevated: #FFFFFF    /* Elevated surfaces */
```

### Text Colors
```css
--color-text-primary: #5C6166           /* Main text */
--color-text-secondary: #8A9199         /* Secondary text */
--color-text-muted: #ABB0B6             /* Muted text */
--color-text-inverse: #FCFCFC           /* Text on dark backgrounds */
```

### Syntax Highlighting (from Ayu Light)
```css
--color-syntax-tag: #55B4D4       /* Tags */
--color-syntax-func: #F2AE49      /* Functions */
--color-syntax-string: #86B300    /* Strings */
--color-syntax-keyword: #FA8D3E   /* Keywords */
--color-syntax-constant: #A37ACC  /* Constants */
```

### Semantic Colors
```css
--color-success: #86B300    /* Green for success states */
--color-warning: #F2AE49    /* Amber for warnings */
--color-error: #E65050      /* Red for errors */
--color-info: #399EE6       /* Blue for info */
```

## Key Features

### 1. Refined Visual Effects
- **Soft Glows**: Replaced intense neon with subtle sunlit highlights
- **Subtle Shadows**: Multi-layer shadows for refined depth
- **Minimal Scanlines**: Very subtle CRT effect (2% opacity vs 15% in dark mode)

### 2. Enhanced Readability
- High contrast text on light backgrounds
- Clear visual hierarchy with refined border colors
- Appropriate font weights for light mode

### 3. Smooth Transitions
All theme-aware properties transition smoothly:
- Background colors: 0.3s ease
- Text colors: 0.3s ease
- Border colors: 0.3s ease
- Box shadows: 0.3s ease

### 4. Component Coverage
All retro components have light mode variants:
- `.retro-card` - Cards with refined borders
- `.retro-button` - Crisp tactile buttons
- `.terminal-output` - Warm paper terminal
- `.pixel-text` - Clear readable pixel fonts
- `.retro-input` - Clean focused inputs
- `.retro-badge` - Minimal badges
- `.scrollbar-retro` - Refined scrollbars

## Usage

### Theme Owner
- `ThemeProvider` (see `web/src/main.tsx`) injects the CSS variables and wires system-pref detection + localStorage.
- `useTheme` (see `web/src/lib/theme/useTheme.tsx`) exposes `theme`, `preference`, `toggleTheme`, and `setTheme` for components.
- The ConnectionStatus chip uses `useTheme` for the public toggle; add more toggles by consuming the same hook.

### Applying Theme Styles
All theme styles use CSS attribute selectors:

```css
/* Dark mode (default) */
.retro-card {
  background-color: var(--color-background-card);
}

/* Light mode override */
[data-theme='light'] .retro-card {
  background-color: var(--color-background-elevated);
}
```

### Adding New Components
When creating new components, ensure they work in both themes:

1. Use CSS variables from the theme
2. Add `[data-theme='light']` variants
3. Test visual appearance in both modes
4. Ensure transitions are smooth

## File Structure

```
web/src/
  styles/
    retro-styles.css        # Dark mode (default)
    ayu-light-theme.css     # Light mode overrides
  components/
    settings/
      ThemeToggle.tsx       # Theme switcher component
  index.css                 # Imports both stylesheets
```

## Testing Checklist

- [x] Theme toggle appears correctly (bottom-right, left of sound toggle)
- [x] Theme preference persists in localStorage
- [x] All cards render properly in light mode
- [x] Buttons have correct hover/active states
- [x] Terminal output is readable
- [x] API logs are properly formatted
- [x] Syntax highlighting works
- [x] Transitions are smooth
- [x] No flash of unstyled content on page load

## Browser Support

Light mode theme works in all modern browsers:
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

CSS features used:
- CSS Custom Properties (CSS Variables)
- CSS Attribute Selectors
- CSS Transitions
- Multi-layer box-shadow

## Future Enhancements

1. **System Theme Detection**: Auto-detect OS theme preference
2. **Theme Scheduling**: Auto-switch based on time of day
3. **More Themes**: Add additional color schemes (Nord, Dracula, Solarized)
4. **Theme Preview**: Preview themes before switching
5. **Per-Component Themes**: Mix and match theme elements

## Design Credits

- **Ayu Color Palette**: [@dempfi](https://github.com/dempfi) - [ayu-theme/ayu-colors](https://github.com/ayu-theme/ayu-colors)
- **Implementation**: Straddle NerdCon Demo Team
- **Dark Theme**: Original retro 8-bit gaming aesthetic

## References

- [Ayu Colors GitHub](https://github.com/ayu-theme/ayu-colors)
- [Ayu Light Color Values](https://raw.githubusercontent.com/ayu-theme/ayu-colors/master/colors.svg)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [CSS Attribute Selectors (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors)
