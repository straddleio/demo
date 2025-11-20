import React, { useState, useEffect } from 'react';
import { CommandCard } from '../CommandCard';
import { ThemeField, ThemeInput } from '@/components/ui/theme-primitives';
import { cn } from '@/components/ui/utils';

interface CustomerCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CustomerFormData,
    outcome: 'standard' | 'verified' | 'review' | 'rejected'
  ) => void;
  mode?: 'create' | 'kyc'; // 'create' = customer-create, 'kyc' = customer-kyc
}

export interface CustomerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  };
  compliance_profile?: {
    ssn?: string;
    dob?: string;
    ein?: string;
    legal_business_name?: string;
    website?: string;
  };
  device: {
    ip_address: string;
  };
  type: 'individual' | 'business';
}

const getInitialFormData = (mode: 'create' | 'kyc'): CustomerFormData => {
  if (mode === 'kyc') {
    // Jane Doe with full KYC data (matches /customer-kyc command)
    return {
      first_name: 'Jane',
      last_name: 'Doe',
      email: `jane.doe.${Date.now()}@example.com`,
      phone: '+12025551234',
      address: {
        address1: '1600 Pennsylvania Avenue NW',
        city: 'Washington',
        state: 'DC',
        zip: '20500',
      },
      compliance_profile: {
        ssn: '123-45-6789',
        dob: '1990-01-15',
      },
      device: {
        ip_address: '192.168.1.1',
      },
      type: 'individual',
    };
  } else {
    // Alberta Bobbeth Charleson (matches /customer-create command)
    // Simple customer without compliance_profile
    return {
      first_name: 'Alberta',
      last_name: 'Bobbeth Charleson',
      email: `user.${Date.now()}@example.com`,
      phone: '+12125550123',
      address: {
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
      },
      device: {
        ip_address: '192.168.1.1',
      },
      type: 'individual',
    };
  }
};

