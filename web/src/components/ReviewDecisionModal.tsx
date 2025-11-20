import React, { useState } from 'react';
import { cn } from './ui/utils';
import { triggerApproveAnimation, triggerRejectAnimation } from '@/lib/animations';
import { playApproveSound, playRejectSound } from '@/lib/sounds';

type CustomerReviewData = {
  type: 'customer';
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  verificationSummary?: Record<string, string>;
  legal_business_name?: string;
  website?: string;
  ein?: string;
  codes?: string[];
  kyc?: {
    decision: string;
    codes?: string[];
    validations?: Record<string, boolean>;
  };
  watchlist?: {
    decision: string;
    codes?: string[];
    matches?: Array<{
      correlation: string;
      list_name: string;
      match_fields: string[];
      urls: string[];
    }>;
  };
  networkIntelligence?: {
    decision: string;
    codes?: string[];
    insights?: {
      ach_fraud_transactions_count?: number;
      ach_fraud_transactions_total_amount?: number;
      ach_returned_transactions_count?: number;
      ach_returned_transactions_total_amount?: number;
      card_fraud_transactions_count?: number;
      card_fraud_transactions_total_amount?: number;
      card_disputed_transactions_count?: number;
      card_disputed_transactions_total_amount?: number;
      accounts_count?: number;
      accounts_active_count?: number;
      accounts_fraud_count?: number;
      applications_count?: number;
    };
  };
};

type PaykeyReviewData = {
  type: 'paykey';
  id: string;
  customerName: string;
  institution: string;
  balance: number;
  status: string;
  verificationSummary?: Record<string, string>;
};

type ReviewData = CustomerReviewData | PaykeyReviewData;

interface ReviewDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecision: (decision: 'verified' | 'rejected' | 'approved') => Promise<void>;
  data: ReviewData;
}

