import { IBookingDetails } from '../../pms/frontoffice/reservation/types';
import { getPropertyByPropertyCode, getPropertyDetails } from '../utils';
import { EmailTemplates } from '../templatesss';
import { PropertyEmailRepository } from '../reposititory';
import { emailQueue } from '../../index';

export class ReservationEmailService {
    private propertyEmailRepository: PropertyEmailRepository;

    constructor() {
        this.propertyEmailRepository = new PropertyEmailRepository();
    }

    public async reservationConfirmation(
        bookingDetails: any
    ): Promise<void> {
        try {
            const property = await getPropertyByPropertyCode(
                bookingDetails.propertyCode
            );
            if (!property) return;

            const propertyDetails = await getPropertyDetails(
                property.id,
                bookingDetails.roomTypeCode
            );
            if (!propertyDetails || !propertyDetails.propertyAddress) return;

            const room = propertyDetails.propertyRooms[0];
            if (!room) return;

            const propertyEmails =
                await this.propertyEmailRepository.getPropertyEmails(
                    propertyDetails.id
                );
            const ccEmails = propertyEmails
                .map(e => e.email)
                .filter(e => e !== propertyDetails.propertyEmail);

            const htmlTemplate = EmailTemplates.BookingConfirmation({
                property: {
                    propertyName: propertyDetails.propertyName,
                    description: propertyDetails.description,
                    image: propertyDetails.image,
                    propertyContact: propertyDetails.propertyContact,
                    propertyEmail: propertyDetails.propertyEmail,
                    propertyCode: propertyDetails.propertyCode,
                },
                room: {
                    roomName: room.roomName,
                    roomType: room.roomType,
                    roomView: room.roomView,
                    maxOccupancy: room.maxOccupancy,
                },
                reservation: bookingDetails,
                propertyAddress: propertyDetails.propertyAddress,
            });

            const correlationId = bookingDetails.bookingCode;

            // Email 1 - Customer
            await emailQueue.enqueueEmail({
                to: bookingDetails.email,
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

            // Email 2 - Property (with other emails in CC)
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
            console.error(
                'Error sending reservation confirmation email:',
                error
            );
        }
    }

    public async reservationUpdatedEmail(
        bookingDetails: IBookingDetails
    ): Promise<void> {
        try {
            const propertyDetails = await getPropertyDetails(
                bookingDetails.propertyCode,
                bookingDetails.roomTypeCode
            );
            if (!propertyDetails || !propertyDetails.propertyAddress) return;

            const room = propertyDetails.propertyRooms[0];
            if (!room) return;

            const propertyEmails =
                await this.propertyEmailRepository.getPropertyEmails(
                    propertyDetails.id
                );
            const ccEmails = propertyEmails
                .map(e => e.email)
                .filter(e => e !== propertyDetails.propertyEmail);

            const htmlTemplate = EmailTemplates.BookingAmendment({
                property: {
                    propertyName: propertyDetails.propertyName,
                    description: propertyDetails.description,
                    image: propertyDetails.image,
                    propertyContact: propertyDetails.propertyContact,
                    propertyEmail: propertyDetails.propertyEmail,
                    propertyCode: propertyDetails.propertyCode,
                },
                room: {
                    roomName: room.roomName,
                    roomType: room.roomType,
                    roomView: room.roomView,
                    maxOccupancy: room.maxOccupancy,
                },
                reservation: bookingDetails,
                propertyAddress: propertyDetails.propertyAddress,
            });

            const correlationId = bookingDetails.bookingCode;

            // Email 1 - Customer
            await emailQueue.enqueueEmail({
                to: bookingDetails.email,
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

            // Email 2 - Property (with other emails in CC)
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

    public async reservationCancelEmail(
        bookingDetails: IBookingDetails
    ): Promise<void> {
        try {
            const propertyDetails = await getPropertyDetails(
                bookingDetails.propertyCode,
                bookingDetails.roomTypeCode
            );
            if (!propertyDetails || !propertyDetails.propertyAddress) return;

            const room = propertyDetails.propertyRooms[0];
            if (!room) return;

            const propertyEmails =
                await this.propertyEmailRepository.getPropertyEmails(
                    propertyDetails.id
                );
            const ccEmails = propertyEmails
                .map(e => e.email)
                .filter(e => e !== propertyDetails.propertyEmail);

            const htmlTemplate = EmailTemplates.BookingCancellation({
                property: {
                    propertyName: propertyDetails.propertyName,
                    description: propertyDetails.description,
                    image: propertyDetails.image,
                    propertyContact: propertyDetails.propertyContact,
                    propertyEmail: propertyDetails.propertyEmail,
                    propertyCode: propertyDetails.propertyCode,
                },
                room: {
                    roomName: room.roomName,
                    roomType: room.roomType,
                    roomView: room.roomView,
                    maxOccupancy: room.maxOccupancy,
                },
                reservation: bookingDetails,
                propertyAddress: propertyDetails.propertyAddress,
            });

            const correlationId = bookingDetails.bookingCode;

            // Email 1 - Customer
            await emailQueue.enqueueEmail({
                to: bookingDetails.email,
                cc: [],
                subject:
                    'Your Reservation Cancellation Confirmation - RevChill',
                htmlContent: htmlTemplate,
                priority: 'high',
                meta: {
                    template: 'reservation_cancel_customer',
                    event: 'reservation_cancel',
                    correlationId,
                },
            });

            // Email 2 - Property (with other emails in CC)
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
