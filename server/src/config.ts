import dotenv from 'dotenv';

dotenv.config();

export const config = {
  straddle: {
    apiKey: process.env.STRADDLE_API_KEY || '',
    environment: (process.env.STRADDLE_ENV as 'sandbox' | 'production') || 'sandbox',
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  webhook: {
    secret: process.env.WEBHOOK_SECRET || '',
    ngrokUrl: process.env.NGROK_URL || '',
  },
  plaid: {
    processorToken: process.env.PLAID_PROCESSOR_TOKEN || '',
  },
  generator: {
    url: process.env.GENERATOR_URL || 'http://localhost:8081',
  },
} as const;

// Validate required environment variables
if (!config.straddle.apiKey) {
  console.error('ERROR: STRADDLE_API_KEY is required in .env file');
  console.error('Copy .env.example to .env and add your Straddle sandbox API key');
  process.exit(1);
}
