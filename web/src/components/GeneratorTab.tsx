import React from 'react';

/**
 * Generator Tab placeholder for a future iframe embed.
 * The live Python generator has been removed; drop in the new link when it is ready.
 */
export const GeneratorTab: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center text-center px-6">
    <div className="max-w-xl space-y-3">
      <p className="font-pixel text-xs text-neutral-500">GENERATOR PLACEHOLDER</p>
      <p className="text-neutral-300 font-body text-sm">
        The Python paykey generator embed has been removed. Add the replacement iframe source here
        when it becomes available.
      </p>
      <div className="mt-4 h-48 border border-dashed border-neutral-700 rounded-md flex items-center justify-center text-neutral-600 font-mono text-xs">
        iframe goes here
      </div>
    </div>
  </div>
);
