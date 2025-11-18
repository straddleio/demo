export interface StraddleAPIError {
  error: {
    type: string;
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  status?: number;
}

export interface ExpressError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

export function isStraddleError(error: unknown): error is StraddleAPIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as StraddleAPIError).error === 'object'
  );
}

/**
 * Parse stringified JSON error from SDK
 * Handles errors like: "422 {\"error\":{...}}"
 */
export function parseStringifiedError(message: string): {
  statusCode?: number;
  body?: unknown;
} {
  // Try to match "STATUS_CODE JSON_STRING" pattern
  const match = message.match(/^(\d+)\s+(.+)$/);
  if (!match) {
    return {};
  }

  const [, statusStr, jsonStr] = match;
  const statusCode = parseInt(statusStr, 10);

  try {
    const body: unknown = JSON.parse(jsonStr);
    return { statusCode, body };
  } catch {
    return { statusCode };
  }
}

export function toExpressError(error: unknown): ExpressError {
  if (error instanceof Error) {
    const err = error as ExpressError;

    // Try to parse stringified JSON from error message
    const parsed = parseStringifiedError(err.message);
    if (parsed.statusCode) {
      err.status = parsed.statusCode;
      err.details = parsed.body;

      // Extract readable message from parsed body
      if (parsed.body && typeof parsed.body === 'object') {
        const bodyObj = parsed.body as Record<string, unknown>;
        if (bodyObj.error && typeof bodyObj.error === 'object') {
          const errorObj = bodyObj.error as Record<string, unknown>;
          if (typeof errorObj.detail === 'string') {
            err.message = errorObj.detail;
          } else if (typeof errorObj.title === 'string') {
            err.message = errorObj.title;
          }
        }
      }
    }

    return err;
  }

  if (isStraddleError(error)) {
    const err = new Error(error.error.message) as ExpressError;
    err.status = error.status || 500;
    err.code = error.error.code;
    err.details = error.error.details;
    return err;
  }

  return new Error('Unknown error occurred') as ExpressError;
}
