/**
 * In-memory request log storage for displaying API calls in the UI
 */

export interface RequestLog {
  requestId: string;
  correlationId: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: string;
  straddleEndpoint?: string; // For Straddle API calls
}

const requestLogs: RequestLog[] = [];
const MAX_LOGS = 100;

/**
 * Add a request log entry
 */
export function logRequest(log: RequestLog): void {
  requestLogs.unshift(log);

  // Keep only the most recent logs
  if (requestLogs.length > MAX_LOGS) {
    requestLogs.pop();
  }
}

/**
 * Get all request logs
 */
export function getRequestLogs(): RequestLog[] {
  return [...requestLogs];
}

/**
 * Clear all request logs
 */
export function clearRequestLogs(): void {
  requestLogs.length = 0;
}

/**
 * Log a Straddle API call
 */
export function logStraddleCall(
  requestId: string,
  correlationId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number
): void {
  logRequest({
    requestId,
    correlationId,
    method,
    path: `/straddle/${endpoint}`,
    statusCode,
    duration,
    timestamp: new Date().toISOString(),
    straddleEndpoint: endpoint,
  });
}
