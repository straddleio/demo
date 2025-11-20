import { render, fireEvent } from '@testing-library/react';
import { BusinessCard } from '../BusinessCard';
import { describe, it, expect, vi } from 'vitest';

describe('BusinessCard - Form State Management', () => {
  it('should reset form data when modal closes and reopens', () => {
    const mockSubmit = vi.fn();
    const mockClose = vi.fn();

    // First render - modal open
    const { container, rerender } = render(
      <BusinessCard isOpen={true} onClose={mockClose} onSubmit={mockSubmit} />
    );

    // Change email field
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'old@bluemyself.com' } });
    expect(emailInput).toHaveValue('old@bluemyself.com');

    // Close modal
    rerender(<BusinessCard isOpen={false} onClose={mockClose} onSubmit={mockSubmit} />);

    // Reopen modal
    rerender(<BusinessCard isOpen={true} onClose={mockClose} onSubmit={mockSubmit} />);

    // Verify email was reset to default (should include timestamp)
    const newEmailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(newEmailInput.value).toMatch(/tobias\.\d+@bluemyself\.com/);
    expect(newEmailInput).not.toHaveValue('old@bluemyself.com');
  });

  it('should display default business data (The Bluth Company)', () => {
    const mockSubmit = vi.fn();
    const mockClose = vi.fn();

    const { container } = render(
      <BusinessCard isOpen={true} onClose={mockClose} onSubmit={mockSubmit} />
    );

    // Check business name
    const nameInputs = container.querySelectorAll('input[type="text"]');
    const businessNameInput = nameInputs[0] as HTMLInputElement;
    expect(businessNameInput.value).toBe('The Bluth Company');

    // Check legal business name
    const legalNameInput = nameInputs[1] as HTMLInputElement;
    expect(legalNameInput.value).toBe('The Bluth Company');

    // Check EIN
    const einInput = nameInputs[2] as HTMLInputElement;
    expect(einInput.value).toBe('12-3456789');

    // Check website
    const websiteInput = nameInputs[3] as HTMLInputElement;
    expect(websiteInput.value).toBe('thebananastand.com');

    // Check phone
    const phoneInput = container.querySelector('input[type="tel"]') as HTMLInputElement;
    expect(phoneInput.value).toBe('+15558675309');
  });

  it('should update business name field', () => {
    const mockSubmit = vi.fn();
    const mockClose = vi.fn();

    const { container } = render(
      <BusinessCard isOpen={true} onClose={mockClose} onSubmit={mockSubmit} />
    );

    const nameInput = container.querySelectorAll('input[type="text"]')[0] as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Acme Corporation' } });
    expect(nameInput).toHaveValue('Acme Corporation');
  });

  it('should update EIN field', () => {
    const mockSubmit = vi.fn();
    const mockClose = vi.fn();

    const { container } = render(
      <BusinessCard isOpen={true} onClose={mockClose} onSubmit={mockSubmit} />
    );

    const einInput = container.querySelectorAll('input[type="text"]')[2] as HTMLInputElement;
    fireEvent.change(einInput, { target: { value: '98-7654321' } });
    expect(einInput).toHaveValue('98-7654321');
  });

  it('should submit with verified outcome', () => {
    const mockSubmit = vi.fn();
    const mockClose = vi.fn();

    const { container } = render(
      <BusinessCard isOpen={true} onClose={mockClose} onSubmit={mockSubmit} />
    );

    // Find verified button
    const buttons = container.querySelectorAll('button');
    const verifiedButton = Array.from(buttons).find((btn) =>
      btn.textContent?.includes('Verified')
    );

    fireEvent.click(verifiedButton!);

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'The Bluth Company',
        compliance_profile: expect.objectContaining({
          ein: '12-3456789',
          legal_business_name: 'The Bluth Company',
        }),
      }),
      'verified'
    );
    expect(mockClose).toHaveBeenCalled();
  });

  it('should submit with review outcome', () => {
    const mockSubmit = vi.fn();
    const mockClose = vi.fn();

    const { container } = render(
      <BusinessCard isOpen={true} onClose={mockClose} onSubmit={mockSubmit} />
    );

    // Find review button
    const buttons = container.querySelectorAll('button');
    const reviewButton = Array.from(buttons).find((btn) => btn.textContent?.includes('Review'));

    fireEvent.click(reviewButton!);

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'The Bluth Company',
      }),
      'review'
    );
    expect(mockClose).toHaveBeenCalled();
  });

  it('should submit with rejected outcome', () => {
    const mockSubmit = vi.fn();
    const mockClose = vi.fn();

    const { container } = render(
      <BusinessCard isOpen={true} onClose={mockClose} onSubmit={mockSubmit} />
    );

    // Find rejected button
    const buttons = container.querySelectorAll('button');
    const rejectedButton = Array.from(buttons).find((btn) =>
      btn.textContent?.includes('Rejected')
    );

    fireEvent.click(rejectedButton!);

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'The Bluth Company',
      }),
      'rejected'
    );
    expect(mockClose).toHaveBeenCalled();
  });

  it('should update address fields', () => {
    const mockSubmit = vi.fn();
    const mockClose = vi.fn();

    const { container } = render(
      <BusinessCard isOpen={true} onClose={mockClose} onSubmit={mockSubmit} />
    );

    const allInputs = container.querySelectorAll('input');

    // Find address fields by placeholder
    const address1Input = Array.from(allInputs).find(
      (input) => input.placeholder === 'Street Address'
    ) as HTMLInputElement;
    const cityInput = Array.from(allInputs).find(
      (input) => input.placeholder === 'City'
    ) as HTMLInputElement;
    const stateInput = Array.from(allInputs).find(
      (input) => input.placeholder === 'State'
    ) as HTMLInputElement;
    const zipInput = Array.from(allInputs).find(
      (input) => input.placeholder === 'ZIP'
    ) as HTMLInputElement;

    expect(address1Input.value).toBe('1234 Sandbox Street');
    expect(cityInput.value).toBe('Mock City');
    expect(stateInput.value).toBe('CA');
    expect(zipInput.value).toBe('94105');

    fireEvent.change(address1Input, { target: { value: '456 Main St' } });
    fireEvent.change(cityInput, { target: { value: 'San Francisco' } });
    fireEvent.change(stateInput, { target: { value: 'CA' } });
    fireEvent.change(zipInput, { target: { value: '94103' } });

    expect(address1Input.value).toBe('456 Main St');
    expect(cityInput.value).toBe('San Francisco');
    expect(stateInput.value).toBe('CA');
    expect(zipInput.value).toBe('94103');
  });
});
