# 8-Bit Retro Gaming Design System

A complete design system inspired by Fintech NerdCon's retro gaming aesthetic, built to work seamlessly with shadcn/ui and Tailwind CSS.

## 🎮 Features

- **Retro Gaming Aesthetic**: Neon colors, pixel fonts, CRT effects, scanlines
- **shadcn/ui Compatible**: Works alongside your existing shadcn components
- **Fully Typed**: Complete TypeScript support
- **Customizable**: Easy to modify colors, effects, and animations
- **Accessible**: Maintains WCAG standards despite the retro styling

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install tailwindcss @tailwindcss/typography
# or
pnpm add tailwindcss @tailwindcss/typography
```

### 2. Copy Files

Copy these files to your project:
- `retro-design-system.ts` → `@/lib/design-system/`
- `retro-components.tsx` → `@/components/ui/`
- Use the single source of truth for styles from `web/src/styles/retro-styles.css` (already wired to Tailwind base in this repo).

### 3. Update tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";
import { tailwindConfig } from "./lib/design-system/retro-design-system";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      ...tailwindConfig.theme.extend,
    },
  },
  plugins: [],
};

export default config;
```

### 4. Import Global Styles

In your root layout or `globals.css`:

```css
@import './retro-styles.css';
```

Or in your `_app.tsx` / `layout.tsx`:

```typescript
import '@/styles/retro-styles.css';
```

## 📖 Usage Examples

### Basic Card

```tsx
import { RetroCard, RetroCardHeader, RetroCardTitle, RetroCardContent } from '@/components/ui/retro-components';

export function MyComponent() {
  return (
    <RetroCard variant="cyan">
      <RetroCardHeader>
        <RetroCardTitle>Player Stats</RetroCardTitle>
      </RetroCardHeader>
      <RetroCardContent>
        <p>Level: 42</p>
        <p>XP: 9,001</p>
      </RetroCardContent>
    </RetroCard>
  );
}
```

### Neon Heading with Glow

```tsx
import { RetroHeading } from '@/components/ui/retro-components';

export function Hero() {
  return (
    <div className="text-center py-20">
      <RetroHeading level={1} glow variant="primary">
        Welcome to the Grid
      </RetroHeading>
      <RetroHeading level={2} variant="secondary">
        Enter Player One
      </RetroHeading>
    </div>
  );
}
```

### Buttons

```tsx
import { RetroButton } from '@/components/ui/retro-components';

export function Actions() {
  return (
    <div className="flex gap-4">
      <RetroButton variant="primary" filled>
        Start Game
      </RetroButton>
      <RetroButton variant="secondary">
        Options
      </RetroButton>
      <RetroButton variant="accent">
        High Scores
      </RetroButton>
    </div>
  );
}
```

### Animated Stats Counter

```tsx
import { AnimatedCounter } from '@/components/ui/retro-components';

export function Stats() {
  return (
    <div className="retro-card p-8">
      <div className="space-y-4">
        <div>
          <p className="text-neutral-400 text-sm mb-2">Total Players</p>
          <AnimatedCounter value={1000} suffix="+" />
        </div>
        <div>
          <p className="text-neutral-400 text-sm mb-2">Active Sessions</p>
          <AnimatedCounter value={250} />
        </div>
      </div>
    </div>
  );
}
```

### Container with Effects

```tsx
import { RetroContainer } from '@/components/ui/retro-components';

export function GameScreen() {
  return (
    <RetroContainer scanlines crt className="min-h-screen p-8">
      <h1 className="neon-heading">Game Over</h1>
      {/* Your content */}
    </RetroContainer>
  );
}
```

### Glitch Text Effect

```tsx
import { RetroHeading } from '@/components/ui/retro-components';

export function ErrorScreen() {
  return (
    <RetroHeading level={1} glitch variant="accent">
      System Error
    </RetroHeading>
  );
}
```

### Typewriter Effect Hook

```tsx
import { useTypewriter } from '@/components/ui/retro-components';

export function TerminalText() {
  const text = useTypewriter("Loading game assets...", 50);
  
  return (
    <p className="font-pixel text-primary">
      {text}<span className="animate-pulse">_</span>
    </p>
  );
}
```

## 🎨 Color Variants

All components support these color variants:

