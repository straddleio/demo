import { stateManager } from '../state.js';
import { DemoCustomer, DemoPaykey, DemoCharge } from '../types.js';

describe('State Manager', () => {
  // Reset state before each test
  beforeEach(() => {
    stateManager.reset();
    stateManager.removeAllListeners();
  });

  afterEach(() => {
    stateManager.removeAllListeners();
  });

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const state = stateManager.getState();
      expect(state.customer).toBeNull();
      expect(state.paykey).toBeNull();
      expect(state.charge).toBeNull();
    });

    it('should return a copy of the state (not direct reference)', () => {
      const state1 = stateManager.getState();
      const state2 = stateManager.getState();
      expect(state1).not.toBe(state2); // Different object references
      expect(state1).toEqual(state2); // But same content
    });
  });

  describe('Customer State Management', () => {
    it('should set customer state', () => {
      const mockCustomer: DemoCustomer = {
        id: 'cust_123',
        name: 'John Doe',
        type: 'individual',
        email: 'john@example.com',
        phone: '+12125550123',
        verification_status: 'verified',
        risk_score: 25,
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setCustomer(mockCustomer);

      const state = stateManager.getState();
      expect(state.customer).toEqual(mockCustomer);
    });

    it('should emit state:customer event when customer is set', (done) => {
      const mockCustomer: DemoCustomer = {
        id: 'cust_456',
        name: 'Jane Smith',
        type: 'individual',
        email: 'jane@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.on('state:customer', (customer) => {
        expect(customer).toEqual(mockCustomer);
        done();
      });

      stateManager.setCustomer(mockCustomer);
    });

    it('should emit state:change event when customer is set', (done) => {
      const mockCustomer: DemoCustomer = {
        id: 'cust_789',
        name: 'Bob Johnson',
        type: 'business',
        email: 'bob@company.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.on('state:change', (state) => {
        expect(state.customer).toEqual(mockCustomer);
        expect(state.paykey).toBeNull();
        expect(state.charge).toBeNull();
        done();
      });

      stateManager.setCustomer(mockCustomer);
    });

    it('should update existing customer state', () => {
      const mockCustomer: DemoCustomer = {
        id: 'cust_abc',
        name: 'Alice Cooper',
        type: 'individual',
        email: 'alice@example.com',
        verification_status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setCustomer(mockCustomer);

      stateManager.updateCustomer({
        verification_status: 'verified',
        risk_score: 15,
      });

      const state = stateManager.getState();
      expect(state.customer?.verification_status).toBe('verified');
      expect(state.customer?.risk_score).toBe(15);
      expect(state.customer?.name).toBe('Alice Cooper'); // Original fields preserved
    });

    it('should emit events when customer is updated', (done) => {
      const mockCustomer: DemoCustomer = {
        id: 'cust_def',
        name: 'Charlie Brown',
        type: 'individual',
        email: 'charlie@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setCustomer(mockCustomer);

      let eventCount = 0;
      stateManager.on('state:customer', () => {
        eventCount++;
      });

      stateManager.on('state:change', () => {
        eventCount++;
        if (eventCount === 2) {
          done();
        }
      });

      stateManager.updateCustomer({ verification_status: 'verified' });
    });

    it('should not update customer if customer is null', () => {
      stateManager.updateCustomer({ verification_status: 'verified' });

      const state = stateManager.getState();
      expect(state.customer).toBeNull();
    });
  });

  describe('Paykey State Management', () => {
    it('should set paykey state', () => {
      const mockPaykey: DemoPaykey = {
        id: 'paykey_123',
        paykey: '758c519d.02.2c16f91',
        customer_id: 'cust_123',
        status: 'active',
        label: 'Chase Bank ****1234',
        institution_name: 'Chase Bank',
        source: 'bank_account',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setPaykey(mockPaykey);

      const state = stateManager.getState();
      expect(state.paykey).toEqual(mockPaykey);
    });

    it('should emit state:paykey event when paykey is set', (done) => {
      const mockPaykey: DemoPaykey = {
        id: 'paykey_456',
        paykey: '758c519d.03.abc123',
        customer_id: 'cust_456',
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.on('state:paykey', (paykey) => {
        expect(paykey).toEqual(mockPaykey);
        done();
      });

      stateManager.setPaykey(mockPaykey);
    });

    it('should emit state:change event when paykey is set', (done) => {
      const mockPaykey: DemoPaykey = {
        id: 'paykey_789',
        paykey: '758c519d.04.def456',
        customer_id: 'cust_789',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.on('state:change', (state) => {
        expect(state.paykey).toEqual(mockPaykey);
        expect(state.customer).toBeNull();
        expect(state.charge).toBeNull();
        done();
      });

      stateManager.setPaykey(mockPaykey);
    });
  });

  describe('Charge State Management', () => {
    it('should set charge state', () => {
      const mockCharge: DemoCharge = {
        id: 'charge_123',
        customer_id: 'cust_123',
        paykey: '758c519d.02.2c16f91',
        amount: 5000,
        currency: 'USD',
        status: 'pending',
        payment_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setCharge(mockCharge);

      const state = stateManager.getState();
      expect(state.charge).toEqual(mockCharge);
    });

    it('should emit state:charge event when charge is set', (done) => {
      const mockCharge: DemoCharge = {
        id: 'charge_456',
        paykey: '758c519d.03.abc123',
        amount: 10000,
        currency: 'USD',
        status: 'scheduled',
        payment_date: '2024-01-02',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.on('state:charge', (charge) => {
        expect(charge).toEqual(mockCharge);
        done();
      });

      stateManager.setCharge(mockCharge);
    });

    it('should emit state:change event when charge is set', (done) => {
      const mockCharge: DemoCharge = {
        id: 'charge_789',
        paykey: '758c519d.04.def456',
        amount: 7500,
        currency: 'USD',
        status: 'paid',
        payment_date: '2024-01-03',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.on('state:change', (state) => {
        expect(state.charge).toEqual(mockCharge);
        expect(state.customer).toBeNull();
        expect(state.paykey).toBeNull();
        done();
      });

      stateManager.setCharge(mockCharge);
    });

    it('should update existing charge state', () => {
      const mockCharge: DemoCharge = {
        id: 'charge_abc',
        paykey: '758c519d.05.ghi789',
        amount: 2500,
        currency: 'USD',
        status: 'pending',
        payment_date: '2024-01-04',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setCharge(mockCharge);

      stateManager.updateCharge({
        status: 'paid',
        completed_at: '2024-01-04T12:00:00Z',
      });

      const state = stateManager.getState();
      expect(state.charge?.status).toBe('paid');
      expect(state.charge?.completed_at).toBe('2024-01-04T12:00:00Z');
      expect(state.charge?.amount).toBe(2500); // Original fields preserved
    });

    it('should emit events when charge is updated', (done) => {
      const mockCharge: DemoCharge = {
        id: 'charge_def',
        paykey: '758c519d.06.jkl012',
        amount: 3000,
        currency: 'USD',
        status: 'scheduled',
        payment_date: '2024-01-05',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setCharge(mockCharge);

      let eventCount = 0;
      stateManager.on('state:charge', () => {
        eventCount++;
      });

      stateManager.on('state:change', () => {
        eventCount++;
        if (eventCount === 2) {
          done();
        }
      });

      stateManager.updateCharge({ status: 'paid' });
    });

    it('should not update charge if charge is null', () => {
      stateManager.updateCharge({ status: 'paid' });

      const state = stateManager.getState();
      expect(state.charge).toBeNull();
    });
  });

  describe('State Reset', () => {
    it('should reset all state to null', () => {
      const mockCustomer: DemoCustomer = {
        id: 'cust_123',
        name: 'John Doe',
        type: 'individual',
        email: 'john@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockPaykey: DemoPaykey = {
        id: 'paykey_123',
        paykey: '758c519d.02.2c16f91',
        customer_id: 'cust_123',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockCharge: DemoCharge = {
        id: 'charge_123',
        paykey: '758c519d.02.2c16f91',
        amount: 5000,
        currency: 'USD',
        status: 'paid',
        payment_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setCustomer(mockCustomer);
      stateManager.setPaykey(mockPaykey);
      stateManager.setCharge(mockCharge);

      stateManager.reset();

      const state = stateManager.getState();
      expect(state.customer).toBeNull();
      expect(state.paykey).toBeNull();
      expect(state.charge).toBeNull();
    });

    it('should emit state:reset event when reset', (done) => {
      stateManager.on('state:reset', () => {
        done();
      });

      stateManager.reset();
    });

    it('should emit state:change event when reset', (done) => {
      stateManager.on('state:change', (state) => {
        expect(state.customer).toBeNull();
        expect(state.paykey).toBeNull();
        expect(state.charge).toBeNull();
        done();
      });

      stateManager.reset();
    });
  });

  describe('Multiple State Updates', () => {
    it('should handle multiple state updates in sequence', () => {
      const mockCustomer: DemoCustomer = {
        id: 'cust_multi',
        name: 'Multi Test',
        type: 'individual',
        email: 'multi@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockPaykey: DemoPaykey = {
        id: 'paykey_multi',
        paykey: '758c519d.07.multi',
        customer_id: 'cust_multi',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockCharge: DemoCharge = {
        id: 'charge_multi',
        paykey: '758c519d.07.multi',
        amount: 1000,
        currency: 'USD',
        status: 'pending',
        payment_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setCustomer(mockCustomer);
      stateManager.setPaykey(mockPaykey);
      stateManager.setCharge(mockCharge);

      const state = stateManager.getState();
      expect(state.customer).toEqual(mockCustomer);
      expect(state.paykey).toEqual(mockPaykey);
      expect(state.charge).toEqual(mockCharge);
    });

    it('should emit correct number of events for multiple updates', () => {
      let changeEventCount = 0;
      let customerEventCount = 0;
      let paykeyEventCount = 0;
      let chargeEventCount = 0;

      stateManager.on('state:change', () => {
        changeEventCount++;
      });

      stateManager.on('state:customer', () => {
        customerEventCount++;
      });

      stateManager.on('state:paykey', () => {
        paykeyEventCount++;
      });

      stateManager.on('state:charge', () => {
        chargeEventCount++;
      });

      const mockCustomer: DemoCustomer = {
        id: 'cust_events',
        name: 'Event Test',
        type: 'individual',
        email: 'events@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockPaykey: DemoPaykey = {
        id: 'paykey_events',
        paykey: '758c519d.08.events',
        customer_id: 'cust_events',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setCustomer(mockCustomer);
      stateManager.setPaykey(mockPaykey);
      stateManager.updateCustomer({ verification_status: 'verified' });

      expect(changeEventCount).toBe(3); // setCustomer, setPaykey, updateCustomer
      expect(customerEventCount).toBe(2); // setCustomer, updateCustomer
      expect(paykeyEventCount).toBe(1); // setPaykey
      expect(chargeEventCount).toBe(0); // No charge operations
    });

    it('should maintain state integrity after partial updates', () => {
      const mockCustomer: DemoCustomer = {
        id: 'cust_integrity',
        name: 'Integrity Test',
        type: 'individual',
        email: 'integrity@example.com',
        verification_status: 'pending',
        risk_score: 50,
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setCustomer(mockCustomer);

      // Update only one field
      stateManager.updateCustomer({ verification_status: 'verified' });

      const state = stateManager.getState();
      expect(state.customer?.verification_status).toBe('verified');
      expect(state.customer?.risk_score).toBe(50); // Original value preserved
      expect(state.customer?.name).toBe('Integrity Test'); // Original value preserved
      expect(state.customer?.email).toBe('integrity@example.com'); // Original value preserved
    });
  });

  describe('Event Emitter Behavior', () => {
    it('should support multiple event listeners', () => {
      let listener1Called = false;
      let listener2Called = false;

      stateManager.on('state:change', () => {
        listener1Called = true;
      });

      stateManager.on('state:change', () => {
        listener2Called = true;
      });

      const mockCustomer: DemoCustomer = {
        id: 'cust_listeners',
        name: 'Listener Test',
        type: 'individual',
        email: 'listener@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setCustomer(mockCustomer);

      expect(listener1Called).toBe(true);
      expect(listener2Called).toBe(true);
    });

    it('should support listener removal', () => {
      let eventCount = 0;

      const listener = (): void => {
        eventCount++;
      };

      stateManager.on('state:change', listener);

      const mockCustomer: DemoCustomer = {
        id: 'cust_removal',
        name: 'Removal Test',
        type: 'individual',
        email: 'removal@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      stateManager.setCustomer(mockCustomer);
      expect(eventCount).toBe(1);

      stateManager.removeListener('state:change', listener);

      stateManager.setCustomer({ ...mockCustomer, name: 'Updated Name' });
      expect(eventCount).toBe(1); // Should not increment after removal
    });
  });
});
