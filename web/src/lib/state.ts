import { create } from 'zustand';
import type { Customer, Paykey, Charge } from './api';

/**
 * Helper function for UUID generation with fallback
 */
const uuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Terminal output line
 */
export interface TerminalLine {
  id: string;
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  timestamp: Date;
}

/**
 * Demo state
 */
export interface DemoState {
  // Resources
  customer: Customer | null;
  paykey: Paykey | null;
  charge: Charge | null;

  // Terminal
  terminalHistory: TerminalLine[];
  isExecuting: boolean;

  // SSE Connection
  isConnected: boolean;
  connectionError: string | null;

  // Actions
  setCustomer: (customer: Customer | null) => void;
  setPaykey: (paykey: Paykey | null) => void;
  setCharge: (charge: Charge | null) => void;

  addTerminalLine: (line: Omit<TerminalLine, 'id' | 'timestamp'>) => void;
  clearTerminal: () => void;
  setExecuting: (executing: boolean) => void;

  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;

  reset: () => void;
}

/**
 * Global demo store
 */
export const useDemoStore = create<DemoState>((set) => ({
  // Initial state
  customer: null,
  paykey: null,
  charge: null,
  terminalHistory: [
    {
      id: uuid(),
      text: 'STRADDLE DEMO TERMINAL v1.0',
      type: 'success',
      timestamp: new Date(),
    },
    {
      id: uuid(),
      text: 'Type /help for available commands',
      type: 'info',
      timestamp: new Date(),
    },
  ],
  isExecuting: false,
  isConnected: false,
  connectionError: null,

  // Actions
  setCustomer: (customer) => set({ customer }),
  setPaykey: (paykey) => set({ paykey }),
  setCharge: (charge) => set({ charge }),

  addTerminalLine: (line) =>
    set((state) => ({
      terminalHistory: [
        ...state.terminalHistory,
        {
          ...line,
          id: uuid(),
          timestamp: new Date(),
        },
      ],
    })),

  clearTerminal: () =>
    set({
      terminalHistory: [
        {
          id: uuid(),
          text: 'Terminal cleared',
          type: 'info',
          timestamp: new Date(),
        },
      ],
    }),

  setExecuting: (isExecuting) => set({ isExecuting }),
  setConnected: (isConnected) => set({ isConnected }),
  setConnectionError: (connectionError) => set({ connectionError }),

  reset: () =>
    set({
      customer: null,
      paykey: null,
      charge: null,
      isExecuting: false,
      terminalHistory: [
        {
          id: uuid(),
          text: 'State reset. Type /help for available commands',
          type: 'info',
          timestamp: new Date(),
        },
      ],
      connectionError: null,
    }),
}));
