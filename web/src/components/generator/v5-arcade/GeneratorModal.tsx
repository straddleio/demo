import React, { useEffect, useRef, useState } from 'react';
import { useDemoStore } from '@/lib/state';
import '@/styles/arcade.css';
import { GameEngine } from './core/GameEngine';
import { SpriteEngine } from './core/SpriteEngine';
import { SoundManager } from './audio/SoundManager';
import { WaldoStage } from './stages/WaldoStage';
import { Blake3Stage } from './stages/Blake3Stage';
import { MintingStage } from './stages/MintingStage';
import { ArcadeHeader } from './ArcadeHeader';
import { StatusBar } from './StatusBar';
import { MuteToggle } from './components/MuteToggle';

type StageType = 'waldo' | 'blake3' | 'minting';

export const ArcadeGeneratorModal: React.FC = () => {
  const showPaykeyGenerator = useDemoStore((state) => state.showPaykeyGenerator);
  const generatorData = useDemoStore((state) => state.generatorData);
  const clearGeneratorData = useDemoStore((state) => state.clearGeneratorData);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const soundManagerRef = useRef<SoundManager | null>(null);
  const waldoStageRef = useRef<WaldoStage | null>(null);
  const blake3StageRef = useRef<Blake3Stage | null>(null);
  const mintingStageRef = useRef<MintingStage | null>(null);
  const currentStageRef = useRef<StageType>('waldo');

  const [currentStage, setCurrentStage] = useState<StageType>('waldo');
  const [muted, setMuted] = useState(false);
  const [score, setScore] = useState(0);

  // Initialize canvas and game engine
  useEffect(() => {
    if (!showPaykeyGenerator || !generatorData || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Create core systems
    const engine = new GameEngine(ctx);
    const sprite = new SpriteEngine(ctx);
    const sound = new SoundManager();

    engineRef.current = engine;
    soundManagerRef.current = sound;

    // Create stages - each stage has different constructor requirements
    const waldoStage = new WaldoStage(sprite, sound, {
      customerName: generatorData.customerName,
      matchedName: generatorData.waldoData?.matchedName || generatorData.customerName,
      confidence: Math.round((generatorData.waldoData?.correlationScore || 1) * 100),
    });

    const blake3Stage = new Blake3Stage(ctx, sound);

    const mintingStage = new MintingStage(
      ctx,
      {
        tokenId: generatorData.paykeyToken,
        canvas,
      },
      sound
    );

    waldoStageRef.current = waldoStage;
    blake3StageRef.current = blake3Stage;
    mintingStageRef.current = mintingStage;

    // Start first stage
    waldoStage.start();
    currentStageRef.current = 'waldo';
    setCurrentStage('waldo');
    setScore(0);

    // Helper to transition stages
    const transitionToStage = (stage: StageType): void => {
      currentStageRef.current = stage;
      setCurrentStage(stage);
    };

    // Game loop update handler
    const handleUpdate = (deltaTime: number, totalTime: number): void => {
      if (currentStageRef.current === 'waldo' && waldoStageRef.current) {
        waldoStageRef.current.update(deltaTime, totalTime);
        waldoStageRef.current.render();
        setScore(waldoStageRef.current.getScore());

        if (waldoStageRef.current.isComplete()) {
          transitionToStage('blake3');
        }
      } else if (currentStageRef.current === 'blake3' && blake3StageRef.current) {
        const complete = blake3StageRef.current.update(deltaTime);
        blake3StageRef.current.render(ctx);

        if (complete) {
          transitionToStage('minting');
        }
      } else if (currentStageRef.current === 'minting' && mintingStageRef.current) {
        mintingStageRef.current.update(deltaTime);
        mintingStageRef.current.render();

        if (mintingStageRef.current.isComplete()) {
          // All stages complete - close modal after a delay
          setTimeout(() => {
            clearGeneratorData();
          }, 1000);
        }
      }
    };

    engine.on('update', handleUpdate);
    engine.start();

    return () => {
      engine.stop();
      sound.cleanup();
    };
  }, [showPaykeyGenerator, generatorData, clearGeneratorData]);

  // Handle mute toggle
  useEffect(() => {
    if (soundManagerRef.current) {
      soundManagerRef.current.setMuted(muted);
    }
  }, [muted]);

  if (!showPaykeyGenerator || !generatorData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-dark/90 backdrop-blur-sm">
      <div className="relative">
        <div className="flex flex-col items-center justify-center">
          <div className="arcade-shell rounded-lg">
            <ArcadeHeader />
            <div className="relative">
              {/* Screen reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-text-inverse/10 to-transparent pointer-events-none rounded-sm" />
              <canvas ref={canvasRef} width={640} height={480} role="img" aria-label="Arcade game canvas" className="arcade-canvas" />
            </div>
            <StatusBar
              score={score}
              currentStage={currentStage === 'waldo' ? 1 : currentStage === 'blake3' ? 2 : 3}
              totalStages={3}
              comboMultiplier={1}
              stars={5}
            />
          </div>

          <button
            onClick={clearGeneratorData}
            className="arcade-cta mt-6 px-4 py-2"
          >
            [ CANCEL ]
          </button>

          {/* Mute Toggle */}
          <MuteToggle muted={muted} onToggle={() => setMuted(!muted)} />
        </div>
      </div>
    </div>
  );
};
