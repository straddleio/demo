import { describe, it, expect } from '@jest/globals';
import { isStraddleError, toExpressError, parseStringifiedError } from '../errors.js';

describe('Error Type Guards', () => {
  it('should identify Straddle API errors', () => {
    const straddleErr = {
      error: {
        type: 'invalid_request',
        code: 'INVALID_CUSTOMER',
        message: 'Customer not found',
      },
      status: 404,
    };

    expect(isStraddleError(straddleErr)).toBe(true);
    expect(isStraddleError(new Error('regular error'))).toBe(false);
    expect(isStraddleError(null)).toBe(false);
  });

  it('should convert unknown errors to Express errors', () => {
    const regularErr = new Error('Test error');
    const expressErr = toExpressError(regularErr);

    expect(expressErr).toBeInstanceOf(Error);
    expect(expressErr.message).toBe('Test error');
  });

  it('should convert Straddle errors to Express errors', () => {
    const straddleErr = {
      error: {
        type: 'invalid_request',
        code: 'INVALID_CUSTOMER',
        message: 'Customer not found',
      },
      status: 404,
    };

    const expressErr = toExpressError(straddleErr);

    expect(expressErr.message).toBe('Customer not found');
    expect(expressErr.status).toBe(404);
    expect(expressErr.code).toBe('INVALID_CUSTOMER');
  });
});

describe('parseStringifiedError', () => {
  it('should parse stringified JSON with status code', () => {
    const message =
      '422 {"error":{"type":"invalid_request","code":"INVALID_PAYKEY","detail":"Paykey cannot be used"}}';
    const result = parseStringifiedError(message);

    expect(result.statusCode).toBe(422);
    expect(result.body).toEqual({
      error: {
        type: 'invalid_request',
        code: 'INVALID_PAYKEY',
        detail: 'Paykey cannot be used',
      },
    });
  });

  it('should parse error with title field', () => {
    const message =
      '400 {"error":{"type":"validation_error","title":"Invalid input","code":"BAD_REQUEST"}}';
    const result = parseStringifiedError(message);

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual({
      error: {
        type: 'validation_error',
        title: 'Invalid input',
        code: 'BAD_REQUEST',
      },
    });
  });

  it('should handle malformed JSON gracefully', () => {
    const message = '500 {invalid json}';
    const result = parseStringifiedError(message);

    expect(result.statusCode).toBe(500);
    expect(result.body).toBeUndefined();
  });

  it('should return empty object for non-matching message', () => {
    const message = 'Regular error message';
    const result = parseStringifiedError(message);

    expect(result.statusCode).toBeUndefined();
    expect(result.body).toBeUndefined();
  });

  it('should handle message without status code', () => {
    const message = 'Just a regular error';
    const result = parseStringifiedError(message);

    expect(result).toEqual({});
  });
});

describe('toExpressError with stringified JSON', () => {
  it('should extract readable message from stringified error with detail field', () => {
    const error = new Error(
      '422 {"error":{"type":"invalid_request","code":"INVALID_PAYKEY","detail":"Paykey is inactive"}}'
    );
    const expressErr = toExpressError(error);

    expect(expressErr.message).toBe('Paykey is inactive');
    expect(expressErr.status).toBe(422);
    expect(expressErr.details).toEqual({
      error: {
        type: 'invalid_request',
        code: 'INVALID_PAYKEY',
        detail: 'Paykey is inactive',
      },
    });
  });

  it('should extract readable message from stringified error with title field', () => {
    const error = new Error(
      '400 {"error":{"type":"validation_error","title":"Invalid customer data","code":"VALIDATION_FAILED"}}'
    );
    const expressErr = toExpressError(error);

    expect(expressErr.message).toBe('Invalid customer data');
    expect(expressErr.status).toBe(400);
    expect(expressErr.details).toEqual({
      error: {
        type: 'validation_error',
        title: 'Invalid customer data',
        code: 'VALIDATION_FAILED',
      },
    });
  });

  it('should preserve original message if no detail/title found', () => {
    const error = new Error('422 {"error":{"type":"unknown","code":"UNKNOWN_ERROR"}}');
    const expressErr = toExpressError(error);

    expect(expressErr.message).toBe('422 {"error":{"type":"unknown","code":"UNKNOWN_ERROR"}}');
    expect(expressErr.status).toBe(422);
  });

  it('should handle regular Error objects unchanged', () => {
    const error = new Error('Regular error message');
    const expressErr = toExpressError(error);

    expect(expressErr.message).toBe('Regular error message');
    expect(expressErr.status).toBeUndefined();
  });
});
