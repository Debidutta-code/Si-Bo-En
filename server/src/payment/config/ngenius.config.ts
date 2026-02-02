// N-Genius Payment Gateway Configuration

export const NGeniusConfig = {
  // Base URL for N-Genius API (Sandbox)
  baseUrl: 'https://api-gateway.sandbox.ngenius-payments.com',
  
  // API Key for authentication (Base64 encoded)
  apiKey: 'M2JjYTFjM2YtYjc1ZC00NGNhLWE3NTItZWYzYzI5MGJjZWUxOmI2NGM2MGU0LWVhMDktNDZjOS05NTA1LTMwYjA2MzlmZWZmZQ==',
  
  // Outlet ID for transactions
  outletId: '86b0c4f0-351f-43fa-9268-989a7d54facd',
  
  // API endpoints
  endpoints: {
    token: '/identity/auth/access-token',
    orders: '/transactions/outlets',
  },
  
  // Token expiry time (in seconds)
  tokenExpiry: 300, // 5 minutes
};
