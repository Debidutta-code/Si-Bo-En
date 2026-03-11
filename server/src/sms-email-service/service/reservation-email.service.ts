import { IBookingDetails } from "../../pms/frontoffice/reservation/types";
import { getPropertyByPropertyCode, getPropertyDetails, sendEmail } from "../utils";
import { EmailTemplates } from "../templatesss";
import { PropertyEmailRepository } from "../reposititory";

export class ReservationEmailService {
    private propertyEmailRepository: PropertyEmailRepository;

    constructor() {
        this.propertyEmailRepository = new PropertyEmailRepository();
    }

    public async reservationConfirmation(bookingDetails: IBookingDetails): Promise<void> {

        try {
            const property = await getPropertyByPropertyCode(bookingDetails.propertyCode);
            if(!property) return;

            const propertyDetails = await getPropertyDetails(property.id, bookingDetails.roomTypeCode);
            if (!propertyDetails || !propertyDetails.propertyAddress) return;

            const room = propertyDetails.propertyRooms[0];
            if (!room) return;

            const propertyEmails = await this.propertyEmailRepository.getPropertyEmails(propertyDetails.id);
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
                    propertyCode: propertyDetails.propertyCode
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

            // Email 1 - Customer
            await sendEmail(
                bookingDetails.email,
                [],
                "Your Reservation Confirmation - RevChill",
                htmlTemplate
            );

            // Email 2 - Property (with other emails in CC)
            await sendEmail(
                propertyDetails.propertyEmail,
                ccEmails,
                "New Reservation - RevChill",
                htmlTemplate
            );

        } catch (error) {
            console.error("Error sending reservation confirmation email:", error);
        }
    }

    public async reservationUpdatedEmail(bookingDetails: IBookingDetails): Promise<void> {
        try {
            const propertyDetails = await getPropertyDetails(bookingDetails.propertyCode, bookingDetails.roomTypeCode);
            if (!propertyDetails || !propertyDetails.propertyAddress) return;

            const room = propertyDetails.propertyRooms[0];
            if (!room) return;

            const propertyEmails = await this.propertyEmailRepository.getPropertyEmails(propertyDetails.id);
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
                    propertyCode: propertyDetails.propertyCode
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

            // Email 1 - Customer
            await sendEmail(
                bookingDetails.email,
                [],
                "Your Reservation Has Been Updated - RevChill",
                htmlTemplate
            );

            // Email 2 - Property (with other emails in CC)
            await sendEmail(
                propertyDetails.propertyEmail,
                ccEmails,
                "Reservation Updated - RevChill",
                htmlTemplate
            );

        } catch (error) {
            console.error("Error sending reservation updated email:", error);
        }
    }

    public async reservationCancelEmail(bookingDetails: IBookingDetails): Promise<void> {
        try {
            const propertyDetails = await getPropertyDetails(bookingDetails.propertyCode, bookingDetails.roomTypeCode);
            if (!propertyDetails || !propertyDetails.propertyAddress) return;

            const room = propertyDetails.propertyRooms[0];
            if (!room) return;

            const propertyEmails = await this.propertyEmailRepository.getPropertyEmails(propertyDetails.id);
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
                    propertyCode: propertyDetails.propertyCode
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

            // Email 1 - Customer
            await sendEmail(
                bookingDetails.email,
                [],
                "Your Reservation Cancellation Confirmation - RevChill",
                htmlTemplate
            );

            // Email 2 - Property (with other emails in CC)
            await sendEmail(
                propertyDetails.propertyEmail,
                ccEmails,
                "Reservation Cancelled - RevChill",
                htmlTemplate
            );

        } catch (error) {
            console.error("Error sending reservation cancellation email:", error);
        }
    }
}