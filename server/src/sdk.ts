import Straddle from '@straddlecom/straddle';
import { config } from './config.js';

const isTest = process.env.NODE_ENV === 'test';

// Lightweight stub for test runs so unit tests never hit the network even if mocks fail to apply
const makeTestStub = () => ({
  customers: {
    create: async () => ({}),
    get: async () => ({}),
    unmasked: async () => ({}),
    review: {
      decision: async () => ({}),
      get: async () => ({}),
    },
  },
  paykeys: {
    get: async () => ({}),
    cancel: async () => ({}),
    review: {
      get: async () => ({}),
      decision: async () => ({}),
    },
  },
  charges: {
    create: async () => ({}),
    get: async () => ({}),
    cancel: async () => ({}),
  },
  bridge: {
    initialize: async () => ({}),
    link: {
      bankAccount: async () => ({}),
      plaid: async () => ({}),
    },
  },
});

// Initialize Straddle SDK client (or stub in tests)
export const straddleClient = isTest
  ? (makeTestStub() as unknown as Straddle)
  : new Straddle({
      apiKey: config.straddle.apiKey,
      environment: config.straddle.environment,
    });

export default straddleClient;
