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
  features: {
    enableUnmask: process.env.ENABLE_UNMASK === 'true',
    enableLogStream: process.env.ENABLE_LOG_STREAM === 'true',
  },
} as const;
