// N-Genius Configuration with Validation and Logging

console.log('\n========================================');
console.log('⚙️  LOADING N-GENIUS CONFIGURATION');
console.log('========================================');

// Log environment variables (masked)
console.log('🔍 Checking Environment Variables:');
console.log('NGENIUS_BASE_URL:', process.env.NGENIUS_BASE_URL);
console.log('NGENIUS_API_KEY (first 20 chars):', process.env.NGENIUS_API_KEY?.substring(0, 20) + '...');
console.log('NGENIUS_API_KEY Length:', process.env.NGENIUS_API_KEY?.length);
console.log('NGENIUS_OUTLET_ID:', process.env.NGENIUS_OUTLET_ID);

// Fail fast if env vars are missing
const requiredEnvVars = [
  'NGENIUS_BASE_URL',
  'NGENIUS_API_KEY',
  'NGENIUS_OUTLET_ID',
];

console.log('\n🔍 Validating Required Environment Variables...');

const missingVars: string[] = [];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing: ${key}`);
    missingVars.push(key);
  } else {
    console.log(`✅ Found: ${key}`);
  }
});

if (missingVars.length > 0) {
  const errorMsg = `❌ Missing required environment variables: ${missingVars.join(', ')}`;
  console.error('\n' + errorMsg);
  console.error('\n🔧 Please ensure these variables are set in your .env file:');
  missingVars.forEach(varName => {
    console.error(`   ${varName}=<your-value>`);
  });
  console.error('========================================\n');
  throw new Error(errorMsg);
}

console.log('\n✅ All required environment variables are present');

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

// Log final configuration (masked sensitive data)
console.log('\n📋 N-Genius Configuration Loaded:');
console.log('Base URL:', NGeniusConfig.baseUrl);
console.log('API Key (first 20 chars):', NGeniusConfig.apiKey.substring(0, 20) + '...');
console.log('Outlet ID:', NGeniusConfig.outletId);
console.log('Token Endpoint:', NGeniusConfig.endpoints.token);
console.log('Orders Endpoint:', NGeniusConfig.endpoints.orders);
console.log('Token Expiry:', NGeniusConfig.tokenExpiry, 'seconds');

// Validate configuration values
console.log('\n🔍 Validating Configuration Values...');

// Check if sandbox or production
if (NGeniusConfig.baseUrl.includes('sandbox')) {
  console.log('🧪 Environment: SANDBOX');
} else if (NGeniusConfig.baseUrl.includes('ngenius-payments.com')) {
  console.log('🚀 Environment: PRODUCTION');
} else {
  console.warn('⚠️  Unknown environment - check BASE_URL');
}

// Validate API Key format (should be base64)
const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(NGeniusConfig.apiKey);
if (isBase64) {
  console.log('✅ API Key format looks valid (Base64)');
} else {
  console.warn('⚠️  API Key might not be in correct Base64 format');
}

// Validate Outlet ID format (should be UUID)
const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(NGeniusConfig.outletId);
if (isUUID) {
  console.log('✅ Outlet ID format is valid (UUID)');
} else {
  console.warn('⚠️  Outlet ID might not be in correct UUID format');
}

console.log('========================================\n');