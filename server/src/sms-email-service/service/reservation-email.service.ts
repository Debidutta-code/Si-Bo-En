import { IBookingDetails } from "../../pms/frontoffice/reservation/types";
import {
    getPropertyDetails,
    sendEmail
} from "../utils";
import {
    EmailTemplates
} from "../templatesss";
export class ReservationEmailService {
    public async reservationConfirmation(bookingDetails: IBookingDetails):Promise<void> {
        console.log(bookingDetails)
        try {
            const propertyDetails = await getPropertyDetails(bookingDetails.propertyCode, bookingDetails.roomTypeCode);

            if(!propertyDetails) {
                console.log("Property Not found for sending an email")
                return
            }
            if(!propertyDetails.propertyAddress) {
                console.log("Property Address Not found for sending an email")
                return
            }

            const room=propertyDetails.propertyRooms[0];
            if(!room) {
                console.log("Room Not found for sending an email")
                return
            }
            const htmlTemplete= EmailTemplates.BookingConfirmation({
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
            const res=await sendEmail(bookingDetails.email, "Your Reservation Confirmation - SwiftRooms", htmlTemplete);
            console.log("Email sent successfully:", res);

        } catch (error) {
            console.error("Error sending reservation confirmation email:", error);
        }
    }

    public async reservationUpdatedEmail(bookingDetails: IBookingDetails): Promise<void> {
        try {
            const propertyDetails = await getPropertyDetails(bookingDetails.propertyCode, bookingDetails.roomTypeCode);

            if(!propertyDetails) {
                console.log("Property Not found for sending an email")
                return
            }
            if(!propertyDetails.propertyAddress) {
                console.log("Property Address Not found for sending an email")
                return
            }

            const room = propertyDetails.propertyRooms[0];
            if(!room) {
                console.log("Room Not found for sending an email")
                return
            }

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

            const res = await sendEmail(
                bookingDetails.email, 
                "Your Reservation Has Been Updated - SwiftRooms", 
                htmlTemplate
            );
            console.log("Reservation updated email sent successfully:", res);

        } catch (error) {
            console.error("Error sending reservation updated email:", error);
        }
    }

    public async reservationCancelEmail(bookingDetails: IBookingDetails): Promise<void> {
        try {
                    console.log(bookingDetails)

            const propertyDetails = await getPropertyDetails(bookingDetails.propertyCode, bookingDetails.roomTypeCode);

            if(!propertyDetails) {
                console.log("Property Not found for sending an email")
                return
            }
            if(!propertyDetails.propertyAddress) {
                console.log("Property Address Not found for sending an email")
                return
            }

            const room = propertyDetails.propertyRooms[0];
            if(!room) {
                console.log("Room Not found for sending an email")
                return
            }

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

            const res = await sendEmail(
                bookingDetails.email, 
                "Your Reservation Cancellation Confirmation - SwiftRooms", 
                htmlTemplate
            );
            console.log("Reservation cancellation email sent successfully:", res);

        } catch (error) {
            console.error("Error sending reservation cancellation email:", error);
        }
    }
}