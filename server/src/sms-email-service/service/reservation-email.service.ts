import { IBookingDetails } from "../../pms/frontoffice/reservation/types";
import {
    getPropertyDetails,
    sendEmail
} from "../utils";
import {
    EmailTemplates
} from "../templatesss";
import {
    PropertyEmailRepository
} from "../reposititory";
export class ReservationEmailService {
    private propertyEmailRepository: PropertyEmailRepository;

    constructor() {
        this.propertyEmailRepository = new PropertyEmailRepository();
    }

    public async reservationConfirmation(bookingDetails: IBookingDetails): Promise<void> {
        try {
            const propertyDetails = await getPropertyDetails(bookingDetails.propertyCode, bookingDetails.roomTypeCode);

            if (!propertyDetails) {
                return
            }
            if (!propertyDetails.propertyAddress) {
                return
            }

            const room = propertyDetails.propertyRooms[0];
            if (!room) {
                return
            }
            const propertyEmails = await this.propertyEmailRepository.getPropertyEmails(propertyDetails.id);
            const emailsToNotify = propertyEmails.map(email => email.email);
            const htmlTemplete = EmailTemplates.BookingConfirmation({
                property: {
                    propertyName: propertyDetails.propertyName,
                    description: propertyDetails.description,
                    image: propertyDetails.image,
                    propertyContact: propertyDetails.propertyContact,
                    propertyEmail: propertyDetails.propertyEmail,
                },
                room: {
                    roomName: room.roomName,
                    roomType: room.roomType,
                    roomView: room.roomView,
                    maxOccupancy: room.maxOccupancy,
                },
                reservation: bookingDetails,
                propertyAddress: propertyDetails.propertyAddress,
            })
            await sendEmail(bookingDetails.email,[...emailsToNotify, propertyDetails.propertyEmail],  "Your Reservation Confirmation - RevChill", htmlTemplete);

        } catch (error) {
            console.error("Error sending reservation confirmation email:", error);
        }
    }

    public async reservationUpdatedEmail(bookingDetails: IBookingDetails): Promise<void> {
        try {
            const propertyDetails = await getPropertyDetails(bookingDetails.propertyCode, bookingDetails.roomTypeCode);

            if (!propertyDetails) {
                return
            }
            if (!propertyDetails.propertyAddress) {
                return
            }

            const room = propertyDetails.propertyRooms[0];
            if (!room) {
                return
            }
            const propertyEmails = await this.propertyEmailRepository.getPropertyEmails(propertyDetails.id);
            const emailsToNotify = propertyEmails.map(email => email.email);
            const htmlTemplate = EmailTemplates.BookingAmendment({
                property: {
                    propertyName: propertyDetails.propertyName,
                    description: propertyDetails.description,
                    image: propertyDetails.image,
                    propertyContact: propertyDetails.propertyContact,
                    propertyEmail: propertyDetails.propertyEmail,
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

            await sendEmail(
                bookingDetails.email,
                [...emailsToNotify, propertyDetails.propertyEmail],
                "Your Reservation Has Been Updated - RevChill",
                htmlTemplate
            );
            //console.log("Reservation updated email sent successfully:", res);

        } catch (error) {
            console.error("Error sending reservation updated email:", error);
        }
    }

    public async reservationCancelEmail(bookingDetails: IBookingDetails): Promise<void> {
        try {

            const propertyDetails = await getPropertyDetails(bookingDetails.propertyCode, bookingDetails.roomTypeCode);

            if (!propertyDetails) {
                return
            }
            if (!propertyDetails.propertyAddress) {
                return
            }

            const room = propertyDetails.propertyRooms[0];
            if (!room) {
                //console.log("Room Not found for sending an email")
                return
            }
            const propertyEmails = await this.propertyEmailRepository.getPropertyEmails(propertyDetails.id);
            const emailsToNotify = propertyEmails.map(email => email.email);
            const htmlTemplate = EmailTemplates.BookingCancellation({
                property: {
                    propertyName: propertyDetails.propertyName,
                    description: propertyDetails.description,
                    image: propertyDetails.image,
                    propertyContact: propertyDetails.propertyContact,
                    propertyEmail: propertyDetails.propertyEmail,
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

            await sendEmail(
                bookingDetails.email,
                [...emailsToNotify, propertyDetails.propertyEmail],
                "Your Reservation Cancellation Confirmation - RevChill",
                htmlTemplate
            );
            //console.log("Reservation cancellation email sent successfully:", res);

        } catch (error) {
            console.error("Error sending reservation cancellation email:", error);
        }
    }
}