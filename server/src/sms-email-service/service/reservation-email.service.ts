import { IReservationWithAllDetails, IUReservation } from '../../reservation/types';
import { getPropertyByPropertyAndRoom } from '../utils';
import {
    BookingConfirmationEmail,
    BookingAmendmentEmail,
    BookingCancellationEmail,
} from '../templatesss';
import { PropertyEmailRepository } from '../reposititory';
import { emailQueue } from '../../index';

export class ReservationEmailService {
    private propertyEmailRepository: PropertyEmailRepository;

    constructor() {
        this.propertyEmailRepository = new PropertyEmailRepository();
    }

    // ─── Helper: derive room count from DailyPriceBrakeDown ─────────────────────
    private getNumberOfRooms(reservation: IReservationWithAllDetails): number {
        return (
            new Set(
                (reservation.PricingBrakeDown?.DailyPriceBrakeDown ?? [])
                    .map((item: any) => item.roomNumber)
                    .filter(Boolean)
            ).size || 1
        );
    }

    // ─── Helper: derive night count ─────────────────────────────────────────────
    private calculateNights(startDate: Date, endDate: Date): number {
        return Math.max(
            1,
            Math.ceil(
                (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
            )
        );
    }

    // ─── Helper: build property shape for templates ─────────────────────────────
    private buildPropertyShape(propertyDetails: any) {
        return {
            propertyName: propertyDetails.propertyName,
            description: propertyDetails.description ?? '',
            image: propertyDetails.image ?? [],
            propertyContact: propertyDetails.propertyContact,
            propertyEmail: propertyDetails.propertyEmail,
            propertyCode: propertyDetails.propertyCode,
            starRating: propertyDetails.starRating ?? null,
        };
    }

    // ─── 1. Booking Confirmation ────────────────────────────────────────────────
    /**
     * Send confirmation emails (customer + property) after a reservation is created.
     * Accepts the full IReservationWithAllDetails so we can read PricingBrakeDown directly.
     */
    public async reservationConfirmation(
        reservation: IReservationWithAllDetails
    ): Promise<void> {
        try {
            const propertyDetails = await getPropertyByPropertyAndRoom(
                reservation.propertyCode,
                reservation.roomTypeCode
            );
            if (
                !propertyDetails ||
                !propertyDetails.propertyAddress ||
                !propertyDetails.propertyRooms
            )
                return;

            const numberOfNights = this.calculateNights(
                new Date(reservation.reservationStartDate),
                new Date(reservation.reservationEndDate)
            );
            const numberOfRooms = this.getNumberOfRooms(reservation);

            // Build a reservation shape that the template can consume — augmented with
            // derived fields that the template references (numberOfNights, numberOfRooms,
            // guestDetails for the guest rows, bookedAt for the meta bar, etc.)
            const reservationForTemplate = {
                ...reservation,
                numberOfNights,
                numberOfRooms,
                // Template uses guestDetails[] for the avatar/name rows
                guestDetails: reservation.guests ?? [],
                // Template uses bookedAt as a string
                bookedAt: reservation.bookedAt,
            };

            const ccEmails = propertyDetails.propertyEmails
                .map((e: any) => e.email)
                .filter((e: string) => e !== propertyDetails.propertyEmail);

            const htmlTemplate = BookingConfirmationEmail({
                property: this.buildPropertyShape(propertyDetails),
                room: propertyDetails.propertyRooms[0],
                reservation: reservationForTemplate,
                propertyAddress: propertyDetails.propertyAddress,
            });

            const correlationId = reservation.bookingCode;

            // Email 1 – Customer
            await emailQueue.enqueueEmail({
                to: reservation.bookingUserEmail,
                cc: [],
                subject: 'Your Reservation Confirmation - RevChill',
                htmlContent: htmlTemplate,
                priority: 'critical',
                meta: {
                    template: 'reservation_confirmation_customer',
                    event: 'reservation_confirmation',
                    correlationId,
                },
            });

            // Email 2 – Property (with other emails in CC)
            await emailQueue.enqueueEmail({
                to: propertyDetails.propertyEmail,
                cc: ccEmails,
                subject: 'New Reservation - RevChill',
                htmlContent: htmlTemplate,
                priority: 'high',
                meta: {
                    template: 'reservation_confirmation_property',
                    event: 'reservation_confirmation',
                    correlationId,
                },
            });
        } catch (error) {
            console.error('Error sending reservation confirmation email:', error);
        }
    }

    // ─── 2. Booking Amendment ───────────────────────────────────────────────────
    /**
     * Send amendment emails after a reservation is modified.
     * @param existingReservation  – the ORIGINAL reservation (before update)
     * @param updatePayload        – the IUReservation payload used to update
     * @param updatedPricingBrakeDown – the freshly saved IPricingBreakDown after update
     */
    public async reservationUpdatedEmail(
        existingReservation: IReservationWithAllDetails,
        updatePayload: IUReservation
    ): Promise<void> {
        try {
            const propertyDetails = await getPropertyByPropertyAndRoom(
                existingReservation.propertyCode,
                existingReservation.roomTypeCode
            );
            if (!propertyDetails || !propertyDetails.propertyAddress) return;

            const room = propertyDetails.propertyRooms?.[0];
            if (!room) return;

            const ccEmails = propertyDetails.propertyEmails
                .map((e: any) => e.email)
                .filter((e: string) => e !== propertyDetails.propertyEmail);

            const htmlTemplate = BookingAmendmentEmail({
                property: this.buildPropertyShape(propertyDetails),
                room,
                updatedPayload: {
                    ...updatePayload,
                    // Keep PricingBrakeDown alias so template's `pricing` variable works
                    PricingBrakeDown: existingReservation.PricingBrakeDown,
                },
                reservation: existingReservation,
                propertyAddress: propertyDetails.propertyAddress,
            });

            const correlationId = existingReservation.bookingCode;

            // Email 1 – Customer
            await emailQueue.enqueueEmail({
                to: existingReservation.bookingUserEmail,
                cc: [],
                subject: 'Your Reservation Has Been Updated - RevChill',
                htmlContent: htmlTemplate,
                priority: 'high',
                meta: {
                    template: 'reservation_updated_customer',
                    event: 'reservation_updated',
                    correlationId,
                },
            });

            // Email 2 – Property (with other emails in CC)
            await emailQueue.enqueueEmail({
                to: propertyDetails.propertyEmail,
                cc: ccEmails,
                subject: 'Reservation Updated - RevChill',
                htmlContent: htmlTemplate,
                priority: 'normal',
                meta: {
                    template: 'reservation_updated_property',
                    event: 'reservation_updated',
                    correlationId,
                },
            });
        } catch (error) {
            console.error('Error sending reservation updated email:', error);
        }
    }

    // ─── 3. Booking Cancellation ─────────────────────────────────────────────────
    /**
     * Send cancellation emails after a reservation is cancelled.
     * Accepts the full IReservationWithAllDetails so PricingBrakeDown is available.
     */
    public async reservationCancelEmail(
        reservation: IReservationWithAllDetails
    ): Promise<void> {
        try {
            const propertyDetails = await getPropertyByPropertyAndRoom(
                reservation.propertyCode,
                reservation.roomTypeCode
            );
            if (!propertyDetails || !propertyDetails.propertyAddress) return;

            const room = propertyDetails.propertyRooms?.[0];
            if (!room) return;

            const cancelNumberOfNights = this.calculateNights(
                new Date(reservation.reservationStartDate),
                new Date(reservation.reservationEndDate)
            );
            const numberOfRooms = this.getNumberOfRooms(reservation);

            const ccEmails = propertyDetails.propertyEmails
                .map((e: any) => e.email)
                .filter((e: string) => e !== propertyDetails.propertyEmail);

            const reservationForTemplate = {
                ...reservation,
                numberOfNights: cancelNumberOfNights,
                numberOfRooms,
                guestDetails: reservation.guests ?? [],
                bookedAt: reservation.bookedAt,
            };

            const htmlTemplate = BookingCancellationEmail({
                property: this.buildPropertyShape(propertyDetails),
                room,
                reservation: reservationForTemplate,
                propertyAddress: propertyDetails.propertyAddress,
            });

            const correlationId = reservation.bookingCode;

            // Email 1 – Customer
            await emailQueue.enqueueEmail({
                to: reservation.bookingUserEmail,
                cc: [],
                subject: 'Your Reservation Cancellation Confirmation - RevChill',
                htmlContent: htmlTemplate,
                priority: 'high',
                meta: {
                    template: 'reservation_cancel_customer',
                    event: 'reservation_cancel',
                    correlationId,
                },
            });

            // Email 2 – Property (with other emails in CC)
            await emailQueue.enqueueEmail({
                to: propertyDetails.propertyEmail,
                cc: ccEmails,
                subject: 'Reservation Cancelled - RevChill',
                htmlContent: htmlTemplate,
                priority: 'normal',
                meta: {
                    template: 'reservation_cancel_property',
                    event: 'reservation_cancel',
                    correlationId,
                },
            });
        } catch (error) {
            console.error(
                'Error sending reservation cancellation email:',
                error
            );
        }
    }
}
