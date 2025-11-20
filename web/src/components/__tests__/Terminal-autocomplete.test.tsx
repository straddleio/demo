import { render, screen, fireEvent } from '@testing-library/react';
import { Terminal } from '../Terminal';
import { AVAILABLE_COMMANDS } from '../../lib/commands';
import { describe, it, expect } from 'vitest';

describe('Terminal autocomplete', () => {
  it('should autocomplete to first suggestion when typing /create and pressing Tab', () => {
    render(<Terminal />);

    const input = screen.getByRole('textbox');

    // Type /create and press Tab
    fireEvent.change(input, { target: { value: '/create' } });
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });

    // Should autocomplete to the first match (highlighted by default at index 0)
    // First match in COMMAND_REGISTRY is /create-customer
    expect(input).toHaveValue('/create-customer');
  });

  it('should autocomplete to first suggestion when typing /customer and pressing Tab', () => {
    render(<Terminal />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '/customer' } });
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });

    // Should autocomplete to the first match (highlighted by default at index 0)
    // First match in COMMAND_REGISTRY that starts with /customer is /customer-KYC
    expect((input as HTMLInputElement).value).toBe('/customer-KYC');
  });

  it('should fully autocomplete when there is a single match', () => {
    render(<Terminal />);

    const input = screen.getByRole('textbox');

    // Type /outc which should uniquely match /outcomes
    fireEvent.change(input, { target: { value: '/outc' } });
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });

    // Should fully autocomplete to /outcomes (without trailing space in current implementation)
    expect((input as HTMLInputElement).value).toBe('/outcomes');
  });

  it('should include /create-customer in available commands', () => {
    // This test verifies that Task 5 added /create-customer to AVAILABLE_COMMANDS
    expect(AVAILABLE_COMMANDS).toContain('/create-customer');
  });

  it('should autocomplete when typing without leading slash', () => {
    render(<Terminal />);

    const input = screen.getByRole('textbox');

    // Type "cus" (without slash) and press Tab
    fireEvent.change(input, { target: { value: 'cus' } });
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });

    // Should autocomplete to /customer-KYC (first match with /cus*, with slash)
    expect(input).toHaveValue('/customer-KYC');
  });

  it('should show same suggestions for "help" and "/help"', () => {
    const { rerender } = render(<Terminal />);
    const input = screen.getByRole('textbox');

    // Type "help" without slash
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
    expect(input).toHaveValue('/help');

    // Reset input
    rerender(<Terminal />);
    const inputAfterRerender = screen.getByRole('textbox');

    // Type "/help" with slash
    fireEvent.change(inputAfterRerender, { target: { value: '/help' } });
    fireEvent.keyDown(inputAfterRerender, { key: 'Tab', code: 'Tab' });
    expect(inputAfterRerender).toHaveValue('/help');
  });

  it('should autocomplete "create" to "/create-customer" (first match)', () => {
    render(<Terminal />);

    const input = screen.getByRole('textbox');

    // Type "create" without slash
    fireEvent.change(input, { target: { value: 'create' } });
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });

    // Should autocomplete to first match
    expect(input).toHaveValue('/create-customer');
  });

  it('should autocomplete "outc" to "/outcomes" with or without slash', () => {
    const { rerender } = render(<Terminal />);

    // Test without slash
    const input1 = screen.getByRole('textbox');
    fireEvent.change(input1, { target: { value: 'outc' } });
    fireEvent.keyDown(input1, { key: 'Tab', code: 'Tab' });
    expect(input1).toHaveValue('/outcomes');

    // Reset
    rerender(<Terminal />);

    // Test with slash
    const input2 = screen.getByRole('textbox');
    fireEvent.change(input2, { target: { value: '/outc' } });
    fireEvent.keyDown(input2, { key: 'Tab', code: 'Tab' });
    expect(input2).toHaveValue('/outcomes');
  });
});
