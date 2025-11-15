import React from 'react';
import { CommandCard } from '../CommandCard';
import { cn } from '@/components/ui/utils';

interface DemoCardProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DemoCard: React.FC<DemoCardProps> = ({ isOpen, onClose, onConfirm }) => {
  const handleExecute = () => {
    onConfirm();
    onClose();
  };

  return (
    <CommandCard isOpen={isOpen} onClose={onClose} title="DEMO MODE">
      {/* Street Fighter Style Visual */}
      <div className="py-8 text-center space-y-6">
        <div className="relative">
          <h3 className={cn(
            "font-pixel text-6xl text-primary text-glow-primary",
            "animate-pulse"
          )}>
            AUTO
          </h3>
          <h3 className={cn(
            "font-pixel text-6xl text-accent text-glow-accent",
            "animate-pulse",
            "animation-delay-150"
          )}>
            ATTACK
          </h3>
        </div>

        <p className="text-neutral-300 font-body text-sm max-w-sm mx-auto">
          Execute full happy-path flow: Customer → Paykey → Charge
        </p>

        <div className="space-y-2 text-xs font-pixel text-secondary">
          <p>⚡ Create verified customer</p>
          <p>⚡ Link active bank account</p>
          <p>⚡ Process successful charge</p>
        </div>
      </div>

      {/* Execute Button */}
      <div className="mt-6 pt-4 border-t-2 border-primary/20">
        <button
          onClick={handleExecute}
          className={cn(
            "w-full px-6 py-4 rounded-pixel font-pixel text-lg",
            "bg-gradient-to-r from-primary via-secondary to-accent",
            "text-black border-4 border-gold",
            "hover:shadow-[0_0_30px_rgba(0,255,255,0.8)]",
            "transition-all duration-200 uppercase",
            "animate-pulse"
          )}
        >
          🎮 EXECUTE COMBO
        </button>
      </div>
    </CommandCard>
  );
};
