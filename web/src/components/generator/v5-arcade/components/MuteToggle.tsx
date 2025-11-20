import React from 'react';
import '@/styles/arcade.css';

interface MuteToggleProps {
  muted: boolean;
  onToggle: () => void;
}

export const MuteToggle: React.FC<MuteToggleProps> = ({ muted, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="arcade-mute absolute bottom-4 right-4 px-4 py-2"
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {muted ? '🔇 SOUND OFF' : '🔊 SOUND ON'}
    </button>
  );
};