- `primary` - Cyan (#00FFFF) - Main neon accent
- `secondary` - Blue (#0066FF) - Electric blue
- `accent` - Magenta (#FF0099) - Hot pink
- `gold` - Gold (#FFC300) - Special elements

## 🛠️ Utility Classes

### Text Effects
```tsx
<h1 className="text-glow-cyan">Glowing Text</h1>
<p className="pixel-text">8-Bit Font</p>
<span className="text-primary text-glow-blue">Neon Blue</span>
```

### Cards
```tsx
<div className="retro-card">Basic Card</div>
<div className="retro-card-blue">Blue Card</div>
<div className="retro-card-magenta">Magenta Card</div>
```

### Backgrounds
```tsx
<div className="retro-grid">Grid Background</div>
<div className="scanlines">With Scanlines</div>
<div className="crt-screen">CRT Effect</div>
```

### Borders
```tsx
<div className="pixel-border">Gradient Border</div>
```

## 🎮 Advanced Examples

### Full Page Layout

```tsx
import {
  RetroContainer,
  RetroCard,
  RetroHeading,
  RetroButton,
  RetroDivider,
  AnimatedCounter
} from '@/components/ui/retro-components';

export default function GameDashboard() {
  return (
    <RetroContainer scanlines className="min-h-screen bg-background p-8">
      {/* Header */}
      <header className="mb-12">
        <RetroHeading level={1} glow>
          Player Dashboard
        </RetroHeading>
        <p className="text-neutral-400 mt-4 font-body">
          Welcome back, Commander
        </p>
      </header>

      <RetroDivider />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <RetroCard variant="cyan">
          <div className="text-center">
            <p className="text-sm text-neutral-400 mb-2">Level</p>
            <AnimatedCounter value={42} className="text-4xl" />
          </div>
        </RetroCard>
        
        <RetroCard variant="blue">
          <div className="text-center">
            <p className="text-sm text-neutral-400 mb-2">Score</p>
            <AnimatedCounter value={9001} className="text-4xl" />
          </div>
        </RetroCard>
        
        <RetroCard variant="magenta">
          <div className="text-center">
            <p className="text-sm text-neutral-400 mb-2">Achievements</p>
            <AnimatedCounter value={28} suffix="/50" className="text-4xl" />
          </div>
        </RetroCard>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <RetroButton variant="primary" filled>
          Continue Game
        </RetroButton>
        <RetroButton variant="secondary">
          View Inventory
        </RetroButton>
        <RetroButton variant="accent">
          Settings
        </RetroButton>
      </div>
    </RetroContainer>
  );
}
```

### Pixel Portrait Gallery (Like NerdCon Speakers)

```tsx
export function SpeakerGrid() {
  const speakers = [
    { name: "Elijah Johnson", role: "VP of Engineering", company: "Straddle" },
    // ... more speakers
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {speakers.map((speaker) => (
        <RetroCard key={speaker.name} variant="cyan" className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 border-2 border-primary rounded-pixel pixelated">
            {/* Add your pixelated image here */}
            <img 
              src="/path-to-pixelated-portrait.png" 
              alt={speaker.name}
              className="pixelated"
            />
          </div>
          <PixelText variant="secondary" className="block text-sm mb-1">
            {speaker.name}
          </PixelText>
          <PixelText variant="primary" className="block text-xs mb-1">
            {speaker.role}
          </PixelText>
          <p className="text-white text-xs font-body">{speaker.company}</p>
        </RetroCard>
      ))}
    </div>
  );
}
```

## 🎵 Optional: Audio Effects

```tsx
import { useRetroAudio } from '@/components/ui/retro-components';

export function InteractiveButton() {
  const { playBeep } = useRetroAudio();

  const handleClick = () => {
    playBeep(440, 100); // Frequency, duration
    // Your logic here
  };

  return (
    <RetroButton onClick={handleClick}>
      Click me!
    </RetroButton>
  );
}
```

## 🎯 Best Practices

### 1. Use Pixel Fonts Sparingly
Pixel fonts are hard to read in body text. Use them for headings and UI elements only.

```tsx
// ✅ Good
<RetroHeading level={1}>Main Title</RetroHeading>
<p className="font-body">This is much easier to read in body text.</p>

// ❌ Avoid
<p className="font-pixel">Long paragraphs in pixel font are hard to read.</p>
```

### 2. Balance Glow Effects
Too many glowing elements can be overwhelming.

```tsx
// ✅ Good - Strategic use
<RetroHeading level={1} glow>Main Title</RetroHeading>
<RetroCard variant="cyan">
  <p>Regular content without glow</p>
</RetroCard>

// ❌ Too much
<div className="shadow-glow-cyan">
  <h1 className="text-glow-cyan">Everything</h1>
  <p className="text-glow-blue">Is</p>
  <span className="text-glow-magenta">Glowing</span>
</div>
```

### 3. Maintain Contrast
Always ensure sufficient contrast for accessibility.

```tsx
// ✅ Good - Readable contrast
<RetroCard className="bg-background-card">
  <p className="text-neutral-100">Clear text</p>
</RetroCard>

// ❌ Poor contrast
<RetroCard className="bg-background-dark">
  <p className="text-neutral-800">Hard to read</p>
</RetroCard>
```

## 🔧 Customization

### Modify Colors

Edit `retro-design-system.ts`:

```typescript
export const designSystem = {
  colors: {
    primary: {
      500: '#YOUR_COLOR', // Change main cyan
      // ... other shades
    },
  },
};
```

### Add Custom Animations

In `retro-styles.css`:

```css
@keyframes your-custom-animation {
  0% { /* start state */ }
  100% { /* end state */ }
}

.your-custom-class {
  animation: your-custom-animation 1s ease-in-out;
}
```

### Create New Component Variants

In `retro-components.tsx`:

```tsx
export const RetroCustomCard = React.forwardRef<HTMLDivElement, CustomProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'your-custom-classes',
          className
        )}
        {...props}
      />
    );
  }
);
```

## 📦 What's Included

- `retro-design-system.ts` - Design tokens and configuration
- `retro-styles.css` - Global styles, animations, and utilities
- `retro-components.tsx` - Pre-built React components
- This README with examples and best practices

## 🎮 Inspired By

Fintech NerdCon's amazing 8-bit gaming aesthetic - check them out at [fintechnerdcon.com](https://fintechnerdcon.com)

## 📝 Notes

- Pixel fonts are loaded from Google Fonts
- All components are fully typed with TypeScript
- Works with Next.js, Vite, and other React frameworks
- Compatible with shadcn/ui components
- Follows Tailwind CSS conventions

## 🤝 Usage with Claude Code

This design system is optimized for use with Claude Code. Simply reference the components and utilities in your prompts:

```
"Create a dashboard using the RetroCard and RetroHeading components from retro-components.tsx"
```

## 🎨 Design Philosophy

This system captures three key elements:
1. **Nostalgia**: Classic 8-bit and 16-bit gaming aesthetics
2. **Professionalism**: Despite the retro theme, maintains enterprise-quality code
3. **Accessibility**: Ensures WCAG compliance while keeping the retro vibe

---

Built with ⚡ for the fintech community
