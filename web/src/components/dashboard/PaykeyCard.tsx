import React from 'react';
import {
  RetroCard,
  RetroCardHeader,
  RetroCardTitle,
  RetroCardContent,
  RetroBadge,
} from '@/components/ui/retro-components';
import { NerdIcons } from '@/lib/nerd-icons';
import { useDemoStore } from '@/lib/state';

/**
 * Paykey (Bank Account) Ownership Card
 * Shows: Source (Plaid/Bank), WALDO name match, ownership signals, balance
 *
 * Phase 3A: Placeholder data
 * Phase 3C: Will connect to real API data with logo.dev integration
 * Future: WALDO pixel sprite animation
 */
export const PaykeyCard: React.FC = () => {
  const paykey = useDemoStore((state) => state.paykey);
  const customer = useDemoStore((state) => state.customer);

  if (!paykey) {
    return (
      <RetroCard variant="blue" className="h-full">
        <RetroCardHeader>
          <RetroCardTitle>Paykey</RetroCardTitle>
        </RetroCardHeader>
        <RetroCardContent>
          <p className="text-neutral-400 text-sm">No bank account linked. Run /create-paykey</p>
        </RetroCardContent>
      </RetroCard>
    );
  }

  // Extract data from paykey with fallbacks
  const customerName = customer?.name || 'Unknown';
  const source: 'plaid' | 'bank_account' = 'bank_account'; // TODO: Track in API response
  const waldoConfidence = paykey.ownership?.waldo_confidence || 'unknown';
  const balance = paykey.balance?.available ? paykey.balance.available / 100 : 0;
  const ownershipSignals = ['Name match', 'Balance verified', 'No fraud flags']; // TODO: Extract from API

  const statusColors = {
    active: 'primary',
    inactive: 'secondary',
    rejected: 'accent',
    pending: 'gold',
  } as const;

  const statusColor = statusColors[paykey.status as keyof typeof statusColors] || 'secondary';

  const waldoColors: Record<string, string> = {
    exact: 'text-primary',
    high: 'text-secondary',
    medium: 'text-gold',
    low: 'text-accent',
  };

  const waldoColor = waldoColors[waldoConfidence] || 'text-neutral-400';

  const sourceLabels = {
    plaid: 'Plaid',
    bank_account: 'Direct',
  };

  return (
    <RetroCard variant="blue" className="h-full">
      <RetroCardHeader>
        <div className="flex items-start justify-between gap-2">
          <RetroCardTitle className="flex-shrink">Paykey</RetroCardTitle>
          <RetroBadge variant={statusColor}>
            {paykey.status.toUpperCase()}
          </RetroBadge>
        </div>
      </RetroCardHeader>
      <RetroCardContent className="space-y-4">
        {/* Bank Info with Source */}
        <div className="flex items-start gap-3">
          {/* Logo Placeholder - Phase 3C will use logo.dev */}
          <div className="w-14 h-14 flex-shrink-0 border-2 border-secondary/40 rounded-pixel flex items-center justify-center bg-background-dark">
            <span className="text-secondary font-pixel text-xs">$</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-100 font-body font-bold truncate">{paykey.institution || 'Unknown Bank'}</p>
            <p className="text-xs text-neutral-400 font-body">
              {paykey.account_type ? paykey.account_type.charAt(0).toUpperCase() + paykey.account_type.slice(1) : 'Account'} ••••{paykey.last4 || '0000'}
            </p>
            <p className="text-xs text-secondary font-body mt-0.5">
              via {sourceLabels[source]}
            </p>
          </div>
          {/* WALDO in right column */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-neutral-400 font-body mb-1">WALDO</p>
            <p className={`text-xs font-pixel ${waldoColor}`}>
              {waldoConfidence.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Customer Name */}
        <div className="pt-3 border-t border-secondary/20">
          <p className="text-xs text-neutral-400 font-body mb-1">Account Owner</p>
          <p className="text-sm text-neutral-100 font-body font-bold">
            {customerName}
          </p>
        </div>

        {/* Balance & Token */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral-400 font-body mb-1">Balance</p>
            <p className="text-sm text-neutral-100 font-body font-bold">
              ${balance.toFixed(2)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-neutral-400 font-body mb-1">Paykey</p>
            <p className="text-xs text-neutral-100 font-mono truncate">
              {paykey.paykey || 'N/A'}
            </p>
          </div>
        </div>

        {/* Ownership Signals */}
        <div className="pt-3 border-t border-secondary/20">
          <p className="text-xs text-neutral-400 font-body mb-2">Ownership Signals</p>
          <div className="space-y-1.5">
            {ownershipSignals.map((signal, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-primary text-xs flex-shrink-0">{NerdIcons.checkmark}</span>
                <span className="text-xs text-neutral-300 font-body">{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </RetroCardContent>
    </RetroCard>
  );
};
