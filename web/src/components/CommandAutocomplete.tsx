import React from 'react';
import { cn } from '@/components/ui/utils';
import type { CommandInfo } from '@/lib/commands';

interface CommandAutocompleteProps {
  suggestions: CommandInfo[];
  highlightedIndex: number;
  onSelect: (commandId: string) => void;
  isVisible: boolean;
}

/**
 * Autocomplete dropdown for terminal commands
 * Shows suggestions that match user input
 */
export const CommandAutocomplete: React.FC<CommandAutocompleteProps> = ({
  suggestions,
  highlightedIndex,
  onSelect,
  isVisible,
}) => {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-background-elevated border-2 border-primary/40 rounded shadow-neon-primary max-h-64 overflow-y-auto scrollbar-retro">
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion.id}
          onClick={() => onSelect(suggestion.id)}
          className={cn(
            'px-3 py-2 cursor-pointer transition-colors font-mono text-xs',
            'border-b border-primary/10 last:border-b-0',
            highlightedIndex === index
              ? 'bg-primary/20 text-primary'
              : 'text-neutral-300 hover:bg-background-card/30'
          )}
        >
          <div className="font-bold text-primary">{suggestion.id}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">{suggestion.description}</div>
        </div>
      ))}
    </div>
  );
};
