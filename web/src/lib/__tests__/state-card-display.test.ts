import { useDemoStore } from '../state';
import type { Customer, Paykey, Charge } from '../api';

describe('Card Display States', () => {
  beforeEach(() => {
    useDemoStore.setState({
      customer: null,
      paykey: null,
      charge: null,
    });
  });

  test('returns empty state when no resources exist', () => {
    const displayState = useDemoStore.getState().getCardDisplayState();

    expect(displayState.layout).toBe('empty');
    expect(displayState.customerWidth).toBe('full');
    expect(displayState.paykeyVisible).toBe(true);
    expect(displayState.paykeyMode).toBe('empty');
    expect(displayState.chargeMode).toBe('empty');
    expect(displayState.showCircularTracker).toBe(false);
  });

  test('returns customer-only state', () => {
    useDemoStore.getState().setCustomer({
      id: 'cust_123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '+12125550123',
      verification_status: 'verified',
    } as Customer);

    const displayState = useDemoStore.getState().getCardDisplayState();

    expect(displayState.layout).toBe('customer-only');
    expect(displayState.customerWidth).toBe('full');
    expect(displayState.paykeyVisible).toBe(true);
    expect(displayState.paykeyMode).toBe('empty');
    expect(displayState.chargeMode).toBe('empty');
  });

  test('returns customer+paykey state with 50/50 split', () => {
    useDemoStore.getState().setCustomer({ id: 'cust_123' } as Customer);
    useDemoStore.getState().setPaykey({ id: 'pk_123', status: 'active' } as Paykey);

    const displayState = useDemoStore.getState().getCardDisplayState();

    expect(displayState.layout).toBe('customer-paykey');
    expect(displayState.customerWidth).toBe('50');
    expect(displayState.paykeyVisible).toBe(true);
    expect(displayState.paykeyMode).toBe('standalone');
    expect(displayState.chargeMode).toBe('empty');
  });

  test('returns customer+charge state with embedded paykey (50/50 split)', () => {
    useDemoStore.getState().setCustomer({ id: 'cust_123' } as Customer);
    useDemoStore.getState().setPaykey({ id: 'pk_123' } as Paykey);
    useDemoStore.getState().setCharge({
      id: 'chg_123',
      status: 'created',
      amount: 5000
    } as Charge);

    const displayState = useDemoStore.getState().getCardDisplayState();

    expect(displayState.layout).toBe('customer-charge');
    expect(displayState.customerWidth).toBe('50');
    expect(displayState.paykeyVisible).toBe(false); // Hidden - embedded in charge
    expect(displayState.paykeyMode).toBe('embedded');
    expect(displayState.chargeMode).toBe('with-embedded-paykey');
  });

  test('returns featured tracker state when charge is scheduled', () => {
    useDemoStore.getState().setCustomer({ id: 'cust_123' } as Customer);
    useDemoStore.getState().setPaykey({ id: 'pk_123' } as Paykey);
    useDemoStore.getState().setCharge({
      id: 'chg_123',
      status: 'scheduled',
      amount: 5000
    } as Charge);

    const displayState = useDemoStore.getState().getCardDisplayState();

    expect(displayState.layout).toBe('tracker-featured');
    expect(displayState.customerWidth).toBe('compact');
    expect(displayState.paykeyVisible).toBe(false);
    expect(displayState.paykeyMode).toBe('in-tracker');
    expect(displayState.chargeMode).toBe('hidden');
    expect(displayState.showCircularTracker).toBe(true);
  });
});
