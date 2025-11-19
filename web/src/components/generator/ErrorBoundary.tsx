/**
 * Error Boundary for Generator Animations
 *
 * Catches errors in animation components and provides fallback UI
 */

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * GeneratorErrorBoundary Component
 *
 * Wraps generator animations to prevent modal crashes
 * Calls onError callback to allow parent to handle failure (e.g., close modal)
 */
export class GeneratorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error): void {
    // Call parent error handler if provided
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="text-accent font-pixel text-lg">⚠ ANIMATION ERROR</div>
          <p className="text-neutral-400 text-sm font-body text-center max-w-md">
            An error occurred during the animation. The modal will close automatically.
          </p>
          {this.state.error && (
            <details className="text-xs text-neutral-500 font-mono">
              <summary className="cursor-pointer">Technical Details</summary>
              <pre className="mt-2 p-2 bg-background-dark rounded border border-neutral-700 overflow-auto max-w-md">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
