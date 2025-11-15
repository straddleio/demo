import Straddle from '@straddlecom/straddle';
import { config } from './config.js';

// Initialize Straddle SDK client
export const straddleClient = new Straddle({
  apiKey: config.straddle.apiKey,
  environment: config.straddle.environment,
});

export default straddleClient;