export const CustomerCard: React.FC<CustomerCardProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
}) => {
  const [formData, setFormData] = useState<CustomerFormData>(getInitialFormData(mode));

  // Reset form data when mode changes or modal reopens
  useEffect(() => {
    setFormData(getInitialFormData(mode));
  }, [mode, isOpen]);

  const handleSubmit = (outcome: 'standard' | 'verified' | 'review' | 'rejected'): void => {
    onSubmit(formData, outcome);
    onClose();
  };

  const updateField = (field: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: string): void => {
    setFormData((prev) => {
      const parentObj = prev[parent as keyof CustomerFormData];
      if (typeof parentObj === 'object' && parentObj !== null) {
        return {
          ...prev,
          [parent]: { ...parentObj, [field]: value },
        };
      }
      return prev;
    });
  };

  return (
    <CommandCard isOpen={isOpen} onClose={onClose} title="CREATE CUSTOMER">
      {/* Form Fields */}
      <div className="space-y-2">
        {/* Individual Name Fields */}
        <div className="grid grid-cols-2 gap-2">
          <ThemeField label="First Name" htmlFor="customer-first-name">
            <ThemeInput
            id="customer-first-name"
            inputSize="sm"
              type="text"
              value={formData.first_name}
              onChange={(e) => updateField('first_name', e.target.value)}
            />
          </ThemeField>
          <ThemeField label="Last Name" htmlFor="customer-last-name">
            <ThemeInput
            id="customer-last-name"
            inputSize="sm"
              type="text"
              value={formData.last_name}
              onChange={(e) => updateField('last_name', e.target.value)}
            />
          </ThemeField>
        </div>

        {/* Email */}
        <ThemeField label="Email" htmlFor="customer-email">
          <ThemeInput
            id="customer-email"
            inputSize="sm"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </ThemeField>

        {/* Phone */}
        <ThemeField label="Phone" htmlFor="customer-phone">
          <ThemeInput
            id="customer-phone"
            inputSize="sm"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </ThemeField>


        {/* Address */}
        <ThemeField label="Address" htmlFor="customer-address1">
          <ThemeInput
            id="customer-address1"
            inputSize="sm"
            type="text"
            value={formData.address?.address1 || ''}
            onChange={(e) => updateNestedField('address', 'address1', e.target.value)}
            placeholder="Street Address"
          />
        </ThemeField>
        <div className="grid grid-cols-3 gap-2">
          <ThemeInput
            inputSize="sm"
            type="text"
            value={formData.address?.city || ''}
            onChange={(e) => updateNestedField('address', 'city', e.target.value)}
            placeholder="City"
          />
          <ThemeInput
            inputSize="sm"
            type="text"
            value={formData.address?.state || ''}
            onChange={(e) => updateNestedField('address', 'state', e.target.value)}
            placeholder="State"
          />
          <ThemeInput
            inputSize="sm"
            type="text"
            value={formData.address?.zip || ''}
            onChange={(e) => updateNestedField('address', 'zip', e.target.value)}
            placeholder="ZIP"
          />
        </div>

        {/* KYC Fields - Only show in KYC mode for Individuals */}
        {mode === 'kyc' && formData.type === 'individual' && (
          <>
            {/* SSN */}
            <ThemeField label="SSN" htmlFor="customer-ssn">
              <ThemeInput
                id="customer-ssn"
                inputSize="sm"
                type="text"
                value={formData.compliance_profile?.ssn || ''}
                onChange={(e) => updateNestedField('compliance_profile', 'ssn', e.target.value)}
              />
            </ThemeField>

            {/* DOB */}
            <ThemeField label="Date of Birth" htmlFor="customer-dob">
              <ThemeInput
                id="customer-dob"
                inputSize="sm"
                type="date"
                value={formData.compliance_profile?.dob || ''}
                onChange={(e) => updateNestedField('compliance_profile', 'dob', e.target.value)}
              />
            </ThemeField>
          </>
        )}

        {/* IP Address */}
        <ThemeField label="IP Address" htmlFor="customer-ip-address">
          <ThemeInput
            id="customer-ip-address"
            inputSize="sm"
            type="text"
            value={formData.device.ip_address}
            onChange={(e) => updateNestedField('device', 'ip_address', e.target.value)}
          />
        </ThemeField>
      </div>

      {/* Sandbox Outcome Buttons - Street Fighter Style */}
      <div className="mt-4 pt-3 border-t-2 border-primary/20">
        <p className="text-xs font-pixel text-secondary mb-2">SANDBOX OUTCOME</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSubmit('standard')}
            className={cn(
              'px-3 py-2 rounded-pixel font-pixel text-sm',
              'bg-secondary/20 border-2 border-secondary text-secondary',
              'hover:bg-secondary/30 hover:shadow-glow-blue',
              'transition-all duration-200 uppercase'
            )}
          >
            ⚡ Standard
          </button>
          <button
            onClick={() => handleSubmit('verified')}
            className={cn(
              'px-3 py-2 rounded-pixel font-pixel text-sm',
              'bg-accent-green/20 border-2 border-accent-green text-accent-green',
              'hover:bg-accent-green/30 hover:shadow-glow-green',
              'transition-all duration-200 uppercase'
            )}
          >
            ✓ Verified
          </button>
          <button
            onClick={() => handleSubmit('review')}
            className={cn(
              'px-3 py-2 rounded-pixel font-pixel text-sm',
              'bg-gold/20 border-2 border-gold text-gold',
              'hover:bg-gold/30 hover:shadow-glow-gold',
              'transition-all duration-200 uppercase'
            )}
          >
            ⚠ Review
          </button>
          <button
            onClick={() => handleSubmit('rejected')}
            className={cn(
              'px-3 py-2 rounded-pixel font-pixel text-sm',
              'bg-accent-red/20 border-2 border-accent-red text-accent-red',
              'hover:bg-accent-red/30 hover:shadow-[0_0_15px_rgb(var(--color-accent-red-rgb)/0.5)]',
              'transition-all duration-200 uppercase'
            )}
          >
            ✗ Rejected
          </button>
        </div>
      </div>
    </CommandCard>
  );
};
