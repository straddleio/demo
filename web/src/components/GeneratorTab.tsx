import { useMemo } from 'react';
import { useDemoStore } from '@/lib/state';

/**
 * Generator Tab - Embeds the Paykey Generator Python app via iframe
 */
export const GeneratorTab: React.FC = () => {
  const generatorUrl = useDemoStore((state) => state.generatorUrl);
  const iframeUrl = useMemo(() => generatorUrl || '/api/generator', [generatorUrl]);

  if (!iframeUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-cyan-400">
        Loading generator...
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <iframe src={iframeUrl} className="w-full h-full border-0" title="Paykey Generator" />
    </div>
  );
};
