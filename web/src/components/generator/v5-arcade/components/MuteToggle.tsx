import React from 'react';

interface MuteToggleProps {
  muted: boolean;
  onToggle: () => void;
}

export const MuteToggle: React.FC<MuteToggleProps> = ({ muted, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="absolute bottom-4 right-4 px-4 py-2 border-2 border-cyan-500 bg-black text-cyan-500 font-arcade text-xs hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_10px_rgba(0,255,255,0.5)] hover:shadow-[0_0_20px_rgba(0,255,255,0.8)]"
      style={{
        fontFamily: '"Press Start 2P", monospace',
      }}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {muted ? '🔇 SOUND OFF' : '🔊 SOUND ON'}
    </button>
  );
};
