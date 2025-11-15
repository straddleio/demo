import React, { useState } from 'react';
import { cn } from '@/components/ui/utils';

interface APILogEntry {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  status: number;
  timing: number; // milliseconds
  requestId?: string;
  correlationId?: string;
  idempotencyKey?: string;
  response?: any;
}

/**
 * API Request Log with expandable entries
 * Shows smart defaults: method, path, status, timing, key headers
 * Click to expand for full response JSON
 *
 * Phase 3A: Static placeholder data
 * Phase 3B: Will populate with real API calls
 */
export const APILog: React.FC = () => {
  // Placeholder data for demo
  const [entries] = useState<APILogEntry[]>([
    {
      id: '1',
      method: 'POST',
      path: '/api/customers',
      status: 201,
      timing: 245,
      requestId: 'req_abc123',
      idempotencyKey: 'idem_xyz789',
      response: { id: 'cust_xxx', verification_status: 'verified', risk_score: 0.12 },
    },
  ]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-primary';
    if (status >= 400 && status < 500) return 'text-accent';
    if (status >= 500) return 'text-accent';
    return 'text-neutral-400';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-secondary';
      case 'POST':
        return 'text-gold';
      case 'PATCH':
        return 'text-primary';
      case 'DELETE':
        return 'text-accent';
      default:
        return 'text-neutral-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background-dark p-4 relative">
      {/* Background Logo - blended into dark background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/nerdcon-logo.png)',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          opacity: 0.03,
          mixBlendMode: 'lighten',
        }}
      />

      {/* Header */}
      <div className="mb-3 pb-2 border-b border-secondary/30 relative z-10">
        <h3 className="text-xs font-pixel text-secondary leading-relaxed">
          API REQUEST LOG
        </h3>
        <p className="text-xs text-neutral-400 font-body mt-1">
          Real Straddle sandbox calls
        </p>
      </div>

      {/* Log Entries */}
      <div className="flex-1 overflow-y-auto scrollbar-retro space-y-3 relative z-10">
        {entries.length === 0 ? (
          <p className="text-xs text-neutral-500 font-body">No requests yet...</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-secondary/30 bg-background-card/50 p-3 rounded-pixel hover:border-secondary/60 transition-colors"
            >
              {/* Request Line */}
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('font-pixel text-xs font-bold', getMethodColor(entry.method))}>
                  {entry.method}
                </span>
                <span className="text-neutral-300 font-body text-xs flex-1 truncate">
                  {entry.path}
                </span>
                <span className={cn('font-body text-xs font-bold', getStatusColor(entry.status))}>
                  {entry.status}
                </span>
                <span className="text-neutral-500 font-body text-xs">{entry.timing}ms</span>
              </div>

              {/* Headers (Smart Defaults) */}
              {(entry.requestId || entry.idempotencyKey) && (
                <div className="space-y-1 mb-2 text-xs font-body">
                  {entry.requestId && (
                    <div className="flex gap-2">
                      <span className="text-neutral-500">Request-Id:</span>
                      <span className="text-neutral-300 font-mono">{entry.requestId}</span>
                    </div>
                  )}
                  {entry.idempotencyKey && (
                    <div className="flex gap-2">
                      <span className="text-neutral-500">Idempotency-Key:</span>
                      <span className="text-neutral-300 font-mono">{entry.idempotencyKey}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Response Preview / Expand Button */}
              {entry.response && (
                <div className="mt-2">
                  <button
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    className="text-xs text-primary hover:text-primary/80 font-body flex items-center gap-1"
                  >
                    {expandedId === entry.id ? '▼' : '▶'}
                    {expandedId === entry.id ? 'Hide' : 'Show'} Response
                  </button>

                  {expandedId === entry.id && (
                    <pre className="mt-2 p-2 bg-background-dark border border-primary/20 rounded text-xs text-neutral-300 font-mono overflow-x-auto scrollbar-retro">
                      {JSON.stringify(entry.response, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
