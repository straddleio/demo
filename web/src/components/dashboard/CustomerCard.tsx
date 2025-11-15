import React, { useState, useEffect } from 'react';
import {
  RetroCard,
  RetroCardHeader,
  RetroCardTitle,
  RetroCardContent,
  RetroBadge,
} from '@/components/ui/retro-components';
import { cn } from '@/components/ui/utils';
import { NerdIcons } from '@/lib/nerd-icons';
import { useGeolocation } from '@/lib/useGeolocation';
import { useDemoStore } from '@/lib/state';
import { KYCValidationCard } from './KYCValidationCard';
import { AddressWatchlistCard } from './AddressWatchlistCard';

interface VerificationModule {
  name: string;
  decision: 'accept' | 'review' | 'reject';
  riskScore: number;
  correlation?: string; // 'Match' | 'Partial' | null
  correlationScore?: number;
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

  // Extract IP address from device field if available (placeholder for now since API doesn't include device yet)
  // IMPORTANT: Must be before early return to satisfy Rules of Hooks
  const ipAddress = customer ? '192.168.1.1' : null; // TODO: Get from customer.device?.ip_address when available

  // Fetch geolocation from IP address
  // IMPORTANT: Hook must be called unconditionally (before early return)
  const geo = useGeolocation(ipAddress);

  // Sound cue placeholder for review status
  useEffect(() => {
    if (customer?.verification_status === 'review') {
      // TODO: Play sound alert when customer status is "review"
      // Example: new Audio('/sounds/review-alert.mp3').play();
      console.log('🔔 Customer in REVIEW status - sound cue would play here');
    }
  }, [customer?.verification_status]);

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

  // Build verification modules from real review data if available
  const modules: VerificationModule[] = [];

  if (customer.review?.breakdown) {
    const { breakdown, messages } = customer.review;

    // Email module
    if (breakdown.email) {
      modules.push({
        name: 'Email',
        decision: breakdown.email.decision as any,
        riskScore: breakdown.email.risk_score || 0,
        correlation: breakdown.email.correlation === 'high_confidence' ? 'Match' :
                     breakdown.email.correlation === 'medium_confidence' ? 'Partial' : undefined,
        correlationScore: breakdown.email.correlation_score,
        codes: breakdown.email.codes,
        messages: messages || {},
      });
    }

    // Phone module
    if (breakdown.phone) {
      modules.push({
        name: 'Phone',
        decision: breakdown.phone.decision as any,
        riskScore: breakdown.phone.risk_score || 0,
        correlation: breakdown.phone.correlation === 'high_confidence' ? 'Match' :
                     breakdown.phone.correlation === 'medium_confidence' ? 'Partial' : undefined,
        correlationScore: breakdown.phone.correlation_score,
        codes: breakdown.phone.codes,
        messages: messages || {},
      });
    }

    // Fraud module
    if (breakdown.fraud) {
      modules.push({
        name: 'Fraud',
        decision: breakdown.fraud.decision as any,
        riskScore: breakdown.fraud.risk_score || 0,
        codes: breakdown.fraud.codes,
        messages: messages || {},
      });
    }

    // Note: Synthetic module intentionally excluded from display
  }

  // Reputation module (from reputation field)
  if (customer.review?.reputation) {
    modules.push({
      name: 'Reputation',
      decision: customer.review.reputation.decision as any,
      riskScore: customer.review.reputation.risk_score || 0,
      codes: customer.review.reputation.codes,
      messages: customer.review.messages || {},
    });
  }

  // Reputation intelligence data (from identity_details.reputation.insights)
  const insights = customer.review?.reputation?.insights;
  const reputationInsights = {
    achFraudCount: insights?.ach_fraud_transactions_count || 0,
    achFraudAmount: insights?.ach_fraud_transactions_total_amount || 0,
    achReturnCount: insights?.ach_returned_transactions_count || 0,
    achReturnAmount: insights?.ach_returned_transactions_total_amount || 0,
    cardFraudCount: insights?.card_fraud_transactions_count || 0,
    cardFraudAmount: insights?.card_fraud_transactions_total_amount || 0,
    cardDisputeCount: insights?.card_disputed_transactions_count || 0,
    cardDisputeAmount: insights?.card_disputed_transactions_total_amount || 0,
  };

  const statusColors = {
    verified: 'primary',
    review: 'gold',
    rejected: 'accent',
    pending: 'secondary',
  } as const;

  const getRiskColor = (score: number) => {
    if (score < 0.75) return 'text-green-500'; // Green - low risk
    if (score < 0.90) return 'text-gold'; // Yellow - medium risk
    return 'text-accent'; // Red - high risk
  };

  const getDecisionLabel = (decision: 'accept' | 'review' | 'reject') => {
    if (decision === 'accept') return 'PASS';
    if (decision === 'review') return 'REVIEW';
    return 'REJECT';
  };

