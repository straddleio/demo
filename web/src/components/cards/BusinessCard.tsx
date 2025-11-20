import React, { useState, useEffect } from 'react';
import { CommandCard } from '../CommandCard';
import { cn } from '@/components/ui/utils';

interface BusinessCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: BusinessFormData,
    outcome: 'standard' | 'verified' | 'review' | 'rejected'
  ) => void;
}

export interface BusinessFormData {
  name: string;
  email: string;
  phone: string;
  address: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  };
  compliance_profile: {
    ein: string;
    legal_business_name: string;
    website: string;
  };
  device: {
    ip_address: string;
  };
  type: 'business';
}

const getInitialFormData = (): BusinessFormData => {
  // The Bluth Company default data (matches /create-business command)
  return {
    name: 'The Bluth Company',
    email: `tobias.${Date.now()}@bluemyself.com`,
    phone: '+15558675309',
    address: {
      address1: '1234 Sandbox Street',
      address2: 'PO Box I304',
      city: 'Mock City',
      state: 'CA',
      zip: '94105',
    },
    compliance_profile: {
      ein: '12-3456789',
      legal_business_name: 'The Bluth Company',
      website: 'thebananastand.com',
    },
    device: {
      ip_address: '192.168.1.1',
    },
    type: 'business',
  };
};

