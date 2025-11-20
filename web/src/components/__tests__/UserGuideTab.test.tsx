import { render, screen } from '@testing-library/react';
import { UserGuideTab } from '../UserGuideTab';
import { describe, it, expect } from 'vitest';

describe('UserGuideTab', () => {
  it('renders quick start section', () => {
    render(<UserGuideTab />);
    expect(screen.getByText(/quick start/i)).toBeInTheDocument();
  });

  it('renders key commands section', () => {
    render(<UserGuideTab />);
    expect(screen.getByText(/key commands/i)).toBeInTheDocument();
  });

  it('renders workflow section', () => {
    render(<UserGuideTab />);
    expect(screen.getByText(/workflow/i)).toBeInTheDocument();
  });

  it('renders tips section', () => {
    render(<UserGuideTab />);
    expect(screen.getByText(/tips/i)).toBeInTheDocument();
  });

  it('displays demo command', () => {
    render(<UserGuideTab />);
    const demoElements = screen.getAllByText('/demo');
    expect(demoElements.length).toBeGreaterThan(0);
  });

  it('displays reset command', () => {
    render(<UserGuideTab />);
    const resetElements = screen.getAllByText('/reset');
    expect(resetElements.length).toBeGreaterThan(0);
  });
});
