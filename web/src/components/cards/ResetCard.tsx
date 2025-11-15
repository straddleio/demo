import React from 'react';
import { CommandCard } from '../CommandCard';
import { cn } from '@/components/ui/utils';

interface ResetCardProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetCard: React.FC<ResetCardProps> = ({ isOpen, onClose, onConfirm }) => {
  const handleReset = () => {
    onConfirm();
    onClose();
  };

  return (
    <CommandCard isOpen={isOpen} onClose={onClose} title="RESET DEMO">
      {/* Warning Visual */}
      <div className="py-6 text-center space-y-4">
        <div className="text-6xl">⚠️</div>

        <h3 className="font-pixel text-2xl text-accent-red text-glow-accent">
          WARNING
        </h3>

        <p className="text-neutral-300 font-body text-sm max-w-sm mx-auto">
          This will clear all demo data:
        </p>

        <div className="space-y-2 text-xs font-body text-neutral-400">
          <p>• Customer data</p>
          <p>• Paykey information</p>
          <p>• Charge history</p>
          <p>• Terminal output</p>
          <p>• API logs</p>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="mt-6 pt-4 border-t-2 border-primary/20">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className={cn(
              "px-4 py-3 rounded-pixel font-pixel text-sm",
              "bg-neutral-700/20 border-2 border-neutral-500 text-neutral-400",
              "hover:bg-neutral-700/30",
              "transition-all duration-200 uppercase"
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            className={cn(
              "px-4 py-3 rounded-pixel font-pixel text-sm",
              "bg-accent-red/20 border-2 border-accent-red text-accent-red",
              "hover:bg-accent-red/30 hover:shadow-[0_0_15px_rgba(255,0,64,0.5)]",
              "transition-all duration-200 uppercase"
            )}
          >
            🗑️ Reset
          </button>
        </div>
      </div>
    </CommandCard>
  );
};
