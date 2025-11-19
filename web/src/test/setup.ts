import '@testing-library/jest-dom';

// Polyfill ResizeObserver for jsdom environment
// Required for Three.js Canvas and react-use-measure to work in tests
global.ResizeObserver = class ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
} as typeof ResizeObserver;
