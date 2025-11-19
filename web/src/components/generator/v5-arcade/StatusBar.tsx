import React from 'react';

export const StatusBar: React.FC = () => {
  return (
    <div className="w-full border-t-2 border-cyan-400 bg-black p-2 mt-4 flex justify-between font-arcade text-xs text-green-400">
      <div className="border-r border-cyan-900 pr-4">SCORE: 0000</div>
      <div className="border-r border-cyan-900 pr-4">STAGE: 1/3</div>
      <div className="border-r border-cyan-900 pr-4">COMBO: x1</div>
      <div>★★★☆☆</div>
    </div>
  );
};
