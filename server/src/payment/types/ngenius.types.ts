// N-Genius Payment Types and Interfaces

// Access Token Response
export interface NGeniusTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
}

// Order Request
export interface NGeniusOrderRequest {
  action: 'AUTH' | 'SALE' | 'PURCHASE';
  amount: {
    currencyCode: string;
    value: number;
  };
  emailAddress?: string;
  outletId?: string;
  merchantAttributes?: {
    redirectUrl?: string;
    skipConfirmationPage?: string | boolean;
    cancelUrl?: string;
    cancelText?: string;
  };
  propertyCode?: string;
  reservationId?: string;
}

// Order Response
export interface NGeniusOrderResponse {
  _id: string;
  _links: {
    'cnp:payment-link'?: {
      href: string;
    };
    'payment-authorization': {
      href: string;
    };
    self: {
      href: string;
    };
    'tenant-brand': {
      href: string;
    };
    payment: {
      href: string;
    };
    'merchant-brand': {
      href: string;
    };
  };
  action: string;
  amount: {
    currencyCode: string;
    value: number;
  };
  language: string;
  merchantAttributes: {
    redirectUrl?: string;
  };
  emailAddress?: string;
  reference: string;
  outletId: string;
  createDateTime: string;
  paymentMethods: {
    card: string[];
    wallet?: string[];
  };
  referrer: string;
  formattedAmount: string;
  formattedOrderSummary: Record<string, unknown>;
  _embedded: {
    payment: NGeniusPayment[];
  };
}

// Payment Object
export interface NGeniusPayment {
  _id: string;
  _links: Record<string, unknown>;
  state: string;
  amount: {
    currencyCode: string;
    value: number;
  };
  updateDateTime: string;
  outletId: string;
  orderReference: string;
  reference?: string;
  paymentMethod?: Record<string, unknown>;
}

// Order Status Response
export interface NGeniusOrderStatusResponse extends NGeniusOrderResponse {
  type?: string;
  merchantDefinedData?: Record<string, unknown>;
  merchantDetails?: {
    reference: string;
    name: string;
    companyUrl: string;
  };
  isSplitPayment?: boolean;
  formattedOriginalAmount?: string;
}

// Error Response
export interface NGeniusErrorResponse {
  message: string;
  errors?: Array<{
    code: string;
    message: string;
  }>;
}