  const toggleModule = (moduleName: string) => {
    setExpandedModule(expandedModule === moduleName ? null : moduleName);
  };

  return (
    <RetroCard variant="cyan" className="h-full">
      <RetroCardHeader>
        <div className="flex items-start justify-between gap-2">
          <RetroCardTitle className="flex-shrink">Customer Identity</RetroCardTitle>
          {status === 'review' ? (
            <button
              onClick={() => {
                // TODO: Add review action handler (e.g., open review modal)
                console.log('Review button clicked - open review workflow');
              }}
              className={cn(
                'px-2 py-1 text-xs font-pixel uppercase transition-all',
                'bg-gold/20 text-gold border border-gold/40 rounded-pixel',
                'hover:bg-gold/30 hover:border-gold/60',
                'animate-pulse',
                'cursor-pointer'
              )}
            >
              {status.toUpperCase()}
            </button>
          ) : (
            <RetroBadge variant={statusColors[status]}>
              {status.toUpperCase()}
            </RetroBadge>
          )}
        </div>
      </RetroCardHeader>
      <RetroCardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <div>
            <p className="text-xs text-neutral-400 font-body mb-1">Name</p>
            <p className="text-sm text-neutral-100 font-body">{customer.name}</p>
          </div>

          {/* Address - Enhanced */}
          {customer.address && (
            <div className="pt-2 border-t border-primary/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-primary">{NerdIcons.mapPin}</span>
                <p className="text-xs text-neutral-400 font-body">Address</p>
              </div>
              <div className="text-xs text-neutral-100 font-body ml-5 space-y-0.5">
                <p>{customer.address.address1}</p>
                {customer.address.address2 && <p>{customer.address.address2}</p>}
                <p>{customer.address.city}, {customer.address.state} {customer.address.zip}</p>
              </div>
            </div>
          )}

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

          {/* Compliance Profile - Enhanced */}
          {customer.compliance_profile && (
            <div className="pt-2 border-t border-primary/10">
              <p className="text-xs text-neutral-400 font-body mb-2">Compliance Information</p>
              <div className="space-y-2">
                {customer.compliance_profile.ssn && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary">{NerdIcons.shield}</span>
                    <span className="text-xs text-neutral-100 font-body">
                      SSN: <span className="font-mono">***-**-{customer.compliance_profile.ssn.slice(-4)}</span>
                    </span>
                  </div>
                )}
                {customer.compliance_profile.dob && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary">{NerdIcons.calendar}</span>
                    <span className="text-xs text-neutral-100 font-body">
                      DOB: <span className="font-mono">{customer.compliance_profile.dob}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
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
                    <span className="text-xs font-body text-neutral-200 flex-shrink-0">{module.name}</span>
                    {module.correlation && (
                      <span className="text-xs text-primary font-body">• {module.correlation}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={cn(
                      'text-xs font-pixel',
                      module.decision === 'accept' ? 'text-green-500' :
                      module.decision === 'review' ? 'text-gold' : 'text-accent'
                    )}>
                      {getDecisionLabel(module.decision)}
                    </span>
                    {module.codes && (
                      <span className="text-xs text-neutral-500">
                        {expandedModule === module.name ? '▼' : '▶'}
                      </span>
                    )}
                  </div>
                </button>

                {/* Expanded Section - Scores and R-Codes */}
                {expandedModule === module.name && (
                  <div className="border-t border-primary/10">
                    {/* Risk Score */}
                    <div className="px-3 py-2 bg-background-dark/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500 font-body">Risk Score</span>
                        <span className={cn('text-sm font-pixel', getRiskColor(module.riskScore))}>
                          {module.riskScore.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    {/* R-Codes (only show risk codes that start with R) */}
                    {module.codes && module.messages && (
                      <div className="px-3 pb-2">
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
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KYC Validation - New Component */}
        {customer.review?.kyc && (
          <KYCValidationCard customer={customer} />
        )}

        {/* Address Watchlist - New Component */}
        {customer.review?.watch_list && (
          <AddressWatchlistCard customer={customer} />
        )}

        {/* Network Intelligence (Reputation) */}
        <div className="pt-3 border-t border-primary/20">
          <p className="text-xs text-neutral-400 font-body mb-3">Network Intelligence</p>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-xs text-neutral-500 font-body mb-1">ACH Fraud</p>
              <p className="text-sm font-pixel text-accent">{reputationInsights.achFraudCount}</p>
              <p className="text-xs text-neutral-600 font-body">${(reputationInsights.achFraudAmount / 100).toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500 font-body mb-1">ACH Returns</p>
              <p className="text-sm font-pixel text-gold">{reputationInsights.achReturnCount}</p>
              <p className="text-xs text-neutral-600 font-body">${(reputationInsights.achReturnAmount / 100).toFixed(0)}</p>
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
