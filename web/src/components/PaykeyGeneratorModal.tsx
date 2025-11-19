/**
 * Paykey Generator Modal
 *
 * Full-screen modal that visualizes the paykey generation process.
 * Shows progression through stages: WALDO → BLAKE3 → Minting → Complete
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useDemoStore } from '@/lib/state';
import { cn } from '@/components/ui/utils';
import type { GeneratorStage } from './generator/types';
import { WaldoStage } from './generator/WaldoStage';
import { Blake3Stage } from './generator/Blake3Stage';
import { MintingStage } from './generator/MintingStage';
import { GeneratorErrorBoundary } from './generator/ErrorBoundary';

/**
 * PaykeyGeneratorModal Component
 *
 * Features:
 * - Full-screen overlay with semi-transparent background
 * - Centered modal with retro-futuristic neon styling
 * - Stage progression with animated visualizations
 * - ESC key to close
 * - Skip button in top-right
 */
export const PaykeyGeneratorModal: React.FC = () => {
  const showPaykeyGenerator = useDemoStore((state) => state.showPaykeyGenerator);
  const generatorData = useDemoStore((state) => state.generatorData);
  const clearGeneratorData = useDemoStore((state) => state.clearGeneratorData);

  const [currentStage, setCurrentStage] = useState<GeneratorStage>('waldo');
  const [generatedHash, setGeneratedHash] = useState<string>('');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && showPaykeyGenerator) {
        clearGeneratorData();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showPaykeyGenerator, clearGeneratorData]);

  // Reset to WALDO stage when modal opens
  useEffect(() => {
    if (showPaykeyGenerator) {
      // If no WALDO data, skip directly to BLAKE3
      setCurrentStage(generatorData?.waldoData ? 'waldo' : 'blake3');
    } else {
      setCurrentStage('waldo');
    }
  }, [showPaykeyGenerator, generatorData?.waldoData]);

  // Handle stage progression
  const handleWaldoComplete = useCallback((): void => {
    setCurrentStage('blake3');
  }, []);

  // Handle BLAKE3 completion
  const handleBlake3Complete = useCallback((hash: string): void => {
    setGeneratedHash(hash);
    setCurrentStage('minting');
  }, []);

  // Handle Minting completion
  const handleMintingComplete = useCallback((): void => {
    // MintingStage handles all animations, then closes modal
    clearGeneratorData();
  }, [clearGeneratorData]);

  // Handle animation errors
  const handleAnimationError = useCallback(
    (_error: Error): void => {
      // Close modal after brief delay to show error message
      setTimeout(() => {
        clearGeneratorData();
      }, 2000);
    },
    [clearGeneratorData]
  );

  if (!showPaykeyGenerator || !generatorData) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          clearGeneratorData();
        }
      }}
    >
      {/* Overlay with scanline effect and vignette */}
      <div className="absolute inset-0 bg-background-dark/95 backdrop-blur-md">
        {/* Scanlines */}
        <div className="scanlines absolute inset-0 opacity-20 pointer-events-none" />
        {/* CRT Vignette */}
        <div
          className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle, transparent 50%, black 100%)' }}
        />
      </div>

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl mx-4 animate-snap-in">
        {/* Modal Box */}
        <div
          className={cn(
            'relative',
            'bg-background-card border-2 rounded-lg', // Use standard rounded for outer frame
            'p-8',
            // Hardware frame styling
            'before:absolute before:top-2 before:left-2 before:w-2 before:h-2 before:bg-neutral-700 before:rounded-full before:shadow-inner',
            'after:absolute after:top-2 after:right-2 after:w-2 after:h-2 after:bg-neutral-700 after:rounded-full after:shadow-inner',
            // Neon border colors - cycling based on stage
            currentStage === 'waldo' && 'border-primary shadow-neon-primary-lg',
            currentStage === 'blake3' && 'border-accent shadow-neon-accent-lg',
            currentStage === 'minting' && 'border-gold shadow-glow-gold',
            currentStage === 'complete' && 'border-accent-green shadow-glow-green',
            // Pulsing glow effect
            'animate-pulse-glow'
          )}
        >
          {/* Bottom screws */}
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-neutral-700 rounded-full shadow-inner" />
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-neutral-700 rounded-full shadow-inner" />

          {/* Skip Button */}
          <button
            onClick={clearGeneratorData}
            className={cn(
              'absolute top-6 right-6 z-20',
              'px-3 py-1.5',
              'text-xs font-pixel uppercase',
              'border border-neutral-600 text-neutral-400 rounded-pixel',
              'hover:border-primary hover:text-primary',
              'hover:shadow-glow-primary',
              'transition-all'
            )}
          >
            SKIP
          </button>

          {/* Header */}
          <div className="text-center mb-8 relative">
            <h2 className="text-2xl font-pixel text-primary mb-2 text-glow-primary animate-flicker">
              PAYKEY GENERATOR
            </h2>
            <p className="text-sm font-body text-neutral-400">
              <span className="text-primary mr-2">&gt;</span>
              Generating secure token for{' '}
              <span className="text-neutral-200">{generatorData.customerName}</span>
              <span className="animate-pulse">_</span>
            </p>
            <div className="h-px w-full max-w-md mx-auto mt-4 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {/* Stage Container */}
          <GeneratorErrorBoundary onError={handleAnimationError}>
            <div className="space-y-6 relative min-h-[400px]">
              {/* WALDO Stage - Only for Plaid paykeys */}
              {generatorData.waldoData && (
                <div
                  className={cn(
                    'border-2 rounded-pixel p-6 transition-all duration-500',
                    currentStage === 'waldo'
                      ? 'border-primary bg-primary/5 shadow-glow-primary scale-100 opacity-100'
                      : 'border-neutral-700 bg-background-dark opacity-40 scale-95 blur-[1px]'
                  )}
                >
                  {currentStage === 'waldo' ? (
                    <WaldoStage generatorData={generatorData} onComplete={handleWaldoComplete} />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-accent-green text-accent-green flex items-center justify-center font-pixel text-xs shadow-glow-green">
                        ✓
                      </div>
                      <div className="flex-1">
                        <p className="font-pixel text-sm text-accent-green text-glow-green">
                          WALDO VERIFICATION
                        </p>
                        <p className="text-xs text-neutral-400 font-body mt-1">
                          Correlation Score: {generatorData.waldoData.correlationScore}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BLAKE3 Stage */}
              <div
                className={cn(
                  'border-2 rounded-pixel p-6 transition-all duration-500',
                  currentStage === 'blake3'
                    ? 'border-accent bg-accent/5 shadow-glow-accent scale-100 opacity-100'
                    : currentStage === 'waldo'
                      ? 'border-neutral-800 bg-background-dark opacity-30 scale-95'
                      : 'border-neutral-700 bg-background-dark opacity-40 scale-95 blur-[1px]'
                )}
              >
                {currentStage === 'blake3' ? (
                  <Blake3Stage generatorData={generatorData} onComplete={handleBlake3Complete} />
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full border-2 flex items-center justify-center font-pixel text-xs transition-colors duration-300',
                        currentStage === 'minting' || currentStage === 'complete'
                          ? 'border-accent-green text-accent-green shadow-glow-green'
                          : 'border-neutral-700 text-neutral-700'
                      )}
                    >
                      {currentStage === 'minting' || currentStage === 'complete' ? '✓' : '2'}
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          'font-pixel text-sm transition-colors duration-300',
                          currentStage === 'minting' || currentStage === 'complete'
                            ? 'text-accent-green text-glow-green'
                            : 'text-neutral-700'
                        )}
                      >
                        BLAKE3 HASHING
                      </p>
                      <p className="text-xs text-neutral-400 font-body mt-1 font-mono truncate">
                        {generatedHash || 'Pending...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Minting Stage */}
              <div
                className={cn(
                  'border-2 rounded-pixel p-6 transition-all duration-500',
                  currentStage === 'minting'
                    ? 'border-gold bg-gold/5 shadow-glow-gold scale-100 opacity-100'
                    : 'border-neutral-800 bg-background-dark opacity-30 scale-95'
                )}
              >
                {currentStage === 'minting' ? (
                  <MintingStage
                    generatorData={generatorData}
                    hash={generatedHash}
                    onComplete={handleMintingComplete}
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-neutral-700 text-neutral-700 flex items-center justify-center font-pixel text-xs">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-pixel text-sm text-neutral-700">MINTING PAYKEY</p>
                      <p className="text-xs text-neutral-400 font-body mt-1">
                        Account: ••••{generatorData.accountLast4} | Routing:{' '}
                        {generatorData.routingNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GeneratorErrorBoundary>
        </div>
      </div>
    </div>
  );
};
