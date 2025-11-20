import React from 'react';
import { cn } from './utils';

export type ThemeTone = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';

interface ThemeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: ThemeTone;
  padded?: boolean;
}

const cardToneClasses: Record<ThemeTone, string> = {
  default: 'bg-background-card border border-primary/30 shadow-glow-primary/50',
  primary: 'bg-background-dark border border-primary/60 shadow-glow-primary',
  accent: 'bg-background-dark border border-accent/60 shadow-glow-accent',
  success: 'bg-background-dark border border-accent-green/60 shadow-glow-green',
  warning: 'bg-background-dark border border-gold/60 shadow-glow-gold',
  danger: 'bg-background-dark border border-accent-red/60 shadow-[0_0_10px_rgb(var(--color-accent-red-rgb)/0.5)]',
};

export const ThemeCard = React.forwardRef<HTMLDivElement, ThemeCardProps>(
  ({ className, tone = 'default', padded = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-pixel transition-shadow duration-200',
        padded && 'p-4',
        cardToneClasses[tone],
        className
      )}
      {...props}
    />
  )
);
ThemeCard.displayName = 'ThemeCard';

interface ThemeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: 'sm' | 'md';
}

export const ThemeInput = React.forwardRef<HTMLInputElement, ThemeInputProps>(
  ({ className, inputSize = 'md', ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded border bg-background-dark text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors',
        inputSize === 'sm' ? 'px-2 py-1 text-sm' : 'px-3 py-2 text-base',
        className
      )}
      {...props}
    />
  )
);
ThemeInput.displayName = 'ThemeInput';

interface ThemeLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const ThemeLabel: React.FC<ThemeLabelProps> = ({ className, children, ...props }) => (
  <label className={cn('block text-xs font-pixel text-primary mb-1 tracking-wide', className)} {...props}>
    {children}
  </label>
);

interface ThemeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: ThemeTone;
}

const badgeTones: Record<ThemeTone, string> = {
  default: 'border-primary/40 text-primary bg-primary/10',
  primary: 'border-primary text-primary bg-primary/15',
  accent: 'border-accent text-accent bg-accent/15',
  success: 'border-accent-green text-accent-green bg-accent-green/15',
  warning: 'border-gold text-gold bg-gold/15',
  danger: 'border-accent-red text-accent-red bg-accent-red/15',
};

export const ThemeBadge = React.forwardRef<HTMLSpanElement, ThemeBadgeProps>(
  ({ className, tone = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-2 rounded px-3 py-1 text-[11px] font-body uppercase tracking-wide leading-none border',
        badgeTones[tone],
        className
      )}
      {...props}
    />
  )
);
ThemeBadge.displayName = 'ThemeBadge';

interface ThemeFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  htmlFor?: string;
  description?: string;
  inputSize?: 'sm' | 'md';
}

export const ThemeField: React.FC<ThemeFieldProps> = ({
  label,
  htmlFor,
  description,
  children,
  className,
}) => (
  <div className={cn('space-y-1', className)}>
    <ThemeLabel htmlFor={htmlFor}>{label}</ThemeLabel>
    {description ? (
      <p className="text-[11px] text-neutral-500 font-body leading-relaxed">{description}</p>
    ) : null}
    {children}
  </div>
);
