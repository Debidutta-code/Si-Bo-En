// N-Genius Configuration with Validation and Logging

// Fail fast if env vars are missing
const requiredEnvVars = [
  'NGENIUS_BASE_URL',
  'NGENIUS_API_KEY',
  'NGENIUS_OUTLET_ID',
];

const missingVars: string[] = [];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    missingVars.push(key);
  }
});

if (missingVars.length > 0) {
  const errorMsg = `❌ Missing required environment variables: ${missingVars.join(', ')}`;
  throw new Error(errorMsg);
}

export const NGeniusConfig = {
  /**
   * Base URL for N-Genius API
   * Example:
   * Sandbox: https://api-gateway.sandbox.ngenius-payments.com
   * Production: https://api-gateway.ngenius-payments.com
   */
  baseUrl: process.env.NGENIUS_BASE_URL as string,

  /**
   * API Key for authentication (Base64 encoded)
   * Format: Base64(ApiKey:ApiSecret)
   */
  apiKey: process.env.NGENIUS_API_KEY as string,

  /**
   * Outlet ID for transactions
   * This identifies the specific outlet/merchant account
   */
  outletId: process.env.NGENIUS_OUTLET_ID as string,

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