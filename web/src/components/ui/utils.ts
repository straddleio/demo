import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge class names
 * Used by retro components for conditional styling
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
