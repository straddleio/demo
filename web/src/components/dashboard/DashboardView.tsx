import React from 'react';
import { useDemoStore } from '@/lib/state';
import { CustomerCard } from './CustomerCard';
import { PaykeyCard } from './PaykeyCard';
import { ChargeCard } from './ChargeCard';
import { PizzaTracker } from './PizzaTracker';
import { CircularChargeTracker } from './CircularChargeTracker';

/**
 * Main Dashboard View with Progressive Disclosure
 *
 * Layout adapts based on payment flow state:
 * 1. Empty: All cards visible but empty (maintains existing UX)
 * 2. Customer Only: CustomerCard full-width
 * 3. Customer + Paykey: 60/40 split
 * 4. Customer + Charge: 50/50 split (paykey embedded in charge)
 * 5. Charge Scheduled: Compact customer + Featured circular tracker
 */
export const DashboardView: React.FC = () => {
  const displayState = useDemoStore((state) => state.getCardDisplayState());

  return (
    <div className="p-6 space-y-6" data-layout={displayState.layout}>
      {/* Layout: Empty - show all cards empty */}
      {displayState.layout === 'empty' && (
        <>
          <div className="animate-pixel-fade-in">
            <CustomerCard />
          </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pixel-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <PaykeyCard />
            <ChargeCard />
          </div>
          <div className="animate-pixel-fade-in" style={{ animationDelay: '0.2s' }}>
            <PizzaTracker />
          </div>
        </>
      )}

      {/* Layout: Customer Only - full width customer */}
      {displayState.layout === 'customer-only' && (
        <>
          <div className="animate-pixel-fade-in">
            <CustomerCard />
          </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pixel-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <PaykeyCard />
            <ChargeCard />
          </div>
          <div className="animate-pixel-fade-in" style={{ animationDelay: '0.2s' }}>
            <PizzaTracker />
          </div>
        </>
      )}

      {/* Layout: Customer + Paykey - 50/50 split */}
      {displayState.layout === 'customer-paykey' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pixel-fade-in">
            <CustomerCard />
            <PaykeyCard />
          </div>
          <div className="animate-pixel-fade-in" style={{ animationDelay: '0.1s' }}>
            <ChargeCard />
          </div>
          <div className="animate-pixel-fade-in" style={{ animationDelay: '0.2s' }}>
            <PizzaTracker />
          </div>
        </>
      )}

      {/* Layout: Customer + Charge - 50/50 split, paykey embedded */}
      {displayState.layout === 'customer-charge' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pixel-fade-in">
            <CustomerCard />
            <ChargeCard />
          </div>
          <div className="animate-pixel-fade-in" style={{ animationDelay: '0.1s' }}>
            <PizzaTracker />
          </div>
        </>
      )}

      {/* Layout: Tracker Featured - compact customer + circular tracker */}
      {displayState.layout === 'tracker-featured' && (
        <>
          <div className="animate-pixel-fade-in">
            <CustomerCard />
          </div>
          <div
            className="animate-pixel-fade-in"
            style={{ animationDelay: '0.1s' }}
            data-component="circular-tracker"
          >
            <CircularChargeTracker />
          </div>
        </>
      )}
    </div>
  );
};
