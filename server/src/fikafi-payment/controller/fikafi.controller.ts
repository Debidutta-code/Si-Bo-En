import { Request, Response } from 'express';
import { fikafiPaymentService } from '../service/fikafi.service';
import { PropertyRequest } from '../../utils';
import prisma from '../../config/prisma.client';
import { socketManager } from '../../socket';

// Guest Details - minimal fields as per new spec
interface FikafiGuestDetails {
    guestName: string;
    email: string;
}

// Booking Details - simplified as per new spec
interface FikafiBookingDetails {
    propertyID: string;
    referenceDetails: string;
    communicationMode: 'WHATSAPP' | 'EMAIL';
    arrivalDate: string;
    numberOfNights: number;
}

// Payment - simplified as per new spec
interface FikafiPayment {
    amount: number;
    date: string;
}

// Payment Details - simplified as per new spec
interface FikafiPaymentDetails {
    currency: string;
    totalAmounts: number;
    numOfPayments: number;
    validity: '3 hours' | '8 hours' | '24 hours' | '3 days' | '7 days';
    payments: FikafiPayment[];
}

// Webhook - minimal as per new spec
interface FikafiWebhook {
    payment_event_url: string;
}

// Return URL - optional, used internally for redirects
interface FikafiReturnUrl {
    success_url: string;
    failed_url: string;
}

// Full Payment Request - matches new spec
interface FikafiPaymentRequestBody {
    bookingRefNum: string;
    guestDetails: FikafiGuestDetails;
    bookingDetails: FikafiBookingDetails;
    paymentDetails: FikafiPaymentDetails;
    webhook: FikafiWebhook;
    returnURL?: FikafiReturnUrl; // Optional - used for redirects
}

// Fikafi API Response - new format
interface FikafiPaymentResponse {
    referenceNumber: string;
    paymentLink: string;
    status: string;
}

// Webhook payload - new format
interface FikafiWebhookPayload {
    referenceNumber: string;
    status: string;
    amount: number;
    bookingRefNum?: string;
    eventType?: string;
}

