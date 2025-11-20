import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill ResizeObserver for jsdom environment
// Required for Three.js Canvas and react-use-measure to work in tests
global.ResizeObserver = class ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
} as typeof ResizeObserver;

// Mock HTMLCanvasElement.getContext for 2D canvas tests
// Required for SpriteEngine and other canvas-based components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
HTMLCanvasElement.prototype.getContext = function (contextId: any): any {
  if (contextId === '2d') {
    return {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'top',
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      fillRect: vi.fn(),
      fillText: vi.fn(),
      strokeRect: vi.fn(),
      strokeText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      globalAlpha: 1,
      canvas: { width: 640, height: 480 },
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
};

// Mock AudioContext for SoundManager tests
global.AudioContext = class MockAudioContext {
  currentTime = 0;
  destination = {};

  createOscillator(): OscillatorNode {
    return {
      type: 'square',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    } as unknown as OscillatorNode;
  }

  createGain(): GainNode {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    } as unknown as GainNode;
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
} as unknown as typeof AudioContext;

// Mock Zustand store for tests
// This provides a base mock that can be overridden in individual test files
vi.mock('@/lib/state', () => {
  // Create a shared state object that persists across calls
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sharedState: any = {
    customer: null,
    paykey: null,
    charge: null,
    featureFlags: {
      enableUnmask: false,
      enableLogStream: false,
    },
    generatorUrl: 'http://localhost:8081',
    terminalHistory: [],
    isExecuting: false,
    apiLogs: [],
    isConnected: false,
    connectionError: null,
    showPaykeyGenerator: false,
    generatorData: null,
    bridgeToken: null,
    isBridgeModalOpen: false,
    reviewModalData: null,
    isReviewModalOpen: false,
    showEndDemoBanner: false,
  };

  const mockSetReviewModalData = vi.fn();
  const mockAddAPILogEntry = vi.fn((entry: { type: string; text: string }) => {
    const id = `mock-api-log-${Date.now()}-${Math.random()}`;
    const terminalLine = {
      id,
      text: entry.text,
      type: 'info' as const,
      timestamp: new Date(),
      source: 'ui-action' as const,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sharedState.terminalHistory = [...sharedState.terminalHistory, terminalLine];
    return id;
  });
  const mockAddTerminalLine = vi.fn((line: { text: string; type: string }) => {
    const id = `mock-command-${Date.now()}-${Math.random()}`;
    const terminalLine = {
      id,
      text: line.text,
      type: line.type,
      timestamp: new Date(),
      apiLogs: [],
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sharedState.terminalHistory = [...sharedState.terminalHistory, terminalLine];
    return id;
  });
  const mockReset = vi.fn(() => {
    sharedState.customer = null;
    sharedState.paykey = null;
    sharedState.charge = null;
    sharedState.featureFlags = {
      enableUnmask: false,
      enableLogStream: false,
    };
    sharedState.generatorUrl = 'http://localhost:8081';
    sharedState.terminalHistory = [
      {
        id: `mock-reset-${Date.now()}`,
        text: 'State reset. Type /help for available commands',
        type: 'info',
        timestamp: new Date(),
      },
    ];
    sharedState.apiLogs = [];
    sharedState.generatorData = null;
    sharedState.showPaykeyGenerator = false;
    sharedState.isExecuting = false;
    sharedState.connectionError = null;
  });
  const mockSetState = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockSetCustomer = vi.fn((customer: any) => {
    sharedState.customer = customer;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockSetPaykey = vi.fn((paykey: any) => {
    sharedState.paykey = paykey;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockSetCharge = vi.fn((charge: any) => {
    sharedState.charge = charge;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockSetGeneratorData = vi.fn((data: any) => {
    sharedState.generatorData = data;
    sharedState.showPaykeyGenerator = data !== null;
  });
  const mockClearGeneratorData = vi.fn(() => {
    sharedState.generatorData = null;
    sharedState.showPaykeyGenerator = false;
  });
  const mockSetExecuting = vi.fn((executing: boolean) => {
    sharedState.isExecuting = executing;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockAssociateAPILogsWithCommand = vi.fn((commandId: string, logs: any[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sharedState.terminalHistory = sharedState.terminalHistory.map((line: any) =>
      line.id === commandId
        ? { ...line, apiLogs: [...(line.apiLogs || []), ...logs] }
        : line
    );
  });
  const mockClearTerminalHistory = vi.fn(() => {
    sharedState.terminalHistory = [];
  });
  const mockClearTerminal = vi.fn(() => {
    const id = `mock-clear-${Date.now()}-${Math.random()}`;
    sharedState.terminalHistory = [
      {
        id,
        text: 'Terminal cleared',
        type: 'info',
        timestamp: new Date(),
      },
    ];
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockSetApiLogs = vi.fn((logs: any[]) => {
    sharedState.apiLogs = logs;
  });
  const mockSetConnected = vi.fn((connected: boolean) => {
    sharedState.isConnected = connected;
  });
  const mockSetConnectionError = vi.fn((error: string | null) => {
    sharedState.connectionError = error;
  });
  const mockSetBridgeToken = vi.fn((token: string | null) => {
    sharedState.bridgeToken = token;
  });
  const mockSetBridgeModalOpen = vi.fn((open: boolean) => {
    sharedState.isBridgeModalOpen = open;
  });
  const mockSetReviewModalOpen = vi.fn((open: boolean) => {
    sharedState.isReviewModalOpen = open;
  });
  const mockSetFeatureFlags = vi.fn(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (flags: any) =>
      (sharedState.featureFlags = {
        ...sharedState.featureFlags,
        ...flags,
      })
  );
  const mockSetGeneratorUrl = vi.fn((url: string) => {
    sharedState.generatorUrl = url;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockGetCardDisplayState = vi.fn((): any => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { customer, paykey, charge } = sharedState;

    // No resources - empty state (maintain current UX)
    if (!customer) {
      return {
        layout: 'empty' as const,
        customerWidth: 'full' as const,
        paykeyVisible: true,
        paykeyMode: 'empty' as const,
        chargeMode: 'empty' as const,
        showCircularTracker: false,
      };
    }

    // Customer only
    if (!paykey) {
      return {
        layout: 'customer-only' as const,
        customerWidth: 'full' as const,
        paykeyVisible: true,
        paykeyMode: 'empty' as const,
        chargeMode: 'empty' as const,
        showCircularTracker: false,
      };
    }

    // Customer + Paykey (no charge yet)
    if (!charge) {
      return {
        layout: 'customer-paykey' as const,
        customerWidth: '50' as const,
        paykeyVisible: true,
        paykeyMode: 'standalone' as const,
        chargeMode: 'empty' as const,
        showCircularTracker: false,
      };
    }

    // Check if charge is scheduled/pending/paid - show featured tracker
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isScheduled = charge.status === 'scheduled' ||
                       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                       charge.status === 'pending' ||
                       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                       charge.status === 'paid';

    if (isScheduled) {
      return {
        layout: 'tracker-featured' as const,
        customerWidth: 'compact' as const,
        paykeyVisible: false,
        paykeyMode: 'in-tracker' as const,
        chargeMode: 'hidden' as const,
        showCircularTracker: true,
      };
    }

    // Customer + Charge (created) - paykey embedded in charge card
    return {
      layout: 'customer-charge' as const,
      customerWidth: '50' as const,
      paykeyVisible: false, // Hidden - embedded in charge card
      paykeyMode: 'embedded' as const,
      chargeMode: 'with-embedded-paykey' as const,
      showCircularTracker: false,
    };
  });

  return {
    useDemoStore: Object.assign(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.fn((selector: ((state: any) => any) | undefined) => {
        const mockState = {
          ...sharedState,
          reset: mockReset,
          setCustomer: mockSetCustomer,
          setPaykey: mockSetPaykey,
          setCharge: mockSetCharge,
          setGeneratorData: mockSetGeneratorData,
          clearGeneratorData: mockClearGeneratorData,
          addTerminalLine: mockAddTerminalLine,
          addAPILogEntry: mockAddAPILogEntry,
          setReviewModalData: mockSetReviewModalData,
          setReviewModalOpen: mockSetReviewModalOpen,
          setFeatureFlags: mockSetFeatureFlags,
          setGeneratorUrl: mockSetGeneratorUrl,
          setExecuting: mockSetExecuting,
          associateAPILogsWithCommand: mockAssociateAPILogsWithCommand,
          clearTerminalHistory: mockClearTerminalHistory,
          clearTerminal: mockClearTerminal,
          setApiLogs: mockSetApiLogs,
          setConnected: mockSetConnected,
          setConnectionError: mockSetConnectionError,
          setBridgeToken: mockSetBridgeToken,
          setBridgeModalOpen: mockSetBridgeModalOpen,
          getCardDisplayState: mockGetCardDisplayState,
        };
        if (!selector) {
          return mockState;
        }
        return selector(mockState);
      }),
      {
        getState: vi.fn(() => ({
          ...sharedState,
          setCustomer: mockSetCustomer,
          setPaykey: mockSetPaykey,
          setCharge: mockSetCharge,
          setGeneratorData: mockSetGeneratorData,
          clearGeneratorData: mockClearGeneratorData,
          setFeatureFlags: mockSetFeatureFlags,
          setGeneratorUrl: mockSetGeneratorUrl,
          addAPILogEntry: mockAddAPILogEntry,
          addTerminalLine: mockAddTerminalLine,
          setReviewModalData: mockSetReviewModalData,
          setReviewModalOpen: mockSetReviewModalOpen,
          setExecuting: mockSetExecuting,
          associateAPILogsWithCommand: mockAssociateAPILogsWithCommand,
          clearTerminalHistory: mockClearTerminalHistory,
          clearTerminal: mockClearTerminal,
          setApiLogs: mockSetApiLogs,
          setConnected: mockSetConnected,
          setConnectionError: mockSetConnectionError,
          setBridgeToken: mockSetBridgeToken,
          setBridgeModalOpen: mockSetBridgeModalOpen,
          reset: mockReset,
          getCardDisplayState: mockGetCardDisplayState,
        })),
        setState: mockSetState,
      }
    ),
  };
});
