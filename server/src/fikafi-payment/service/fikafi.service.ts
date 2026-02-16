import axios, { AxiosInstance } from 'axios';

/* =====================================================
   Types
===================================================== */

// Guest Details - minimal fields as per new spec
interface GuestDetails {
    guestName: string;
    email: string;
    phoneNum?: string;
    country?: string;
}

// Booking Details - simplified as per new spec
interface BookingDetails {
    propertyID: string;
    referenceDetails: string;
    communicationMode: 'WHATSAPP' | 'EMAIL';
    arrivalDate: string;
    numberOfNights: number;
}

// Payment - simplified as per new spec
interface Payment {
    amount: number;
    date: string; // Ensure the date property is included
}

// Payment Details - simplified as per new spec
interface PaymentDetails {
    currency: string;
    totalAmounts: number;
    numOfPayments: number;
    validity: '3 hours' | '8 hours' | '24 hours' | '3 days' | '7 days';
    payments: Payment[];
}

// Webhook - minimal as per new spec
interface Webhook {
    payment_event_url: string;
    payment_details_url?: string;
}

// Return URL - optional, used internally for redirects
interface ReturnUrl {
    success_url: string;
    failed_url: string;
}

// Full Payment Request - matches new spec
export interface FikafiPaymentRequest {
    bookingRefNum: string;
    guestDetails: GuestDetails;
    bookingDetails: BookingDetails;
    paymentDetails: PaymentDetails;
    webhook: Webhook;
    returnURL?: ReturnUrl;
}

// Fikafi API Response - new format
export interface FikafiPaymentResponse {
    referenceNumber: string;
    paymentLink: string;
    status: string;
}

// Service response wrapper
export interface FikafiServiceResponse {
    success: boolean;
    message?: string;
    data?: FikafiPaymentResponse;
    error?: string;
    code?: string;
    details?: any;
}

// Token response interface
export interface FikafiTokenResponse {
    success: boolean;
    token?: string;
    error?: string;
}

interface FikafiPayment {
    amount: number;
    date: string; // Added the required 'date' property
}

/* =====================================================
   Service
===================================================== */

class FikafiPaymentService {
    private client: AxiosInstance;
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.FIKAFI_BASE_URL!;

        console.log('🔑 Fikafi Config loaded:');
        // console.log('  Base URL:', this.baseUrl);

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
        });

        // Error handler
        this.client.interceptors.response.use(
            res => res,
            err => {
                console.error(
                    'Fikafi API Error:',
                    err.response?.data || err.message
                );
                throw err;
            }
        );
    }

    /**
     * Generate Fikafi Bearer token using client credentials
     */
    private async generateFikafiToken(): Promise<string> {
        const clientId = process.env.FIKAFI_CLIENT_ID;
        const key = process.env.FIKAFI_SECRET_KEY;
        const tokenBaseUrl = process.env.FIKAFI_TOKEN_BASE_URL;

        const tokenUrl = tokenBaseUrl!;

        try {
            console.log('🔄 Generating new Fikafi token...');

            const response = await axios.post(
                tokenUrl,
                {
                    clientId,
                    key,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 15000,
                }
            );

            console.log('✅ Token API response:', response.data);

            // 🔥 IMPORTANT: handle both possibilities
            const token =
                response.data.accessToken ||
                response.data.token ||
                response.data.Token;

            if (!token) {
                throw new Error('Token missing in response');
            }

            return token;
        } catch (error: any) {
            console.error('❌ Full token error:');
            console.error('status:', error.response?.status);
            console.error('data:', error.response?.data);
            console.error('message:', error.message);

            throw new Error('Failed to generate Fikafi token');
        }
    }

    /**
     * Get Fikafi token for frontend use
     */
    public async getFikafiToken(): Promise<FikafiTokenResponse> {
        try {
            const token = await this.generateFikafiToken();
            return {
                success: true,
                token,
            };
        } catch (error) {
            console.error('❌ Error generating Fikafi token:', error);
            return {
                success: false,
                error: 'Fikafi credentials not configured',
            };
        }
    }

    public async createPaymentLink(
        request: FikafiPaymentRequest,
        fikafiToken?: string
    ): Promise<FikafiServiceResponse> {
        try {
            console.log('📤 Creating Fikafi payment link...');

            const body = {
                bookingRefNum: request.bookingRefNum,
                guestDetails: {
                    guestName: request.guestDetails.guestName,
                    phoneNum: request.guestDetails.phoneNum || '',
                    email: request.guestDetails.email,
                    country: request.guestDetails.country || '',
                },
                bookingDetails: request.bookingDetails,
                paymentDetails: {
                    ...request.paymentDetails,
                    payments: request.paymentDetails.payments.map(
                        (payment, index) => ({
                            paymentNumber: index + 1,
                            amount: payment.amount,
                            date: payment.date || '',
                        })
                    ),
                },
                returnURL: {
                    success_url: request.returnURL?.success_url || '',
                    failed_url: request.returnURL?.failed_url || '',
                },
                webhook: {
                    payment_details_url: request.webhook.payment_details_url || undefined,
                    payment_event_url: request.webhook.payment_event_url,
                },
            };

            console.log(
                '📤 Fikafi request body:',
                JSON.stringify(body, null, 2)
            );

            // Check if token is provided, otherwise generate a new one
            let tokenValue = fikafiToken;
            if (!tokenValue) {
                console.log('🔄 Generating new Fikafi token...');
                const tokenResponse = await this.getFikafiToken();
                if (tokenResponse.success && tokenResponse.token) {
                    tokenValue = tokenResponse.token;
                } else {
                    console.error(
                        '❌ Failed to generate Fikafi token:',
                        tokenResponse.error
                    );
                    return {
                        success: false,
                        error:
                            tokenResponse.error || 'Failed to generate token',
                    };
                }
            }

            console.log(
                '📤 Using Fikafi token from frontend header:',
                tokenValue.substring(0, 20) + '...'
            );

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokenValue}`,
            };

            const paymentBaseUrl = process.env.FIKAFI_BASE_URL;
            if (!paymentBaseUrl) {
                throw new Error('Fikafi payment base URL is not configured.');
            }

            try {
                const response = await axios.post(paymentBaseUrl, body, {
                    headers,
                });

                const data = response.data;

                console.log(
                    '📥 Fikafi raw response:',
                    JSON.stringify(data, null, 2)
                );

                if (data.status === false) {
                    console.error('❌ Fikafi API error:', data);
                    return {
                        success: false,
                        error: data.message || 'Fikafi API error',
                        code: data.code,
                    };
                }

                return {
                    success: true,
                    message: 'Payment link created successfully',
                    data: {
                        referenceNumber: data.fikafiRefNum,
                        paymentLink: data.url,
                        status: data.status || 'CREATED',
                    },
                };
            } catch (apiError: any) {
                console.error('❌ Payment link error:', {
                    message: apiError.message,
                    response: apiError.response?.data,
                    headers: apiError.config?.headers,
                    body: apiError.config?.data,
                    stack: apiError.stack,
                });

                return {
                    success: false,
                    error: apiError.response?.data || apiError.message,
                };
            }
        } catch (error: any) {
            console.error('❌ Unexpected error in createPaymentLink:', {
                message: error.message,
                stack: error.stack,
            });

            return {
                success: false,
                error: error.message || 'Unexpected error occurred.',
            };
        }
    }

    public async getPaymentStatus(paymentId: string) {
        const response = await this.client.get(`/payment/status/${paymentId}`);
        return response.data;
    }
}

/* =====================================================
   Export
===================================================== */

export const fikafiPaymentService = new FikafiPaymentService();
export default fikafiPaymentService;
