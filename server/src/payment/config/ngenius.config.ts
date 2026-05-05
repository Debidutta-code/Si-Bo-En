import { config } from "../../config";

/** N-Genius payment gateway configuration. Values are validated in config.ts at startup. */
export const NGeniusConfig = {
  /** Sandbox: https://api-gateway.sandbox.ngenius-payments.com
   *  Production: https://api-gateway.ngenius-payments.com */
  baseUrl: config.ngenius.baseUrl,

  /** Base64-encoded API key. Format: Base64(ApiKey:ApiSecret) */
  apiKey: config.ngenius.apiKey,

  /** Merchant outlet identifier for transactions */
  outletId: config.ngenius.outletId,

  /** API endpoint paths, relative to baseUrl */
  endpoints: {
    token: '/identity/auth/access-token',
    orders: '/transactions/outlets',
  },

  /** Access token TTL — refresh before expiry to avoid auth failures (5 min) */
  tokenExpiry: 300,
} as const;