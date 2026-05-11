export interface FikafiGuestDetails {
    guestName: string;
    email: string;
}

export interface FikafiBookingDetails {
    propertyID: string;
    referenceDetails: string;
    communicationMode: 'WHATSAPP' | 'EMAIL';
    arrivalDate: string;
    numberOfNights: number;
}

export interface FikafiPayment {
    amount: number;
    date: string;
}

export interface FikafiPaymentDetails {
    currency: string;
    totalAmounts: number;
    numOfPayments: number;
    validity: '3 hours' | '8 hours' | '24 hours' | '3 days' | '7 days';
    payments: FikafiPayment[];
}

export interface FikafiWebhook {
    payment_event_url: string;
}

export interface FikafiReturnUrl {
    success_url: string;
    failed_url: string;
}

export interface FikafiPaymentRequestBody {
    bookingRefNum: string;
    guestDetails: FikafiGuestDetails;
    bookingDetails: FikafiBookingDetails;
    paymentDetails: FikafiPaymentDetails;
    webhook: FikafiWebhook;
    returnURL?: FikafiReturnUrl; // Optional - used for redirects
}

export interface FikafiPaymentResponse {
    referenceNumber: string;
    paymentLink: string;
    status: string;
}

export interface FikafiWebhookPayload {
    referenceNumber: string;
    status: string;
    amount: number;
    bookingRefNum?: string;
    eventType?: string;
}
