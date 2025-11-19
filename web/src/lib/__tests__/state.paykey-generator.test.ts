import { describe, it, expect, beforeEach } from 'vitest';
import { useDemoStore } from '../state';
import type { GeneratorData } from '../state';

describe('Paykey Generator State Management', () => {
  beforeEach(() => {
    // Reset store before each test
    useDemoStore.setState({
      customer: null,
      paykey: null,
      charge: null,
      terminalHistory: [],
      isExecuting: false,
      apiLogs: [],
      isConnected: false,
      connectionError: null,
      showPaykeyGenerator: false,
      generatorData: null,
    });
  });

  it('should initialize with generator modal hidden', () => {
    const state = useDemoStore.getState();

    expect(state.showPaykeyGenerator).toBe(false);
    expect(state.generatorData).toBeNull();
  });

  it('should set generator data with WALDO data (Plaid case)', () => {
    const generatorData: GeneratorData = {
      customerName: 'John Doe',
      waldoData: {
        correlationScore: 0.95,
        matchedName: 'JOHN DOE',
        namesOnAccount: ['JOHN DOE', 'J DOE'],
      },
      paykeyToken: '758c519d.02.2c16f91abc',
      accountLast4: '1234',
      routingNumber: '021000021',
    };

    useDemoStore.getState().setGeneratorData(generatorData);

    const state = useDemoStore.getState();
    expect(state.showPaykeyGenerator).toBe(true);
    expect(state.generatorData).toEqual(generatorData);
    expect(state.generatorData?.waldoData).toBeDefined();
    expect(state.generatorData?.waldoData?.correlationScore).toBe(0.95);
  });

  it('should set generator data without WALDO data (bank_account case)', () => {
    const generatorData: GeneratorData = {
      customerName: 'Jane Smith',
      paykeyToken: '758c519d.02.abc123xyz',
      accountLast4: '5678',
      routingNumber: '031000021',
    };

    useDemoStore.getState().setGeneratorData(generatorData);

    const state = useDemoStore.getState();
    expect(state.showPaykeyGenerator).toBe(true);
    expect(state.generatorData).toEqual(generatorData);
    expect(state.generatorData?.waldoData).toBeUndefined();
  });

  it('should clear generator data and hide modal', () => {
    // First set some data
    const generatorData: GeneratorData = {
      customerName: 'Test User',
      paykeyToken: 'test.token',
      accountLast4: '9999',
      routingNumber: '999999999',
    };

    useDemoStore.getState().setGeneratorData(generatorData);
    expect(useDemoStore.getState().showPaykeyGenerator).toBe(true);

    // Then clear it
    useDemoStore.getState().clearGeneratorData();

    const state = useDemoStore.getState();
    expect(state.showPaykeyGenerator).toBe(false);
    expect(state.generatorData).toBeNull();
  });

  it('should show modal when generator data is set', () => {
    const state = useDemoStore.getState();
    expect(state.showPaykeyGenerator).toBe(false);

    const generatorData: GeneratorData = {
      customerName: 'Test',
      paykeyToken: 'token',
      accountLast4: '0000',
      routingNumber: '000000000',
    };

    useDemoStore.getState().setGeneratorData(generatorData);

    expect(useDemoStore.getState().showPaykeyGenerator).toBe(true);
  });

  it('should hide modal when generator data is cleared', () => {
    const generatorData: GeneratorData = {
      customerName: 'Test',
      paykeyToken: 'token',
      accountLast4: '0000',
      routingNumber: '000000000',
    };

    useDemoStore.getState().setGeneratorData(generatorData);
    expect(useDemoStore.getState().showPaykeyGenerator).toBe(true);

    useDemoStore.getState().clearGeneratorData();
    expect(useDemoStore.getState().showPaykeyGenerator).toBe(false);
  });

  it('should clear generator data on reset', () => {
    const generatorData: GeneratorData = {
      customerName: 'Test User',
      waldoData: {
        correlationScore: 0.88,
        matchedName: 'TEST USER',
        namesOnAccount: ['TEST USER'],
      },
      paykeyToken: 'test.token',
      accountLast4: '1111',
      routingNumber: '111111111',
    };

    useDemoStore.getState().setGeneratorData(generatorData);
    expect(useDemoStore.getState().showPaykeyGenerator).toBe(true);

    // Reset should clear generator state
    useDemoStore.getState().reset();

    const state = useDemoStore.getState();
    expect(state.showPaykeyGenerator).toBe(false);
    expect(state.generatorData).toBeNull();
  });

  it('should preserve all required fields when setting generator data', () => {
    const generatorData: GeneratorData = {
      customerName: 'Complete User',
      waldoData: {
        correlationScore: 0.92,
        matchedName: 'COMPLETE USER',
        namesOnAccount: ['COMPLETE USER', 'C USER', 'USER COMPLETE'],
      },
      paykeyToken: '758c519d.02.complete123',
      accountLast4: '7890',
      routingNumber: '987654321',
    };

    useDemoStore.getState().setGeneratorData(generatorData);

    const state = useDemoStore.getState();
    expect(state.generatorData?.customerName).toBe('Complete User');
    expect(state.generatorData?.paykeyToken).toBe('758c519d.02.complete123');
    expect(state.generatorData?.accountLast4).toBe('7890');
    expect(state.generatorData?.routingNumber).toBe('987654321');
    expect(state.generatorData?.waldoData?.correlationScore).toBe(0.92);
    expect(state.generatorData?.waldoData?.matchedName).toBe('COMPLETE USER');
    expect(state.generatorData?.waldoData?.namesOnAccount).toHaveLength(3);
  });
});
