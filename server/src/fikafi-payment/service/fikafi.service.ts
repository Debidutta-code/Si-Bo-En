import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

/* =====================================================
   Types
===================================================== */

interface FikafiConfig {
    baseUrl: string;
    clientId: string;
    secretKey: string;
}

interface GuestDetails {
    guestName: string;
    phoneNum?: string;
    email: string;
    country?: string; // ✅ Added country as per Fikafi docs
}

interface BookingDetails {
    propertyID?: string; // Optional - Fikafi may not require it
    propertyName: string; // Required by Fikafi
    referenceDetails: string;
    communicationMode: 'WHATSAPP' | 'EMAIL';
    arrivalDate: string;
    numberOfNights: number;
}

interface Payment {
    paymentNumber: number;
    paymentName?: string;
    amount: number;
    date?: string;
    dueDate?: string; // Support both date and dueDate
}

interface PaymentDetails {
    currency: string;
    totalAmounts: number;
    numOfPayments: number;
    validity: '3 hours' | '8 hours' | '24 hours' | '3 days' | '7 days';
    payments: Payment[];
}

interface ReturnUrl {
    success_url: string;
    failed_url: string;
}

interface Webhook {
    payment_details_url: string;
    payment_event_url: string;
}

export interface FikafiPaymentRequest {
    bookingRefNum: string;
    guestDetails: GuestDetails;
    country?: string; // ✅ Made optional since it's now inside guestDetails
    bookingDetails: BookingDetails;
    paymentDetails: PaymentDetails;
    returnURL?: ReturnUrl;
    webhook?: Webhook;
}

export interface FikafiPaymentResponse {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
    details?: any;
}

/* =====================================================
   Service
===================================================== */

class FikafiPaymentService {
    private client: AxiosInstance;
    private config: FikafiConfig;

    private token: string | null = null;
    private tokenExpiry = 0;

    constructor() {
        this.config = {
            baseUrl:
                process.env.FIKAFI_BASE_URL ||
                'http://localhost:8080', // Default to local for testing

            clientId: process.env.FIKAFI_CLIENT_ID || '',
            secretKey: process.env.FIKAFI_SECRET_KEY || '',
        };

        console.log('🔑 Fikafi Config loaded:');
        console.log('  Base URL:', this.config.baseUrl);
        console.log(
            '  Client ID:',
            this.config.clientId
                ? this.config.clientId.substring(0, 8) + '...'
                : 'NOT SET'
        );

        this.client = axios.create({
            baseURL: this.config.baseUrl,
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
        });

        /* ==============================
       Attach token automatically
    ============================== */
        const useFake = process.env.USE_FAKE_FIKAFI === 'true';

        if (!useFake) {
            this.client.interceptors.request.use(async config => {
                const token = await this.getToken();
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            });
        }

        /* ==============================
       Error handler
    ============================== */
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

    /* =====================================================
     TOKEN HANDLING - Uses Basic Auth
  ===================================================== */

    private async getToken(): Promise<string> {
        const now = Date.now();

        if (this.token && now < this.tokenExpiry) {
            console.log('♻️ Using cached Fikafi token');
            return this.token;
        }

        console.log('🔐 Fetching new Fikafi token...');

        try {
            const res = await axios.post(
                `${this.config.baseUrl}/auth/token`,
                {
                    clientId: process.env.FIKAFI_CLIENT_ID,
                    key: process.env.FIKAFI_SECRET_KEY,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            console.log('📥 Token response status:', res.status);
            console.log(
                '📥 Token response data:',
                JSON.stringify(res.data).substring(0, 200)
            );

            const { accessToken, expiresIn } = res.data;

            this.token = accessToken;
            this.tokenExpiry = now + expiresIn * 1000 - 60000;

            console.log('✅ Token obtained successfully');

            return this.token!;
        } catch (error: any) {
            console.error(
                '❌ Token fetch error:',
                error.response?.data || error.message
            );
            throw error;
        }
    }

    /* =====================================================
     CREATE PAYMENT LINK
  ===================================================== */

    public async createPaymentLink(
        request: FikafiPaymentRequest
    ): Promise<FikafiPaymentResponse> {
        try {
            console.log('📤 Creating payment link...');

            /* ===============================
           ✅ MOCK MODE (LOCAL SERVER)
        =============================== */
if (process.env.PAYMENT_MODE === 'mock') {
                console.log('🧪 Using MOCK payment server');

                const mockRes = await axios.post(
                    'http://localhost:8080/createPayment',
                    request
                );

                return {
                    success: true,
                    data: mockRes.data,
                };
            }

            /* ===============================
           ✅ REAL FIKAFI (SANDBOX/PROD)
        =============================== */

            const body = {
                bookingRefNum: request.bookingRefNum,

                guestDetails: {
                    guestName: request.guestDetails.guestName,
                    email: request.guestDetails.email,
                },

bookingDetails: {
                  propertyID: request.bookingDetails.propertyID || request.bookingDetails.propertyName, // ✅ Fikafi requires propertyID
                  propertyName: request.bookingDetails.propertyName,
                  referenceDetails: request.bookingDetails.referenceDetails,
                  communicationMode: request.bookingDetails.communicationMode,
                  arrivalDate: request.bookingDetails.arrivalDate,
                  numberOfNights: request.bookingDetails.numberOfNights,
                },

                paymentDetails: {
                    currency: request.paymentDetails.currency,
                    totalAmounts: request.paymentDetails.totalAmounts,
                    numOfPayments: 1,
                    validity: '24 hours',
                    payments: [{ amount: request.paymentDetails.totalAmounts }],
                },

                webhook: request.webhook,
            };

            console.log('📤 Real Fikafi body:', JSON.stringify(body, null, 2));

const response = await this.client.post(
                '/payment/createPayment',
                body
            );

            return response.data;
        } catch (error: any) {
            console.error('❌ Payment link error:', error.message);

            return {
                success: false,
                error: error.message,
            };
        }
    }

    /* =====================================================
     PAYMENT STATUS
  ===================================================== */

    public async getPaymentStatus(paymentId: string) {
        const response = await this.client.get(`/payment/status/${paymentId}`);
        return response.data;
    }

    /* =====================================================
     WEBHOOK VERIFY
  ===================================================== */

    public verifyWebhookSignature(payload: string, signature: string): boolean {
        const secret = process.env.FIKAFI_WEBHOOK_SECRET;
        if (!secret) return false;

        const expected = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');

        return expected === signature;
    }
}

/* =====================================================
   Export
===================================================== */

export const fikafiPaymentService = new FikafiPaymentService();
export default fikafiPaymentService;
