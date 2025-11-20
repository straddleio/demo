import React, { useEffect, useState } from 'react';
import { CommandCard } from '../CommandCard';
import { ThemeField, ThemeInput } from '@/components/ui/theme-primitives';
import { cn } from '@/components/ui/utils';

interface PaykeyCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: PaykeyFormData,
    outcome: 'standard' | 'active' | 'rejected' | 'review',
    type: 'plaid' | 'bank'
  ) => void;
  type: 'plaid' | 'bank';
  customerId?: string;
}

export interface PaykeyFormData {
  customer_id: string;
  // Plaid
  plaid_token?: string;
  // Bank
  account_number?: string;
  routing_number?: string;
  account_type?: 'checking' | 'savings';
}

export const PaykeyCard: React.FC<PaykeyCardProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  customerId,
}) => {
  const [formData, setFormData] = useState<PaykeyFormData>(() => ({
    customer_id: customerId || '',
    ...(type === 'plaid'
      ? { plaid_token: '' } // Empty - will use server's PLAID_PROCESSOR_TOKEN env var
      : {
          account_number: '123456789',
          routing_number: '021000021',
          account_type: 'checking',
        }),
  }));

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      customer_id: customerId || '',
    }));
  }, [customerId]);

  const handleSubmit = (outcome: 'standard' | 'active' | 'rejected' | 'review'): void => {
    const payload: PaykeyFormData = {
      ...formData,
      customer_id: formData.customer_id || customerId || '',
    };

    if (type === 'bank') {
      const { plaid_token: _unused, ...rest } = payload;
      Object.assign(payload, rest);
      delete payload.plaid_token;
    }

    onSubmit(payload, outcome, type);
    onClose();
  };

  const updateField = (field: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const title = type === 'plaid' ? 'LINK PLAID ACCOUNT' : 'LINK BANK ACCOUNT';

  return (
    <CommandCard isOpen={isOpen} onClose={onClose} title={title}>
      {/* Form Fields */}
      <div className="space-y-3">
        {/* Customer ID */}
        <ThemeField label="Customer ID" htmlFor="paykey-customer">
          <ThemeInput
            id="paykey-customer"
            inputSize="sm"
            type="text"
            value={formData.customer_id}
            onChange={(e) => updateField('customer_id', e.target.value)}
            placeholder="customer_xxx"
          />
        </ThemeField>

        {type === 'plaid' ? (
          /* Plaid Token */
          <ThemeField label="Plaid Token" htmlFor="paykey-plaid">
            <div className="relative">
              <ThemeInput
                id="paykey-plaid"
                inputSize="sm"
                type="text"
                value={formData.plaid_token}
                onChange={(e) => updateField('plaid_token', e.target.value)}
                className="pl-8"
                placeholder="Leave empty to use server default"
              />
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary/10 rounded-sm flex items-center justify-center">
                <span className="text-[10px] font-pixel text-primary">P</span>
              </div>
            </div>
          </ThemeField>
        ) : (
          /* Bank Account Fields */
          <>
            <ThemeField label="Account Number" htmlFor="paykey-account-number">
              <ThemeInput
                id="paykey-account-number"
                inputSize="sm"
                type="text"
                value={formData.account_number}
                onChange={(e) => updateField('account_number', e.target.value)}
              />
            </ThemeField>
            <ThemeField label="Routing Number" htmlFor="paykey-routing-number">
              <ThemeInput
                id="paykey-routing-number"
                inputSize="sm"
                type="text"
                value={formData.routing_number}
                onChange={(e) => updateField('routing_number', e.target.value)}
              />
            </ThemeField>
            <ThemeField label="Account Type" htmlFor="paykey-account-type">
              <select
                id="paykey-account-type"
                value={formData.account_type}
                onChange={(e) => updateField('account_type', e.target.value)}
                className={cn(
                  'w-full px-2 py-1 rounded bg-background-dark border border-primary/30 text-neutral-200 font-body text-sm focus:border-primary focus:outline-none'
                )}
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </ThemeField>
          </>
        )}
      </div>

      {/* Sandbox Outcome Buttons */}
      <div className="mt-6 pt-4 border-t-2 border-primary/20">
        <p className="text-xs font-pixel text-secondary mb-3">SANDBOX OUTCOME</p>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleSubmit('standard')}
            className={cn(
              'px-2 py-3 rounded-pixel font-pixel text-[10px]',
              'bg-secondary/20 border-2 border-secondary text-secondary',
              'hover:bg-secondary/30 hover:shadow-glow-blue',
              'transition-all duration-200 uppercase'
            )}
          >
            ⚡ Standard
          </button>
          <button
            onClick={() => handleSubmit('active')}
            className={cn(
              'px-2 py-3 rounded-pixel font-pixel text-[10px]',
              'bg-accent-green/20 border-2 border-accent-green text-accent-green',
              'hover:bg-accent-green/30 hover:shadow-glow-green',
              'transition-all duration-200 uppercase'
            )}
          >
            ✓ Active
          </button>
          <button
            onClick={() => handleSubmit('review')}
            className={cn(
              'px-2 py-3 rounded-pixel font-pixel text-[10px]',
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
              'px-2 py-3 rounded-pixel font-pixel text-[10px]',
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
