import { useState, useEffect } from 'react';

/**
 * Generator Tab - Embeds the Paykey Generator Python app via iframe
 */
export const GeneratorTab: React.FC = () => {
  const [generatorUrl, setGeneratorUrl] = useState<string>('');

  useEffect(() => {
    const fetchConfig = async (): Promise<void> => {
      try {
        const response = await fetch('http://localhost:3001/api/config');
        const config = (await response.json()) as { generatorUrl?: string };
        setGeneratorUrl(config.generatorUrl ?? 'http://localhost:8081');
      } catch (error) {
        console.error('Failed to fetch generator URL, using default', error);
        setGeneratorUrl('http://localhost:8081');
      }
    };

    void fetchConfig();
  }, []);

  if (!generatorUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-cyan-400">
        Loading generator...
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <iframe src={generatorUrl} className="w-full h-full border-0" title="Paykey Generator" />
    </div>
  );
};
