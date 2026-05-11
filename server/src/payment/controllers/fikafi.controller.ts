import { Request, Response } from 'express';
import { fikafiPaymentService } from '../services/fikafi.service';
import { errorResponse, PropertyRequest, successResponse } from '../../utils';
import { socketManager } from '../../socket';
import { FikafiPaymentRequestBody } from '../types/fikafi.types';
import { prisma, RedisClient } from '../../config';
import { tryCatch } from 'bullmq';
import { BookingStatus } from '../../reservation/types/reservation.type';
export class FikafiPaymentController {
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

            // console.log('Using bookingRefNum:', bookingRefNum);

            // Validate required fields
            if (
                !guestDetails ||
                !bookingDetails ||
                !paymentDetails ||
                !webhook
            ) {
                console.error('❌ Validation failed: Missing required fields');
                return res
                    .status(400)
                    .json(errorResponse('Missing required fields'));
            }

            // Validate guest details
            if (!guestDetails.guestName || !guestDetails.email) {
                return res
                    .status(400)
                    .json(errorResponse('Guest name and email are required'));
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
                return res
                    .status(400)
                    .json(errorResponse('Incomplete booking details'));
            }

            // Validate payment details
            if (
                !paymentDetails.currency ||
                !paymentDetails.totalAmounts ||
                !paymentDetails.numOfPayments ||
                !paymentDetails.validity ||
                !paymentDetails.payments?.length
            ) {
                return res
                    .status(400)
                    .json(errorResponse('Incomplete payment details'));
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

            if (result.success && result.data) {
                return res.status(200).json(
                    successResponse('Payment link created successfully', {
                        bookingRefNum,
                        paymentLink: result.data.paymentLink,
                        paymentId: result.data.referenceNumber,
                        status: result.data.status,
                    })
                );
            } else {
                return res
                    .status(400)
                    .json(errorResponse('Failed to create payment link'));
            }
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error creating Fikafi payment link',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Error creating Fikafi payment link'));
        }
    }

    public static async getPaymentStatus(req: Request, res: Response) {
        try {
            const { bookingRefNum, fikafiRefNum } = req.query as {
                bookingRefNum?: string;
                fikafiRefNum?: string;
            };

            if (!bookingRefNum || !fikafiRefNum) {
                return res.status(400).json({
                    success: false,
                    message: 'bookingRefNum and fikafiRefNum are required',
                });
            }

            const result = await fikafiPaymentService.getPaymentStatus(
                bookingRefNum,
                fikafiRefNum
            );

            return res
                .status(200)
                .json(
                    successResponse(
                        'Payment status fetched successfully',
                        result
                    )
                );
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error fetching payment status',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Error fetching payment status'));
        }
    }

    public static async generateFromReservation(
        req: PropertyRequest,
        res: Response
    ) {
        try {
            const { reservationId } = req.body;

            // Get token from header
            const fikafiToken = req.headers['x-fikafi-token'] as string;

            if (!reservationId) {
                return res
                    .status(400)
                    .json(errorResponse('Reservation ID is required'));
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
                return res
                    .status(404)
                    .json(errorResponse('Reservation not found'));
            }

            const checkInDate = new Date(reservation.reservationStartDate);
            const checkOutDate = new Date(reservation.reservationEndDate);
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
                    payment_event_url: `${process.env.BACKEND_URL}/api/v1/payment/fikafi/webhook/payment-event`,
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

                return res.status(200).json(
                    successResponse('Payment link generated successfully', {
                        paymentLink: result.data.paymentLink,
                        paymentId: result.data.referenceNumber,
                        status: result.data.status,
                    })
                );
            } else {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Failed to generate payment link',
                            result.error || '',
                            result.code
                        )
                    );
            }
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error generating Fikafi payment link from reservation',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Error generating Fikafi payment link from reservation'
                    )
                );
        }
    }

    public static async handlePaymentEventWebhook(req: Request, res: Response) {
        try {
            const client = RedisClient.getInstance();

            const payload = req.body;

            // Handle multiple possible field names that Fikafi might use
            const bookingRefNum =
                payload.bookingRefNum ||
                payload.referenceNumber ||
                payload.bookingRef ||
                payload.ref;
            const status =
                payload.payment?.status ||
                payload.status ||
                payload.paymentStatus ||
                payload.state;
            const amount =
                payload.payment?.amount ??
                payload.amount ??
                payload.totalAmount ??
                payload.paymentAmount;

            if (!bookingRefNum) {
                console.error(
                    '❌ No booking reference found in webhook payload'
                );
                return res
                    .status(400)
                    .json(
                        errorResponse('bookingRefNum/referenceNumber missing')
                    );
            }
            // success check - handle various status formats
            const isPaid =
                status === 'Paid' ||
                status === 'PAID' ||
                status === 'success' ||
                status === 'SUCCESS' ||
                status === 'COMPLETED' ||
                status === 'APPROVED' ||
                status === 'CONFIRMED';

            if (isPaid) {
                // Persist payment confirmation to DB
                try {
                    await prisma.reservation.update({
                        where: { bookingCode: bookingRefNum },
                        data: {
                            bookingStatus: 'confirmed',
                            paidAmount: amount,
                            paymentMethod: 'payment_gateway',
                        },
                    });
                } catch (dbError) {
                    return res
                        .status(500)
                        .json(
                            errorResponse(
                                'Failed to connect to db',
                                dbError instanceof Error
                                    ? dbError.message
                                    : 'Unknown error'
                            )
                        );
                }
                try {
                    const res = await client.set(
                        `payment:confirmed:${bookingRefNum}`,
                        JSON.stringify({
                            amount,
                            status,
                            confirmedAt: Date.now(),
                        }),
                        { EX: 600 } // 10 minutes TTL — enough for a reconnecting client
                    );
                    // console.log("Redis store res", res);
                } catch (error) {
                    console.error(`❌ Failed to set Redis key:`, error);
                }
                // await client.set(
                //     `payment:confirmed:${bookingRefNum}`,
                //     JSON.stringify({ amount, status, confirmedAt: Date.now() }),
                //     { EX: 6000 }
                // );
                const isExists = await client.get(
                    `payment:confirmed:${bookingRefNum}`
                );
                // console.log(`🔍 Redis verify read-back: ${isExists ? 'KEY EXISTS ✅' : 'KEY MISSING ❌ - write failed silently'}`);
                socketManager.emitPaymentUpdate(bookingRefNum, {
                    orderReference: bookingRefNum,
                    eventName: 'payment-confirmed',
                    status: 'success',
                    message: 'Payment successful',
                    paymentDetails: { amount, status },
                });

                // console.log(
                //     `✅ Socket event emitted to room: payment:${bookingRefNum}`
                // );
            } else if (FikafiPaymentController.isPaymentFailed(status)) {
                // Handle payment failure - expired, declined, failed, etc.
                // console.log(`❌ Payment failed for ${bookingRefNum} (status: ${status})`);

                // Map payment status to booking status
                const statusMap: Record<string, string> = {
                    Expired: 'expired',
                    EXPIRED: 'expired',
                    Declined: 'cancelled',
                    DECLINED: 'cancelled',
                    Failed: 'cancelled',
                    FAILED: 'cancelled',
                    failed: 'cancelled',
                    Timeout: 'cancelled',
                    TIMEOUT: 'cancelled',
                };
                const bookingStatus = (statusMap[status] ||
                    'cancelled') as BookingStatus;

                // Update reservation status to indicate payment failure
                try {
                    await prisma.reservation.update({
                        where: { bookingCode: bookingRefNum },
                        data: {
                            bookingStatus: bookingStatus,
                            paymentMethod: 'payment_gateway',
                        },
                    });
                    // console.log(`✅ Reservation ${bookingRefNum} marked as ${bookingStatus}`);
                } catch (dbError) {
                    console.error(
                        `❌ Failed to update reservation in DB:`,
                        dbError
                    );
                }

                // Store failure in Redis (TTL: 10 minutes)
                try {
                    await client.set(
                        `payment:failed:${bookingRefNum}`,
                        JSON.stringify({
                            status,
                            message:
                                FikafiPaymentController.getFailureMessage(
                                    status
                                ),
                            failedAt: Date.now(),
                        }),
                        { EX: 600 }
                    );
                    // console.log(`✅ Payment failure stored in Redis for ${bookingRefNum}`);
                } catch (redisError) {
                    console.warn('⚠️ Redis unavailable:', redisError);
                }

                // Emit failure event to socket
                socketManager.emitPaymentUpdate(bookingRefNum, {
                    orderReference: bookingRefNum,
                    eventName: 'payment-failed',
                    status: 'failed',
                    message: FikafiPaymentController.getFailureMessage(status),
                    paymentDetails: { amount, status },
                });

                // console.log(
                //     `❌ Payment failure event emitted to room: payment:${bookingRefNum}`
                // );
            } else {
                console.warn(
                    `⏳ Payment not completed yet (status: ${status})`
                );
            }

            return res
                .status(200)
                .json(successResponse('Payment event processed successfully'));
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to handle payment', error.message)
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to handle payment'));
        }
    }

    /**
     * Take action on a failed/expired payment
     * POST /api/v1/fikafi/payment-action
     *
     * Body: { bookingRefNum, fikafiRefNum, action: 'resend' | 'cancel' }
     */
    public static async takePaymentAction(req: Request, res: Response) {
        try {
            const { bookingRefNum, fikafiRefNum, action } = req.body;

            // Validate required fields
            if (!bookingRefNum || !fikafiRefNum || !action) {
                return res.status(400).json({
                    success: false,
                    message:
                        'bookingRefNum, fikafiRefNum, and action are required',
                });
            }

            // Validate action
            if (!['resend', 'cancel'].includes(action)) {
                return res.status(400).json({
                    success: false,
                    message: 'action must be either "resend" or "cancel"',
                });
            }

            // console.log(`📤 Taking payment action: ${action} for booking ${bookingRefNum}, fikafi ref: ${fikafiRefNum}`);

            const result = await fikafiPaymentService.takePaymentAction(
                bookingRefNum,
                fikafiRefNum,
                action,
                req.headers['x-fikafi-token'] as string
            );

            if (result.success) {
                // If action is cancel, update reservation status in DB
                if (action === 'cancel') {
                    try {
                        await prisma.reservation.update({
                            where: { bookingCode: bookingRefNum },
                            data: {
                                bookingStatus: 'cancelled',
                                paymentMethod: 'payment_gateway',
                            },
                        });
                        // console.log(`✅ Reservation ${bookingRefNum} marked as cancelled`);
                    } catch (dbError) {
                        console.error(
                            `❌ Failed to update reservation in DB:`,
                            dbError
                        );
                    }
                }

                // Emit socket event for the action result
                socketManager.emitPaymentUpdate(bookingRefNum, {
                    orderReference: bookingRefNum,
                    eventName:
                        action === 'resend'
                            ? 'payment-resent'
                            : 'payment-cancelled',
                    status: action === 'resend' ? 'pending' : 'failed',
                    message:
                        result.message || `Payment ${action} action completed`,
                });

                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.error || 'Failed to take payment action',
                });
            }
        } catch (error: any) {
            console.error('Error taking payment action:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error?.message,
            });
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
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch reservation by code',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to fetch reservation by code'));
        }
    }

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
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch reservation by code',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to generate Fikafi token'));
        }
    }

    /**
     * Check if payment status indicates failure
     */
    private static isPaymentFailed(status: string): boolean {
        const failedStatuses = [
            'Expired',
            'EXPIRED',
            'Declined',
            'DECLINED',
            'Failed',
            'FAILED',
            'failed',
            'failed',
            'CANCELLED',
            'Cancelled',
            'cancelled',
            'Timeout',
            'TIMEOUT',
            'error',
            'ERROR',
        ];
        return failedStatuses.includes(status);
    }

    /**
     * Get user-friendly failure message based on status
     */
    private static getFailureMessage(status: string): string {
        const messages: Record<string, string> = {
            Expired: 'Payment request has expired',
            EXPIRED: 'Payment request has expired',
            Declined: 'Payment was declined by the bank',
            DECLINED: 'Payment was declined by the bank',
            Failed: 'Payment failed',
            FAILED: 'Payment failed',
            failed: 'Payment failed',
            CANCELLED: 'Payment was cancelled',
            Cancelled: 'Payment was cancelled',
            cancelled: 'Payment was cancelled',
            Timeout: 'Payment request timed out',
            TIMEOUT: 'Payment request timed out',
            error: 'An error occurred during payment',
            ERROR: 'An error occurred during payment',
        };
        return messages[status] || `Payment failed: ${status}`;
    }
}
