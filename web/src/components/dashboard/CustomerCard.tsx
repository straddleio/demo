import React, { useState } from 'react';
import {
  RetroCard,
  RetroCardHeader,
  RetroCardTitle,
  RetroCardContent,
  RetroBadge,
} from '@/components/ui/retro-components';
import { cn } from '@/components/ui/utils';
import { getRiskIcon, getDecisionIcon, NerdIcons } from '@/lib/nerd-icons';
import { useGeolocation } from '@/lib/useGeolocation';
import { useDemoStore } from '@/lib/state';

interface VerificationModule {
  name: string;
  decision: 'accept' | 'review' | 'reject';
  riskScore: number;
  correlation?: string; // 'Match' | 'Partial' | null
  codes?: string[];
  messages?: Record<string, string>;
}

/**
 * Customer Identity Verification Card
 * Shows: Module-based risk breakdown with traffic light indicators
 *
 * Phase 3A: Placeholder data with intuitive module display
 * Phase 3C: Will connect to real API data from customer review endpoint
 */
export const CustomerCard: React.FC = () => {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const customer = useDemoStore((state) => state.customer);

  if (!customer) {
    return (
      <RetroCard variant="cyan" className="h-full">
        <RetroCardHeader>
          <RetroCardTitle>Customer Identity</RetroCardTitle>
        </RetroCardHeader>
        <RetroCardContent>
          <p className="text-neutral-400 text-sm">No customer created yet. Run /create-customer</p>
        </RetroCardContent>
      </RetroCard>
    );
  }

  // Map verification_status to status (verified, review, rejected, pending)
  const status = (customer.verification_status || 'pending') as 'verified' | 'review' | 'rejected' | 'pending';

  // Extract IP address from device field if available (placeholder for now since API doesn't include device yet)
  const ipAddress = '192.168.1.1'; // TODO: Get from customer.device?.ip_address when available

  // Fetch geolocation from IP address
  const geo = useGeolocation(ipAddress);

  // Verification modules (from identity_details.breakdown)
  const modules: VerificationModule[] = [
    {
      name: 'Email',
      decision: 'accept',
      riskScore: 0.01,
      correlation: 'Match',
      codes: ['I553', 'I556', 'I558', 'I557'],
      messages: {
        'I553': 'Email address is more than 2 years old',
        'I556': 'Email address can be resolved to the individual',
      },
    },
    {
      name: 'Phone',
      decision: 'accept',
      riskScore: 0.01,
      correlation: 'Match',
      codes: ['I602', 'I622', 'I618', 'I621'],
      messages: {
        'I602': 'Phone number is a mobile line',
        'I618': 'Phone number can be resolved to the individual',
      },
    },
    {
      name: 'Address',
      decision: 'accept',
      riskScore: 0.01,
      correlation: 'Match',
      codes: ['I707', 'I710', 'I708', 'I709'],
      messages: {
        'I707': 'Address is residential',
        'I708': 'Address can be resolved to the individual',
      },
    },
    {
      name: 'Fraud',
      decision: 'accept',
      riskScore: 0.152,
      codes: ['I553', 'I121'],
      messages: {
        'I121': 'Social networks match',
      },
    },
    {
      name: 'Reputation',
      decision: 'accept',
      riskScore: 0.189,
      codes: ['R225', 'R223', 'R221'],
      messages: {
        'R221': 'SSN associated with input phone number could not be confirmed',
        'R225': '4 or more different first names have been found to be inquired against the input SSN',
      },
    },
  ];

  // Reputation intelligence data (from identity_details.reputation.insights)
  const reputationInsights = {
    achFraudCount: 1,
    achFraudAmount: 10000,
    cardFraudCount: 1,
    cardFraudAmount: 12355,
    cardDisputeCount: 1,
    cardDisputeAmount: 198734,
  };

  const statusColors = {
    verified: 'primary',
    review: 'gold',
    rejected: 'accent',
    pending: 'secondary',
  } as const;

  const getRiskColor = (score: number) => {
    if (score < 0.1) return 'text-primary'; // Green - low risk
    if (score < 0.5) return 'text-gold'; // Yellow - medium risk
    return 'text-accent'; // Red - high risk
  };

  const getModuleDecisionIcon = (decision: 'accept' | 'review' | 'reject') => {
    if (decision === 'accept') return getDecisionIcon('verified');
    if (decision === 'review') return getDecisionIcon('review');
    return getDecisionIcon('rejected');
  };

  const toggleModule = (moduleName: string) => {
    setExpandedModule(expandedModule === moduleName ? null : moduleName);
  };

  return (
    <RetroCard variant="cyan" className="h-full">
      <RetroCardHeader>
        <div className="flex items-start justify-between gap-2">
          <RetroCardTitle className="flex-shrink">Customer Identity</RetroCardTitle>
          <RetroBadge variant={statusColors[status]}>
            {status.toUpperCase()}
          </RetroBadge>
        </div>
      </RetroCardHeader>
      <RetroCardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <div>
            <p className="text-xs text-neutral-400 font-body mb-1">Name</p>
            <p className="text-sm text-neutral-100 font-body">{customer.name}</p>
          </div>

          {/* Live Geolocation */}
          <div className="pt-2 border-t border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-primary animate-pulse">{NerdIcons.globe}</span>
              <p className="text-xs text-neutral-400 font-body">Live Geolocation</p>
            </div>
            {!geo.loading && !geo.error && geo.city && (
              <p className="text-sm text-primary font-body font-bold">
                {geo.city}, {geo.region} ({geo.countryCode})
              </p>
            )}
            {geo.loading && (
              <p className="text-xs text-neutral-500 font-body">Detecting location...</p>
            )}
            {geo.error && (
              <p className="text-xs text-neutral-500 font-body">{geo.error}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <p className="text-xs text-neutral-400 font-body mb-1">Email</p>
              <p className="text-xs text-neutral-100 font-body truncate">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-body mb-1">Phone</p>
              <p className="text-xs text-neutral-100 font-body">{customer.phone}</p>
            </div>
          </div>
        </div>

        {/* Verification Modules */}
        <div className="pt-3 border-t border-primary/20">
          <p className="text-xs text-neutral-400 font-body mb-3">Identity Verification</p>
          <div className="space-y-2">
            {modules.map((module) => (
              <div key={module.name} className="border border-primary/20 rounded-pixel bg-background-dark/50">
                {/* Module Header - Clickable */}
                <button
                  onClick={() => module.codes && toggleModule(module.name)}
                  className={cn(
                    'w-full px-3 py-2 flex items-center justify-between text-left transition-colors',
                    module.codes && 'hover:bg-primary/5 cursor-pointer'
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={cn('text-sm', getRiskColor(module.riskScore))}>
                      {getRiskIcon(module.riskScore)}
                    </span>
                    <span className="text-xs font-body text-neutral-200 flex-shrink-0">{module.name}</span>
                    {module.correlation && (
                      <span className="text-xs text-primary font-body">• {module.correlation}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={cn('text-xs font-pixel', getRiskColor(module.riskScore))}>
                      {module.riskScore.toFixed(2)}
                    </span>
                    <span className={cn(
                      'text-sm',
                      module.decision === 'accept' ? 'text-primary' :
                      module.decision === 'review' ? 'text-gold' : 'text-accent'
                    )}>
                      {getModuleDecisionIcon(module.decision)}
                    </span>
                    {module.codes && (
                      <span className="text-xs text-neutral-500">
                        {expandedModule === module.name ? '▼' : '▶'}
                      </span>
                    )}
                  </div>
                </button>

                {/* Expanded R-Codes (only show risk codes that start with R) */}
                {expandedModule === module.name && module.codes && module.messages && (
                  <div className="px-3 pb-2 border-t border-primary/10">
                    <div className="pt-2 space-y-1.5">
                      {module.codes
                        .filter(code => code.startsWith('R')) // Only show R-codes (risk codes)
                        .map((code) => (
                          <div key={code} className="flex gap-2">
                            <span className="text-xs text-accent font-mono flex-shrink-0">{code}</span>
                            <span className="text-xs text-neutral-400 font-body">
                              {module.messages![code] || 'Risk signal detected'}
                            </span>
                          </div>
                        ))}
                      {module.codes.filter(code => code.startsWith('R')).length === 0 && (
                        <p className="text-xs text-neutral-500 font-body">No risk signals</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Network Intelligence (Reputation) */}
        <div className="pt-3 border-t border-primary/20">
          <p className="text-xs text-neutral-400 font-body mb-3">Network Intelligence</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-neutral-500 font-body mb-1">ACH Fraud</p>
              <p className="text-sm font-pixel text-accent">{reputationInsights.achFraudCount}</p>
              <p className="text-xs text-neutral-600 font-body">${(reputationInsights.achFraudAmount / 100).toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500 font-body mb-1">Card Fraud</p>
              <p className="text-sm font-pixel text-accent">{reputationInsights.cardFraudCount}</p>
              <p className="text-xs text-neutral-600 font-body">${(reputationInsights.cardFraudAmount / 100).toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500 font-body mb-1">Disputes</p>
              <p className="text-sm font-pixel text-gold">{reputationInsights.cardDisputeCount}</p>
              <p className="text-xs text-neutral-600 font-body">${(reputationInsights.cardDisputeAmount / 100).toFixed(0)}</p>
            </div>
          </div>
        </div>
      </RetroCardContent>
    </RetroCard>
  );
};