export class FikafiPaymentController {
    /**
     * Create a Fikafi payment link for a booking
     * POST /api/v1/fikafi/create-payment-link
     */
    public static async createPaymentLink(req: Request, res: Response) {
        try {
            const {
                bookingRefNum: providedBookingRefNum,
                guestDetails,
                bookingDetails,
                paymentDetails,
                webhook,
                returnURL,
            } = req.body as FikafiPaymentRequestBody;

            // Use provided booking code or generate a new one
            const bookingRefNum =
                providedBookingRefNum ||
                `BOOK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            console.log('Using bookingRefNum:', bookingRefNum);

            // Validate required fields
            if (
                !guestDetails ||
                !bookingDetails ||
                !paymentDetails ||
                !webhook
            ) {
                console.error('❌ Validation failed: Missing required fields');
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields',
                });
            }

            // Validate guest details
            if (!guestDetails.guestName || !guestDetails.email) {
                return res.status(400).json({
                    success: false,
                    message: 'Guest name and email are required',
                });
            }

            // Validate booking details
            if (
                !bookingDetails.propertyID ||
                !bookingDetails.referenceDetails ||
                !bookingDetails.communicationMode ||
                !bookingDetails.arrivalDate ||
                !bookingDetails.numberOfNights
            ) {
                console.error(
                    '❌ Validation failed: Booking details incomplete'
                );
                return res.status(400).json({
                    success: false,
                    message: 'Incomplete booking details',
                });
            }

            // Validate payment details
            if (
                !paymentDetails.currency ||
                !paymentDetails.totalAmounts ||
                !paymentDetails.numOfPayments ||
                !paymentDetails.validity ||
                !paymentDetails.payments?.length
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Incomplete payment details',
                });
            }

            const result = await fikafiPaymentService.createPaymentLink(
                {
                    bookingRefNum,
                    guestDetails,
                    bookingDetails,
                    paymentDetails: {
                        ...paymentDetails,
                        payments: paymentDetails.payments.map(payment => ({
                            ...payment,
                            date:
                                payment.date ||
                                new Date().toISOString().split('T')[0], // Add default date if missing
                        })),
                    },
                    returnURL,
                    webhook,
                },
                req.headers['x-fikafi-token'] as string
            );

            console.log(
                '📥 Fikafi service result:',
                JSON.stringify(result, null, 2)
            );

            if (result.success && result.data) {
                return res.status(200).json({
                    success: true,
                    message: 'Payment link created successfully',
                    data: {
                        bookingRefNum,
                        paymentLink: result.data.paymentLink,
                        paymentId: result.data.referenceNumber,
                        status: result.data.status,
                    },
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.error || 'Failed to create payment link',
                    code: result.code,
                    details: result.details,
                });
            }
        } catch (error: any) {
            console.error('Error creating Fikafi payment link:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error?.message,
            });
        }
    }

    /**
     * Get payment link status
     * GET /api/v1/fikafi/payment-status/:paymentId
     */
    public static async getPaymentStatus(req: Request, res: Response) {
        try {
            const { paymentId } = req.params;

            if (!paymentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment ID is required',
                });
            }

            const result =
                await fikafiPaymentService.getPaymentStatus(paymentId);

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            console.error('Error fetching payment status:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error?.message,
            });
        }
    }

    /**
     * Generate Fikafi payment link from reservation
     * POST /api/v1/fikafi/generate-from-reservation
     */
    public static async generateFromReservation(
        req: PropertyRequest,
        res: Response
    ) {
        try {
            const { reservationId } = req.body;

            // Get token from header
            const fikafiToken = req.headers['x-fikafi-token'] as string;

            if (!reservationId) {
                return res.status(400).json({
                    success: false,
                    message: 'Reservation ID is required',
                });
            }

            const reservation = await prisma.reservation.findUnique({
                where: { id: reservationId },
                include: {
                    property: {
                        include: {
                            propertyAddress: true,
                        },
                    },
                    primaryGuest: true,
                },
            });

            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'Reservation not found',
                });
            }

            const checkInDate = new Date(reservation.checkInDate);
            const checkOutDate = new Date(reservation.checkOutDate);
            const numberOfNights = Math.ceil(
                (checkOutDate.getTime() - checkInDate.getTime()) /
                    (1000 * 60 * 60 * 24)
            );

            const fikafiRequest = {
                bookingCode: reservation.bookingCode,
                bookingRefNum: reservation.bookingCode,
                guestDetails: {
                    guestName: `${reservation.primaryGuest.firstName} ${reservation.primaryGuest.lastName}`,
                    email: reservation.primaryGuest.email || '',
                },
                bookingDetails: {
                    propertyID: reservation.property?.propertyCode || '',
                    referenceDetails: reservation.bookingCode,
                    communicationMode: (reservation.primaryGuest.email
                        ? 'EMAIL'
                        : 'WHATSAPP') as 'WHATSAPP' | 'EMAIL',
                    arrivalDate: checkInDate.toISOString().split('T')[0],
                    numberOfNights,
                },
                paymentDetails: {
                    currency: reservation.currencyCode || 'AED',
                    totalAmounts: reservation.amount || 0,
                    numOfPayments: 1,
                    validity: '24 hours' as
                        | '3 hours'
                        | '8 hours'
                        | '24 hours'
                        | '3 days'
                        | '7 days',
                    payments: [
                        {
                            amount: reservation.amount || 0,
                            date: new Date().toISOString().split('T')[0],
                        },
                    ],
                },
                webhook: {
                    payment_event_url: `${process.env.BACKEND_URL}/api/v1/fikafi/webhook/payment-event`,
                },
            };

            const result = await fikafiPaymentService.createPaymentLink(
                fikafiRequest,
                fikafiToken
            );

            if (result.success && result.data) {
                await prisma.reservation.update({
                    where: { id: reservationId },
                    data: {
                        paymentMethod: 'payment_gateway',
                    },
                });

                return res.status(200).json({
                    success: true,
                    message: 'Payment link generated successfully',
                    data: {
                        paymentLink: result.data.paymentLink,
                        paymentId: result.data.referenceNumber,
                        status: result.data.status,
                    },
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.error || 'Failed to generate payment link',
                    code: result.code,
                });
            }
        } catch (error: any) {
            console.error(
                'Error generating Fikafi payment link from reservation:',
                error
            );
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error?.message,
            });
        }
    }

    /**
     * Handle Fikafi webhook - payment events
     * POST /api/v1/fikafi/webhook/payment-event
     *
     * Expected payload:
     * { referenceNumber: 'FKF-80630', status: 'PAID', amount: 100, bookingRefNum?: string }
     */
    public static async handlePaymentEventWebhook(req: Request, res: Response) {
        try {
            const payload = req.body;

            console.log(
                '🔥 Fikafi Webhook received:',
                JSON.stringify(payload, null, 2)
            );

            // Handle multiple possible field names that Fikafi might use
            const bookingRefNum =
                payload.bookingRefNum ||
                payload.referenceNumber ||
                payload.bookingRef ||
                payload.ref;
            const status =
                payload.status || payload.paymentStatus || payload.state;
            const amount =
                payload.amount || payload.totalAmount || payload.paymentAmount;

            console.log('📋 Extracted fields:', {
                bookingRefNum,
                status,
                amount,
            });

            if (!bookingRefNum) {
                console.error(
                    '❌ No booking reference found in webhook payload'
                );
                return res.status(400).json({
                    success: false,
                    message: 'bookingRefNum/referenceNumber missing',
                });
            }

            // success check - handle various status formats
            const isPaid =
                status === 'PAID' ||
                status === 'success' ||
                status === 'SUCCESS' ||
                status === 'COMPLETED' ||
                status === 'APPROVED' ||
                status === 'CONFIRMED';
            console.log(
                `💳 Payment status check: ${status} -> isPaid: ${isPaid}`
            );

            if (isPaid) {
                console.log(`📡 Emitting socket event for ${bookingRefNum}`);

                socketManager.emitPaymentUpdate(bookingRefNum, {
                    orderReference: bookingRefNum,
                    eventName: 'payment-confirmed',
                    status: 'success',
                    message: 'Payment successful',
                    paymentDetails: { amount, status },
                });

                console.log(
                    `✅ Socket event emitted to room: payment:${bookingRefNum}`
                );
            } else {
                console.log(`⏳ Payment not completed yet (status: ${status})`);
            }

            return res.status(200).json({
                success: true,
                message: 'Webhook processed',
            });
        } catch (error) {
            console.error('❌ Webhook processing error:', error);
            return res.status(500).json({ success: false, error: error });
        }
    }

    /**
     * Get reservation by booking code
     * GET /api/v1/fikafi/reservation/:bookingCode
     */
    public static async getReservationByCode(req: Request, res: Response) {
        try {
            const { bookingCode } = req.params;

            if (!bookingCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking code is required',
                });
            }

            const reservation = await prisma.reservation.findFirst({
                where: { bookingCode },
                include: {
                    property: true,
                    primaryGuest: true,
                },
            });

            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'Reservation not found',
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    bookingCode: reservation.bookingCode,
                    bookingStatus: reservation.bookingStatus,
                    paymentMethod: reservation.paymentMethod,
                    paidAmount: reservation.paidAmount,
                    amount: reservation.amount,
                    checkInDate: reservation.checkInDate,
                    checkOutDate: reservation.checkOutDate,
                    guestName: `${reservation.primaryGuest.firstName} ${reservation.primaryGuest.lastName}`,
                    guestEmail: reservation.primaryGuest.email,
                    propertyName: reservation.property?.propertyName,
                },
            });
        } catch (error: any) {
            console.error('Error fetching reservation:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error?.message,
            });
        }
    }

    /**
     * Get Fikafi token for frontend use
     * POST /api/v1/fikafi/token
     */
    public static async getFikafiToken(req: Request, res: Response) {
        try {
            const result = await fikafiPaymentService.getFikafiToken();

            if (result.success && result.token) {
                return res.status(200).json({
                    success: true,
                    token: result.token,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.error || 'Failed to generate token',
                });
            }
        } catch (error: any) {
            console.error('Error generating Fikafi token:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error?.message,
            });
        }
    }
}
