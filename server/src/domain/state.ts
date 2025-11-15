/**
 * In-memory demo state management
 */

import { DemoCustomer, DemoPaykey, DemoCharge } from './types.js';
import { EventEmitter } from 'events';

export interface DemoState {
  customer: DemoCustomer | null;
  paykey: DemoPaykey | null;
  charge: DemoCharge | null;
}

class StateManager extends EventEmitter {
  private state: DemoState = {
    customer: null,
    paykey: null,
    charge: null,
  };

  /**
   * Get current demo state
   */
  getState(): DemoState {
    return { ...this.state };
  }

  /**
   * Set customer
   */
  setCustomer(customer: DemoCustomer): void {
    this.state.customer = customer;
    this.emit('state:customer', customer);
    this.emit('state:change', this.getState());
  }

  /**
   * Update customer (for review updates)
   */
  updateCustomer(updates: Partial<DemoCustomer>): void {
    if (this.state.customer) {
      this.state.customer = { ...this.state.customer, ...updates };
      this.emit('state:customer', this.state.customer);
      this.emit('state:change', this.getState());
    }
  }

  /**
   * Set paykey
   */
  setPaykey(paykey: DemoPaykey): void {
    this.state.paykey = paykey;
    this.emit('state:paykey', paykey);
    this.emit('state:change', this.getState());
  }

  /**
   * Set charge
   */
  setCharge(charge: DemoCharge): void {
    this.state.charge = charge;
    this.emit('state:charge', charge);
    this.emit('state:change', this.getState());
  }

  /**
   * Update charge (for status changes)
   */
  updateCharge(updates: Partial<DemoCharge>): void {
    if (this.state.charge) {
      this.state.charge = { ...this.state.charge, ...updates };
      this.emit('state:charge', this.state.charge);
      this.emit('state:change', this.getState());
    }
  }

  /**
   * Reset demo state
   */
  reset(): void {
    this.state = {
      customer: null,
      paykey: null,
      charge: null,
    };
    this.emit('state:reset');
    this.emit('state:change', this.getState());
  }
}

export const stateManager = new StateManager();