export const ReviewDecisionModal: React.FC<ReviewDecisionModalProps> = ({
  isOpen,
  onClose,
  onDecision,
  data,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleApprove = async (): Promise<void> => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    // Trigger animation and sound
    const cleanup = triggerApproveAnimation();
    void playApproveSound();

    // Call decision handler
    const decision = data.type === 'customer' ? 'verified' : 'approved';
    await onDecision(decision);

    // Close modal after animation
    setTimeout(() => {
      cleanup();
      onClose();
      setIsProcessing(false);
    }, 1000);
  };

  const handleReject = async (): Promise<void> => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    // Trigger animation and sound
    const cleanup = triggerRejectAnimation();
    void playRejectSound();

    // Call decision handler
    await onDecision('rejected');

    // Close modal after animation
    setTimeout(() => {
      cleanup();
      onClose();
      setIsProcessing(false);
    }, 1500);
  };

  // Helper to determine code color
  const getCodeColor = (code: string): string => {
    if (code.startsWith('BI')) {
      return 'text-green-500'; // Insight/Verified
    }
    if (code.startsWith('BR')) {
      return 'text-accent-red'; // Risk
    }
    if (code.startsWith('BV')) {
      return 'text-gold'; // Verification/Standing
    }
    return 'text-neutral-400';
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg mx-4">
        {/* Modal Card */}
        <div className="border-4 border-primary bg-background rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.5)]">
          {/* Header */}
          <div className="border-b-4 border-primary bg-primary/10 px-6 py-4">
            <h2 className="text-2xl font-pixel text-primary text-center">
              ⚔️ COMPLIANCE CHALLENGE ⚔️
            </h2>
          </div>

          {/* Content - Scrollable with max height */}
          <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-background-dark">
            {data.type === 'customer' ? (
              <>
                <div className="text-center mb-3">
                  <p className="text-xl font-body text-neutral-100">{data.name}</p>
                  <p className="text-sm text-neutral-400">{data.email}</p>
                  <p className="text-sm text-neutral-400">{data.phone}</p>
                  {data.legal_business_name && (
                    <p className="text-xs text-primary mt-1 font-pixel">
                      BUSINESS: {data.legal_business_name}
                    </p>
                  )}
                  {data.website && <p className="text-xs text-neutral-500">{data.website}</p>}
                  {data.ein && <p className="text-xs text-neutral-500">EIN: {data.ein}</p>}
                </div>

                {data.verificationSummary && (
                  <div className="border border-primary/20 rounded-pixel bg-background-dark/50 p-4">
                    <p className="text-xs text-neutral-400 font-body mb-2">Verification Summary</p>
                    <div className="space-y-1">
                      {Object.entries(data.verificationSummary).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-neutral-300 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span
                            className={cn(
                              'font-pixel',
                              value === 'accept'
                                ? 'text-green-500'
                                : value === 'review'
                                  ? 'text-gold'
                                  : 'text-accent'
                            )}
                          >
                            {value.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Identity Codes Display */}
                {data.codes && data.codes.length > 0 && (
                  <div className="border border-primary/20 rounded-pixel bg-background-dark/50 p-4 mt-2">
                    <p className="text-xs text-neutral-400 font-body mb-2">
                      Business Identity Codes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.codes.map((code) => (
                        <span
                          key={code}
                          className={cn(
                            'text-xs font-pixel px-2 py-1 bg-background rounded border border-white/10',
                            getCodeColor(code)
                          )}
                          title={code} // Tooltip could be added here if we had descriptions
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* KYC Validation */}
                {data.kyc && data.kyc.validations && (
                  <div className="border border-primary/20 rounded-pixel bg-background-dark/50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-neutral-400 font-body">KYC Validation</p>
                      <span
                        className={cn(
                          'text-xs font-pixel px-2 py-0.5 rounded',
                          data.kyc.decision === 'accept'
                            ? 'bg-green-500/20 text-green-500'
                            : data.kyc.decision === 'review'
                              ? 'bg-gold/20 text-gold'
                              : 'bg-accent-red/20 text-accent-red'
                        )}
                      >
                        {data.kyc.decision.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(data.kyc.validations).map(([field, isValid]) => (
                        <div key={field} className="flex items-center gap-1">
                          <span className={isValid ? 'text-green-500' : 'text-accent-red'}>
                            {isValid ? '✓' : '✗'}
                          </span>
                          <span className="text-neutral-300 capitalize">
                            {field.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                    {data.kyc.codes && data.kyc.codes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {data.kyc.codes.map((code) => (
                          <span
                            key={code}
                            className="text-xs font-pixel px-1.5 py-0.5 bg-background rounded border border-white/10 text-neutral-400"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Watchlist Matches */}
                {data.watchlist && data.watchlist.matches && data.watchlist.matches.length > 0 && (
                  <div className="border border-primary/20 rounded-pixel bg-background-dark/50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-neutral-400 font-body">Watchlist Matches</p>
                      <span
                        className={cn(
                          'text-xs font-pixel px-2 py-0.5 rounded',
                          data.watchlist.decision === 'accept'
                            ? 'bg-green-500/20 text-green-500'
                            : data.watchlist.decision === 'review'
                              ? 'bg-gold/20 text-gold'
                              : 'bg-accent-red/20 text-accent-red'
                        )}
                      >
                        {data.watchlist.decision.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {data.watchlist.matches.map((match, idx) => (
                        <div key={idx} className="text-xs bg-background/50 p-2 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-neutral-100 font-semibold">{match.list_name}</span>
                            <span className="text-gold text-[10px] font-pixel">
                              {match.correlation}
                            </span>
                          </div>
                          <div className="text-neutral-400 text-[10px]">
                            Fields: {match.match_fields.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reputation */}
                {data.networkIntelligence && data.networkIntelligence.insights && (
                  <div className="border border-primary/20 rounded-pixel bg-background-dark/50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-neutral-400 font-body">Reputation</p>
                      <span
                        className={cn(
                          'text-xs font-pixel px-2 py-0.5 rounded',
                          data.networkIntelligence.decision === 'accept'
                            ? 'bg-green-500/20 text-green-500'
                            : data.networkIntelligence.decision === 'review'
                              ? 'bg-gold/20 text-gold'
                              : 'bg-accent-red/20 text-accent-red'
                        )}
                      >
                        {data.networkIntelligence.decision.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {data.networkIntelligence.insights.ach_fraud_transactions_count !== undefined && (
                        <div>
                          <span className="text-neutral-500">ACH Fraud:</span>
                          <span className="ml-1 text-accent-red font-semibold">
                            {data.networkIntelligence.insights.ach_fraud_transactions_count}
                          </span>
                        </div>
                      )}
                      {data.networkIntelligence.insights.ach_returned_transactions_count !== undefined && (
                        <div>
                          <span className="text-neutral-500">ACH Returns:</span>
                          <span className="ml-1 text-gold font-semibold">
                            {data.networkIntelligence.insights.ach_returned_transactions_count}
                          </span>
                        </div>
                      )}
                      {data.networkIntelligence.insights.card_fraud_transactions_count !== undefined && (
                        <div>
                          <span className="text-neutral-500">Card Fraud:</span>
                          <span className="ml-1 text-accent-red font-semibold">
                            {data.networkIntelligence.insights.card_fraud_transactions_count}
                          </span>
                        </div>
                      )}
                      {data.networkIntelligence.insights.accounts_fraud_count !== undefined && (
                        <div>
                          <span className="text-neutral-500">Fraud Accounts:</span>
                          <span className="ml-1 text-accent-red font-semibold">
                            {data.networkIntelligence.insights.accounts_fraud_count}
                          </span>
                        </div>
                      )}
                      {data.networkIntelligence.insights.accounts_count !== undefined && (
                        <div>
                          <span className="text-neutral-500">Total Accounts:</span>
                          <span className="ml-1 text-neutral-100 font-semibold">
                            {data.networkIntelligence.insights.accounts_count}
                          </span>
                        </div>
                      )}
                      {data.networkIntelligence.insights.accounts_active_count !== undefined && (
                        <div>
                          <span className="text-neutral-500">Active Accounts:</span>
                          <span className="ml-1 text-green-500 font-semibold">
                            {data.networkIntelligence.insights.accounts_active_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <p className="text-xl font-body text-neutral-100">{data.institution}</p>
                  <p className="text-sm text-neutral-400">{data.customerName}</p>
                  <p className="text-lg text-primary font-bold mt-2">${data.balance.toFixed(2)}</p>
                </div>

                {data.verificationSummary && (
                  <div className="border border-primary/20 rounded-pixel bg-background-dark/50 p-4">
                    <p className="text-xs text-neutral-400 font-body mb-2">Verification Summary</p>
                    <div className="space-y-1">
                      {Object.entries(data.verificationSummary).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-neutral-300 capitalize">{key}:</span>
                          <span
                            className={cn(
                              'font-pixel',
                              value === 'accept'
                                ? 'text-green-500'
                                : value === 'review'
                                  ? 'text-gold'
                                  : 'text-accent'
                            )}
                          >
                            {value.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="pt-3 border-t border-primary/20">
              <p className="text-center text-sm text-neutral-400 font-body mb-3">
                RENDER YOUR VERDICT
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => void handleApprove()}
                  disabled={isProcessing}
                  className={cn(
                    'flex-1 px-6 py-3 font-pixel text-lg',
                    'border-2 border-green-500 bg-green-500/10 text-green-500',
                    'hover:bg-green-500/20 hover:border-green-400',
                    'rounded-pixel transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  APPROVE
                </button>

                <button
                  onClick={() => void handleReject()}
                  disabled={isProcessing}
                  className={cn(
                    'flex-1 px-6 py-3 font-pixel text-lg',
                    'border-2 border-accent bg-accent/10 text-accent',
                    'hover:bg-accent/20 hover:border-accent',
                    'rounded-pixel transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  REJECT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
