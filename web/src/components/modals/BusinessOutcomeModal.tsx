import React from 'react';
import { CommandCard } from '../CommandCard';
import { cn } from '@/components/ui/utils';

interface BusinessOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOutcome: (outcome: 'standard' | 'verified' | 'review' | 'rejected') => void;
}

/**
 * Modal for selecting sandbox outcome when creating business customers
 * Matches the outcome selection pattern from CustomerCard
 */
export const BusinessOutcomeModal: React.FC<BusinessOutcomeModalProps> = ({
  isOpen,
  onClose,
  onSelectOutcome,
}) => {
  const handleSelect = (outcome: 'standard' | 'verified' | 'review' | 'rejected'): void => {
    onSelectOutcome(outcome);
    onClose();
  };

  return (
    <CommandCard isOpen={isOpen} onClose={onClose} title="CREATE BUSINESS CUSTOMER">
      <div className="space-y-4">
        {/* Description */}
        <div className="text-center">
          <p className="text-sm font-body text-neutral-300">
            Select sandbox outcome for business customer creation
          </p>
          <p className="text-xs font-mono text-neutral-500 mt-2">
            The Bluth Company • EIN: 12-3456789
          </p>
        </div>

        {/* Sandbox Outcome Buttons - Street Fighter Style */}
        <div className="mt-6 pt-4 border-t-2 border-primary/20">
          <p className="text-xs font-pixel text-secondary mb-3">SANDBOX OUTCOME</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSelect('standard')}
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
              onClick={() => handleSelect('verified')}
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
              onClick={() => handleSelect('review')}
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
              onClick={() => handleSelect('rejected')}
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
      </div>
    </CommandCard>
  );
};
