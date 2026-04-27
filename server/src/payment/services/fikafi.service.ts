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
    private apiBaseUrl: string;
    private cachedToken: string | null = null;  // ← ADD
    private tokenExpiry: number = 0;             // ← ADD

    constructor() {
        this.baseUrl = process.env.FIKAFI_BASE_URL!;
        this.apiBaseUrl = process.env.FIKAFI_API_BASE_URL!;

        // console.log('🔑 Fikafi Config loaded:');
        // // console.log('  Base URL:', this.baseUrl);

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
        // ← ADD: return cached token if still valid
        if (this.cachedToken && Date.now() < this.tokenExpiry) {
            // console.log('✅ Using cached Fikafi token');
            return this.cachedToken;
        }

        const clientId = process.env.FIKAFI_CLIENT_ID;
        const key = process.env.FIKAFI_SECRET_KEY;
        const tokenBaseUrl = process.env.FIKAFI_TOKEN_BASE_URL;

        const tokenUrl = tokenBaseUrl!;

        try {
            // console.log('🔄 Generating new Fikafi token...');

            // console.log("TOKEN URL:", tokenUrl);
            // console.log("CLIENT ID:", clientId);
            // console.log("SECRET KEY:", key);

            const response = await axios.post(
                tokenUrl,
                {
                    clientId,
                    key
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    timeout: 30000   // increase to 30s
                }
            );

            // console.log('✅ Token API response:', response.data);

            // 🔥 IMPORTANT: handle both possibilities
            const token =
                response.data.accessToken ||
                response.data.token ||
                response.data.Token;

            if (!token) {
                throw new Error('Token missing in response');
            }

            // ← ADD: cache token for 55 minutes
            this.cachedToken = token;
            this.tokenExpiry = Date.now() + (55 * 60 * 1000);

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
            // console.log('📤 Creating Fikafi payment link...');

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

            // console.log(
            //     '📤 Fikafi request body:',
            //     JSON.stringify(body, null, 2)
            // );

            // Check if token is provided, otherwise generate a new one
            let tokenValue = fikafiToken;
            if (!tokenValue) {
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

            // console.log(
            //     '📤 Using Fikafi token' + (fikafiToken ? ' from frontend header' : ' (newly generated') + ':)',
            //     tokenValue.substring(0, 20) + '...'
            // );

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

                // console.log(
                //     '📥 Fikafi raw response:',
                //     JSON.stringify(data, null, 2)
                // );

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

    public async getPaymentStatus(bookingRefNum: string, fikafiRefNum: string) {
        try {
            // Get token
            const tokenResponse = await this.getFikafiToken();
            if (!tokenResponse.success || !tokenResponse.token) {
                throw new Error('Failed to get Fikafi token');
            }
            const tokenValue = tokenResponse.token;

            // Use apiBaseUrl for this endpoint
            const apiClient = axios.create({
                baseURL: this.apiBaseUrl,
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
            });

            const response = await apiClient.get('/getPaymentStatus', {
                params: {
                    bookingRefNum,
                    fikafiRefNum
                },
                headers: {
                    'Authorization': `Bearer ${tokenValue}`,
                }
            });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Unexpected error occurred.',
            };
        }
    }

    /**
     * Take action on a payment (resend or cancel)
     * Used for handling failed/expired payments
     * POST /takePaymentAction?bookingRefNum=...&fikafiRefNum=...&action=...
     */
    public async takePaymentAction(
        bookingRefNum: string,
        fikafiRefNum: string,
        action: 'resend' | 'cancel',
        fikafiToken?: string
    ): Promise<FikafiServiceResponse> {
        try {
            // console.log(`📤 Taking payment action: ${action} for ${bookingRefNum}`);

            // Get token
            let tokenValue = fikafiToken;
            if (!tokenValue) {
                const tokenResponse = await this.getFikafiToken();
                if (tokenResponse.success && tokenResponse.token) {
                    tokenValue = tokenResponse.token;
                } else {
                    return {
                        success: false,
                        error: tokenResponse.error || 'Failed to generate token',
                    };
                }
            }

            const actionBaseUrl = process.env.FIKAFI_ACTION_BASE_URL;
            if (!actionBaseUrl) {
                throw new Error('FIKAFI_ACTION_BASE_URL is not configured.');
            }

            // Fikafi uses query parameters
            const params = {
                bookingRefNum,
                fikafiRefNum,
                action,
            };

            // console.log('📤 Fikafi action request:', params);

            const response = await axios.post(
                `${actionBaseUrl}?bookingRefNum=${bookingRefNum}&fikafiRefNum=${fikafiRefNum}&action=${action}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${tokenValue}`,
                    },
                }
            );

            // console.log('📥 Fikafi action response:', JSON.stringify(response.data, null, 2));

            return {
                success: true,
                message: `Payment ${action} action completed successfully`,
                data: response.data,
            };
        } catch (error: any) {
            console.error(`❌ Payment action error:`, error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to take payment action',
            };
        }
    }
}

/* =====================================================
   Export
===================================================== */

export const fikafiPaymentService = new FikafiPaymentService();
export default fikafiPaymentService;
