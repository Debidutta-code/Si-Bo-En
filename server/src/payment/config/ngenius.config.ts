// ngenius.config.js

// Fail fast if env vars are missing
const requiredEnvVars = [
  'NGENIUS_BASE_URL',
  'NGENIUS_API_KEY',
  'NGENIUS_OUTLET_ID',
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
});

export const NGeniusConfig = {
  /**
   * Base URL for N-Genius API
   * Example:
   * https://api-gateway.sandbox.ngenius-payments.com
   */
  baseUrl: process.env.NGENIUS_BASE_URL,

  /**
   * API Key for authentication (Base64 encoded)
   */
  apiKey: process.env.NGENIUS_API_KEY,

  /**
   * Outlet ID for transactions
   */
  outletId: process.env.NGENIUS_OUTLET_ID,

  /**
   * API endpoints
   */
  endpoints: {
    token: '/identity/auth/access-token',
    orders: '/transactions/outlets',
  },

  /**
   * Token expiry time (in seconds)
   */
  tokenExpiry: 300, // 5 minutes
};
