// Set required environment variables for tests
process.env.STRADDLE_API_KEY = 'sk_sandbox_test_key_for_jest';
process.env.STRADDLE_ENV = 'sandbox';
process.env.PORT = '3001';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:5173';