export const BusinessCard: React.FC<BusinessCardProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<BusinessFormData>(getInitialFormData());

  // Reset form data when modal reopens
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [isOpen]);

  const handleSubmit = (outcome: 'standard' | 'verified' | 'review' | 'rejected'): void => {
    onSubmit(formData, outcome);
    onClose();
  };

  const updateField = (field: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: string): void => {
    setFormData((prev) => {
      const parentObj = prev[parent as keyof BusinessFormData];
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
    <CommandCard isOpen={isOpen} onClose={onClose} title="CREATE BUSINESS">
      {/* Form Fields */}
      <div className="space-y-3">
        {/* Business Name */}
        <div>
          <label className="block text-xs font-pixel text-primary mb-1">Business Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={cn(
              'w-full px-2 py-1 bg-background-dark border border-primary/30',
              'rounded text-neutral-200 font-body text-sm',
              'focus:border-primary focus:outline-none'
            )}
          />
        </div>

        {/* Legal Business Name */}
        <div>
          <label className="block text-xs font-pixel text-primary mb-1">Legal Business Name</label>
          <input
            type="text"
            value={formData.compliance_profile.legal_business_name}
            onChange={(e) =>
              updateNestedField('compliance_profile', 'legal_business_name', e.target.value)
            }
            className={cn(
              'w-full px-2 py-1 bg-background-dark border border-primary/30',
              'rounded text-neutral-200 font-body text-sm',
              'focus:border-primary focus:outline-none'
            )}
          />
        </div>

        {/* EIN */}
        <div>
          <label className="block text-xs font-pixel text-primary mb-1">EIN</label>
          <input
            type="text"
            value={formData.compliance_profile.ein}
            onChange={(e) => updateNestedField('compliance_profile', 'ein', e.target.value)}
            className={cn(
              'w-full px-2 py-1 bg-background-dark border border-primary/30',
              'rounded text-neutral-200 font-body text-sm',
              'focus:border-primary focus:outline-none'
            )}
            placeholder="12-3456789"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-xs font-pixel text-primary mb-1">Website</label>
          <input
            type="text"
            value={formData.compliance_profile.website}
            onChange={(e) => updateNestedField('compliance_profile', 'website', e.target.value)}
            className={cn(
              'w-full px-2 py-1 bg-background-dark border border-primary/30',
              'rounded text-neutral-200 font-body text-sm',
              'focus:border-primary focus:outline-none'
            )}
            placeholder="example.com"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-pixel text-primary mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={cn(
              'w-full px-2 py-1 bg-background-dark border border-primary/30',
              'rounded text-neutral-200 font-body text-sm',
              'focus:border-primary focus:outline-none'
            )}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-pixel text-primary mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className={cn(
              'w-full px-2 py-1 bg-background-dark border border-primary/30',
              'rounded text-neutral-200 font-body text-sm',
              'focus:border-primary focus:outline-none'
            )}
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-pixel text-primary mb-1">Address</label>
          <input
            type="text"
            value={formData.address.address1}
            onChange={(e) => updateNestedField('address', 'address1', e.target.value)}
            className={cn(
              'w-full px-2 py-1 bg-background-dark border border-primary/30',
              'rounded text-neutral-200 font-body text-sm mb-2',
              'focus:border-primary focus:outline-none'
            )}
            placeholder="Street Address"
          />
          <input
            type="text"
            value={formData.address.address2 || ''}
            onChange={(e) => updateNestedField('address', 'address2', e.target.value)}
            className={cn(
              'w-full px-2 py-1 bg-background-dark border border-primary/30',
              'rounded text-neutral-200 font-body text-sm mb-2',
              'focus:border-primary focus:outline-none'
            )}
            placeholder="Address Line 2 (Optional)"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => updateNestedField('address', 'city', e.target.value)}
              className={cn(
                'w-full px-2 py-1 bg-background-dark border border-primary/30',
                'rounded text-neutral-200 font-body text-sm',
                'focus:border-primary focus:outline-none'
              )}
              placeholder="City"
            />
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => updateNestedField('address', 'state', e.target.value)}
              className={cn(
                'w-full px-2 py-1 bg-background-dark border border-primary/30',
                'rounded text-neutral-200 font-body text-sm',
                'focus:border-primary focus:outline-none'
              )}
              placeholder="State"
            />
            <input
              type="text"
              value={formData.address.zip}
              onChange={(e) => updateNestedField('address', 'zip', e.target.value)}
              className={cn(
                'w-full px-2 py-1 bg-background-dark border border-primary/30',
                'rounded text-neutral-200 font-body text-sm',
                'focus:border-primary focus:outline-none'
              )}
              placeholder="ZIP"
            />
          </div>
        </div>

        {/* IP Address */}
        <div>
          <label className="block text-xs font-pixel text-primary mb-1">IP Address</label>
          <input
            type="text"
            value={formData.device.ip_address}
            onChange={(e) => updateNestedField('device', 'ip_address', e.target.value)}
            className={cn(
              'w-full px-2 py-1 bg-background-dark border border-primary/30',
              'rounded text-neutral-200 font-body text-sm',
              'focus:border-primary focus:outline-none'
            )}
          />
        </div>
      </div>

      {/* Sandbox Outcome Buttons - Street Fighter Style */}
      <div className="mt-6 pt-4 border-t-2 border-primary/20">
        <p className="text-xs font-pixel text-secondary mb-3">SANDBOX OUTCOME</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSubmit('standard')}
            className={cn(
              'px-4 py-3 rounded-pixel font-pixel text-sm',
              'bg-secondary/20 border-2 border-secondary text-secondary',
              'hover:bg-secondary/30 hover:shadow-[0_0_15px_rgba(0,102,255,0.5)]',
              'transition-all duration-200 uppercase'
            )}
          >
            ⚡ Standard
          </button>
          <button
            onClick={() => handleSubmit('verified')}
            className={cn(
              'px-4 py-3 rounded-pixel font-pixel text-sm',
              'bg-accent-green/20 border-2 border-accent-green text-accent-green',
              'hover:bg-accent-green/30 hover:shadow-[0_0_15px_rgba(57,255,20,0.5)]',
              'transition-all duration-200 uppercase'
            )}
          >
            ✓ Verified
          </button>
          <button
            onClick={() => handleSubmit('review')}
            className={cn(
              'px-4 py-3 rounded-pixel font-pixel text-sm',
              'bg-gold/20 border-2 border-gold text-gold',
              'hover:bg-gold/30 hover:shadow-[0_0_15px_rgba(255,195,0,0.5)]',
              'transition-all duration-200 uppercase'
            )}
          >
            ⚠ Review
          </button>
          <button
            onClick={() => handleSubmit('rejected')}
            className={cn(
              'px-4 py-3 rounded-pixel font-pixel text-sm',
              'bg-accent-red/20 border-2 border-accent-red text-accent-red',
              'hover:bg-accent-red/30 hover:shadow-[0_0_15px_rgba(255,0,64,0.5)]',
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
