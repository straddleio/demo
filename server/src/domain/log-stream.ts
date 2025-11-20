/**
 * Chronological log stream for hardcore developer view
 * Captures every request, response, and webhook as separate entries
 */

import { config } from '../config.js';

export type LogEntryType =
  | 'request' // Incoming request to our server
  | 'response' // Outgoing response from our server
  | 'straddle-req' // Outgoing request to Straddle
  | 'straddle-res' // Incoming response from Straddle
  | 'webhook'; // Incoming webhook from Straddle

export interface LogStreamEntry {
  id: string;
  timestamp: string;
  type: LogEntryType;

  // For requests
  method?: string;
  path?: string;
  requestBody?: unknown;

  // For responses
  statusCode?: number;
  responseBody?: unknown;
  duration?: number;

  // For webhooks
  eventType?: string;
  eventId?: string;
  webhookPayload?: unknown;

  // Correlation
  requestId?: string;
  correlationId?: string;
}

const logStream: LogStreamEntry[] = [];
const MAX_ENTRIES = 200;

export function addLogEntry(entry: Omit<LogStreamEntry, 'id'>): void {
  if (!config.features.enableLogStream) {
    return;
  }

  logStream.unshift({
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });

  if (logStream.length > MAX_ENTRIES) {
    logStream.pop();
  }
}

export function getLogStream(): LogStreamEntry[] {
  if (!config.features.enableLogStream) {
    return [];
  }

  return [...logStream];
}

export function clearLogStream(): void {
  logStream.length = 0;
}

/**
 * Parse Straddle error response from SDK error
 * Extracts the error body from either .error property or stringified message
 */
export function parseStraddleError(error: unknown): unknown {
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    // Try to extract error body from SDK error
    if (errorObj.error) {
      return errorObj.error;
    } else if (errorObj.message && typeof errorObj.message === 'string') {
      // Handle stringified JSON in error message
      try {
        const match = errorObj.message.match(/^\d+\s+(.+)$/);
        if (match) {
          return JSON.parse(match[1]);
        }
      } catch {
        return { message: errorObj.message };
      }
    }
  }
  return null;
}
