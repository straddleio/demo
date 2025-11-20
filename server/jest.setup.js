import http from 'node:http';

// Set required environment variables for tests
process.env.STRADDLE_API_KEY = 'sk_sandbox_test_key_for_jest';
process.env.STRADDLE_ENV = 'sandbox';
process.env.PORT = '3001';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:5173';

/**
 * Supertest starts an http.Server and binds to an ephemeral port; sandboxed
 * environments block `listen`, so we stub it to simulate a bound server.
 */
const originalAddress = http.Server.prototype.address;
http.Server.prototype.listen = function (...args) {
  const maybeCallback = args[args.length - 1];
  const callback = typeof maybeCallback === 'function' ? maybeCallback : undefined;
  this._fakeAddress = this._fakeAddress || { address: '127.0.0.1', family: 'IPv4', port: 0 };
  if (callback) {
    process.nextTick(callback);
  }
  this.emit('listening');
  return this;
};
http.Server.prototype.address = function () {
  if (this._fakeAddress) {
    return this._fakeAddress;
  }
  return originalAddress.call(this);
};
