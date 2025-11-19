import React from 'react';
import { useDemoStore } from '../../../lib/state';
import { ArcadeCanvas } from './ArcadeCanvas';
import { ArcadeHeader } from './ArcadeHeader';
import { StatusBar } from './StatusBar';

export const ArcadeGeneratorModal: React.FC = () => {
  const showPaykeyGenerator = useDemoStore((state) => state.showPaykeyGenerator);
  const generatorData = useDemoStore((state) => state.generatorData);
  const clearGeneratorData = useDemoStore((state) => state.clearGeneratorData);

  if (!showPaykeyGenerator || !generatorData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
      <div className="relative">
        <div className="flex flex-col items-center justify-center">
          <div className="border-4 border-cyan-500 p-1 bg-black shadow-[0_0_30px_rgba(0,255,255,0.3)] rounded-lg">
            <ArcadeHeader />
            <div className="relative">
              {/* Screen reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-sm" />
              <ArcadeCanvas
                width={640}
                height={480}
                data={generatorData}
                onComplete={clearGeneratorData}
              />
            </div>
            <StatusBar />
          </div>

          <button
            onClick={clearGeneratorData}
            className="mt-6 text-cyan-500 font-arcade text-xs hover:text-white hover:shadow-[0_0_10px_#00FFFF] transition-all border border-cyan-900 px-4 py-2 rounded bg-black/50"
          >
            [ CANCEL ]
          </button>
        </div>
      </div>
    </div>
  );
};
