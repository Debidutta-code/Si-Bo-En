// N-Genius Payment Service for Frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface CreateOrderPayload {
  action: 'PURCHASE' | 'SALE' | 'AUTH';
  amount: {
    currencyCode: string;
    value: number; // Amount in fils (100 = 1 AED)
  };
  merchantAttributes?: {
    redirectUrl?: string;
    // skipConfirmationPage?: boolean;
  };
  emailAddress?: string;
}

export interface NGeniusOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      _id: string;
      reference: string;
      amount: {
        currencyCode: string;
        value: number;
      };
      _links: {
        payment: {
          href: string;
        };
      };
      _embedded: {
        payment: Array<{
          state: string;
          reference: string;
        }>;
      };
    };
    paymentUrl: string;
    orderReference: string;
  };
}

export interface OrderStatusResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    reference: string;
    amount: {
      currencyCode: string;
      value: number;
    };
    _embedded: {
      payment: Array<{
        _id: string;
        reference: string;
        state: string;
        amount: {
          currencyCode: string;
          value: number;
        };
        paymentMethod?: {
          name: string;
          pan?: string;
        };
        authResponse?: {
          success: boolean;
          resultCode: string;
          resultMessage: string;
        };
      }>;
    };
  };
}

class NGeniusService {
  /**
   * Create a payment order
   */
  async createOrder(payload: CreateOrderPayload): Promise<NGeniusOrderResponse> {
    try {
        console.log("Creating N-Genius order with payload:", API_BASE_URL, payload);
      const response = await fetch(
        `${API_BASE_URL}/payment/ngenius/order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment order');
      }

      return data;
    } catch (error) {
      console.error('Error creating N-Genius order:', error);
      throw error;
    }
  }

  /**
   * Get order status by reference
   */
  async getOrderStatus(orderReference: string): Promise<OrderStatusResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payment/ngenius/order/${orderReference}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get order status');
      }

      return data;
    } catch (error) {
      console.error('Error fetching order status:', error);
      throw error;
    }
  }

  /**
   * Check if payment was successful
   */
  isPaymentSuccessful(orderStatus: OrderStatusResponse): boolean {
    const payment = orderStatus.data._embedded?.payment?.[0];
    
    if (!payment) return false;

    // Check payment state
    // Successful states: PURCHASED, AUTHORISED, CAPTURED
    const successStates = ['PURCHASED', 'AUTHORISED', 'CAPTURED'];
    
    return successStates.includes(payment.state);
  }

  /**
   * Get payment state from order status
   */
  getPaymentState(orderStatus: OrderStatusResponse): string {
    const payment = orderStatus.data._embedded?.payment?.[0];
    return payment?.state || 'UNKNOWN';
  }
}

export const ngeniusService = new NGeniusService();