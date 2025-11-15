import React, { useState } from 'react';
import type { Customer } from '@/lib/api';
import { NerdIcons } from '@/lib/nerd-icons';
import { cn } from '@/components/ui/utils';

interface AddressWatchlistCardProps {
  customer: Customer;
}

export const AddressWatchlistCard: React.FC<AddressWatchlistCardProps> = ({ customer }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const addressWatchlist = customer.review?.watch_list;

  if (!addressWatchlist) {
    return null;
  }

  const hasMatches = addressWatchlist.matches && addressWatchlist.matches.length > 0;

  return (
    <div className={cn('border rounded-lg p-4', hasMatches ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200')}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {hasMatches ? (
            <span className="text-yellow-500 text-xl">{NerdIcons.warning}</span>
          ) : (
            <span className="text-green-500 text-xl">{NerdIcons.checkmark}</span>
          )}
          <div>
            <h3 className="font-semibold text-lg">Address Watchlist</h3>
            <p className="text-sm text-gray-600">
              {hasMatches && addressWatchlist.matches
                ? `${addressWatchlist.matches.length} match${addressWatchlist.matches.length > 1 ? 'es' : ''} found`
                : 'No matches found'
              }
            </p>
          </div>
        </div>
        <span className="text-gray-500">
          {isExpanded ? NerdIcons.arrowUp : NerdIcons.arrowDown}
        </span>
      </div>

      {isExpanded && hasMatches && addressWatchlist.matches && (
        <div className="mt-4 space-y-3">
          {addressWatchlist.matches.map((match, idx) => (
            <div key={idx} className="border border-yellow-300 rounded-lg p-3 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">{match.list_name}</span>
                    {match.correlation && (
                      <span className="text-xs text-gray-500">({match.correlation})</span>
                    )}
                  </div>

                  {match.match_fields && match.match_fields.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Matched Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.match_fields.map((field, fieldIdx) => (
                          <span
                            key={fieldIdx}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isExpanded && !hasMatches && (
        <div className="mt-4 text-sm text-gray-600">
          <p>✅ Customer address not found on any watchlists</p>
        </div>
      )}
    </div>
  );
};
