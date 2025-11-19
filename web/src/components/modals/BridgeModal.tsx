import React from 'react';
import { StraddleBridge } from '@straddleio/bridge-react';
import { useDemoStore } from '../../lib/state';
import { Paykey } from '../../lib/api';

export const BridgeModal: React.FC = () => {
  const {
    isBridgeModalOpen,
    bridgeToken,
    setBridgeModalOpen,
    setBridgeToken,
    setPaykey,
    addTerminalLine,
  } = useDemoStore();

  const handleSuccess = (event: { data: Paykey }): void => {
    if (!event?.data?.id) {
      addTerminalLine({
        text: '✗ Invalid paykey data received from Bridge',
        type: 'error',
        source: 'ui-action',
      });
      setBridgeToken(null);
      setBridgeModalOpen(false);
      return;
    }

    setPaykey(event.data);
    addTerminalLine({
      text: `✓ Paykey created via Bridge: ${event.data.id}`,
      type: 'success',
      source: 'ui-action',
    });
    setBridgeToken(null);
    setBridgeModalOpen(false);
  };

  const handleExit = (): void => {
    // Force remove Straddle iframe that doesn't cleanup automatically
    const iframe = document.getElementById('Straddle-widget-iframe');
    if (iframe) {
      iframe.remove();
    }

    addTerminalLine({
      text: 'Bridge widget closed',
      type: 'info',
      source: 'ui-action',
    });
    setBridgeToken(null);
    setBridgeModalOpen(false);
  };

  const handleLoadError = (error: unknown): void => {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    addTerminalLine({
      text: `✗ Failed to load Bridge widget: ${errorMsg}`,
      type: 'error',
      source: 'ui-action',
    });
    setBridgeToken(null);
    setBridgeModalOpen(false);
  };

  // ESC key handler
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        handleExit();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Cleanup orphaned iframe on unmount (defense in depth)
  React.useEffect(() => {
    return () => {
      const iframe = document.getElementById('Straddle-widget-iframe');
      if (iframe) {
        iframe.remove();
      }
    };
  }, []);

  if (!bridgeToken || bridgeToken.trim() === '') {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isBridgeModalOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm"
          style={{
            zIndex: 2147483646,
            background:
              'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 102, 255, 0.3) 100%)',
          }}
          onClick={handleExit}
        />
      )}

      {/* Bridge Widget - only render when modal is open */}
      {isBridgeModalOpen && (
        <StraddleBridge
          token={bridgeToken}
          mode="sandbox"
          open={true}
          onSuccess={handleSuccess}
          onClose={handleExit}
          onLoadError={handleLoadError}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '800px',
            zIndex: 2147483647,
            border: '3px solid #00FFFF',
            borderRadius: '12px',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
          }}
        />
      )}

      {/* Close button overlay */}
      {isBridgeModalOpen && (
        <button
          onClick={handleExit}
          className="fixed top-4 right-4 z-[2147483648] px-3 py-2 bg-accent text-white font-pixel text-xs rounded hover:bg-accent/80 transition-colors border-2 border-accent-dark shadow-lg"
          aria-label="Close Bridge widget"
        >
          ✕ ESC
        </button>
      )}
    </>
  );
};
