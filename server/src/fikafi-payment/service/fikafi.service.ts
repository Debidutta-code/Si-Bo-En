
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
}

interface BookingDetails {
    propertyId: string;
    referenceDetails: string;
    communicationMode: 'WHATSAPP' | 'EMAIL';
    arrivalDate: string;
    numberOfNights: number;
}

interface Payment {
    paymentNumber: number;
    amount: number;
    date?: string;
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
    country: string;
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
                'https://demo.encorepay.co/FikafiSandbox/FikafiApi/api',

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
        this.client.interceptors.request.use(async config => {
            const token = await this.getToken();
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

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
                    clientId: process.env.FIKAFI_CLIENT_ID, // ✅ MUST be "clientId"
                    key: process.env.FIKAFI_SECRET_KEY, // ✅ MUST be "key"
                    },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            console.log('📥 Token response status:', res.status);
            console.log('📥 Token response data:', JSON.stringify(res.data).substring(0, 200));

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
            console.log('📤 Creating Fikafi payment link...');

            const body = {
                bookingRefNum: request.bookingRefNum,
                guestDetails: request.guestDetails,
                country: request.country,
                bookingDetails: {
                    propertyID: request.bookingDetails.propertyId,
                    referenceDetails: request.bookingDetails.referenceDetails,
                    communicationMode: request.bookingDetails.communicationMode,
                    arrivalDate: request.bookingDetails.arrivalDate,
                    numberOfNights: request.bookingDetails.numberOfNights,
                },
                paymentDetails: request.paymentDetails,
                returnURL: request.returnURL,
                webhook: request.webhook,
            };

            console.log(
                '📤 Request body:',
                JSON.stringify(body).substring(0, 200) + '...'
            );

            const response = await this.client.post(
                '/payment/createOnlinePayment',
                body
            );

            console.log(
                '📥 Payment response:',
                JSON.stringify(response.data).substring(0, 200)
            );

            return response.data;
        } catch (error: any) {
            console.error(
                '❌ Payment link error:',
                error.response?.data || error.message
            );
            return {
                success: false,
                error: error.response?.data || error.message,
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
