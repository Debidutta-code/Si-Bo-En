// N-Genius Webhook Types and Interfaces

// Webhook Event Names
export type NGeniusWebhookEvent =
  | 'AUTHORISED'
  | 'DECLINED'
  | 'APM_PAYMENT_ACCEPTED'
  | 'AUTHORISATION_FAILED'
  | 'FULL_AUTH_REVERSED'
  | 'FULL_AUTH_REVERSAL_FAILED'
  | 'PURCHASED'
  | 'PURCHASE_DECLINED'
  | 'PURCHASE_FAILED'
  | 'PURCHASE_REVERSED'
  | 'PURCHASE_REVERSAL_FAILED'
  | 'CAPTURED'
  | 'CAPTURE_FAILED'
  | 'CAPTURE_VOIDED'
  | 'CAPTURE_VOID_FAILED'
  | 'CANCELLATION_REQUESTED'
  | 'CANCELLATION_FAILED'
  | 'CANCELLED'
  | 'ORDER_CLOSED'
  | 'PARTIALLY_CAPTURED'
  | 'PARTIAL_CAPTURE_FAILED'
  | 'REFUNDED'
  | 'REFUND_FAILED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUND_REQUESTED'
  | 'REFUND_REQUEST_FAILED'
  | 'PARTIAL_REFUND_FAILED'
  | 'PARTIAL_REFUND_REQUEST_FAILED'
  | 'PARTIAL_REFUND_REQUESTED'
  | 'REFUND_VOIDED'
  | 'REFUND_VOID_FAILED'
  | 'REFUND_VOID_REQUESTED'
  | 'GATEWAY_RISK_PRE_AUTH_REJECTED'
  | 'PRE_AUTH_FRAUD_CHECK_REJECTED'
  | 'POST_AUTH_FRAUD_CHECK_REJECTED'
  | 'POST_AUTH_FRAUD_CHECK_REVIEW'
  | 'POST_AUTH_FRAUD_CHECK_ACCEPTED'
  | 'ORDER';

// Webhook Payload Structure
export interface NGeniusWebhookPayload {
  outletId: string;
  eventId: string;
  eventName: NGeniusWebhookEvent;
  order: NGeniusWebhookOrder;
}

// Webhook Order Structure
export interface NGeniusWebhookOrder {
  _id: string;
  _links: {
    self: {
      href: string;
    };
    'tenant-brand': {
      href: string;
    };
    'merchant-brand': {
      href: string;
    };
  };
  type: string;
  merchantDefinedData?: Record<string, any>;
  action: string;
  amount: {
    currencyCode: string;
    value: number;
  };
  language: string;
  merchantAttributes?: Record<string, any>;
  reference: string;
  outletId: string;
  createDateTime: string;
  paymentMethods?: {
    card?: string[];
    wallet?: string[];
  };
  referrer?: string;
  merchantDetails?: {
    reference: string;
    name: string;
    companyUrl: string;
    email?: string;
    mobile?: string;
  };
  isSplitPayment?: boolean;
  isSamsungPayV2?: boolean;
  isSaudiPaymentEnabled?: boolean;
  formattedOrderSummary?: Record<string, any>;
  formattedAmount?: string;
  formattedOriginalAmount?: string;
  _embedded?: {
    payment?: NGeniusWebhookPayment[];
  };
}

// Webhook Payment Structure
export interface NGeniusWebhookPayment {
  _id: string;
  _links: {
    self: {
      href: string;
    };
    curies?: Array<{
      name: string;
      href: string;
      templated: boolean;
    }>;
  };
  reference: string;
  paymentMethod?: {
    expiry?: string;
    cardholderName?: string;
    name?: string;
    pan?: string;
  };
  savedCard?: {
    maskedPan?: string;
    expiry?: string;
    cardholderName?: string;
    scheme?: string;
    cardToken?: string;
    recaptureCsc?: boolean;
  };
  state: string;
  amount: {
    currencyCode: string;
    value: number;
  };
  updateDateTime: string;
  outletId: string;
  orderReference: string;
  originIp?: string;
  authResponse?: {
    authorizationCode?: string;
    success?: boolean;
    resultCode?: string;
    resultMessage?: string;
    rrn?: string;
    mid?: string;
    systemAuditTraceNumber?: string;
  };
  '3ds2'?: {
    eci?: string;
    transStatus?: string;
    messageVersion?: string;
    acsReferenceNumber?: string;
    threeDSMethodURL?: string;
    threeDSServerTransID?: string;
    acsURL?: string;
    acsTransID?: string;
    directoryServerID?: string;
    base64EncodedCReq?: string;
  };
  mid?: string;
  _embedded?: {
    'cnp:capture'?: Array<{
      _links: {
        self: {
          href: string;
        };
      };
      amount: {
        currencyCode: string;
        value: number;
      };
      createdTime: string;
      state: string;
    }>;
  };
}
