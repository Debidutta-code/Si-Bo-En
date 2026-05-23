import { emailQueue } from "../..";
import { templateSpaBookingCancellation } from "../../spa/templates/spa-booking-cancellation";
import { templateSpaBookingConfirmation } from "../../spa/templates/spa-booking-confirmation";

export class SpaEmailService {

    public async bookingConfirmed(data: {
        userName: string;
        userEmail: string;
        bookingId: string;
        managerEmails: string[];        // ← was managerEmail: string | null
        slots: {
            spaName: string;
            date: string;
            startTime: string;
            endTime: string | null;
            amount: number;
            currencyCode: string;
        }[];
        totalAmount: number;
        currencyCode: string;
    }): Promise<void> {
        try {
            const htmlContent = templateSpaBookingConfirmation(data);
            await emailQueue.enqueueEmail({
                to: data.userEmail,
                bcc: data.managerEmails,    // ← array
                subject: `Spa Booking Confirmed – Ref: ${data.bookingId}`,
                htmlContent,
                priority: 'high',
                meta: {
                    template: 'spa_booking_confirmation',
                    event: 'spa_booking_confirmed',
                    correlationId: data.bookingId,
                },
            });
        } catch (error) {
            console.error('Error sending spa booking confirmation email:', error);
        }
    }

    public async bookingCancelled(data: {
        userName: string;
        userEmail: string;
        bookingId: string;
        managerEmails: string[];        // ← was managerEmail: string | null
        cancelledSlot: {
            spaName: string;
            date: string;
            startTime: string;
            endTime: string | null;
        };
    }): Promise<void> {
        try {
            const cancelledOn = new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
            });
            const htmlContent = templateSpaBookingCancellation({
                ...data,
                cancelledOn,
            });
            await emailQueue.enqueueEmail({
                to: data.userEmail,
                bcc: data.managerEmails,    // ← array
                subject: `Spa Slot Cancelled – Ref: ${data.bookingId}`,
                htmlContent,
                priority: 'high',
                meta: {
                    template: 'spa_booking_cancellation',
                    event: 'spa_booking_cancelled',
                    correlationId: data.bookingId,
                },
            });
        } catch (error) {
            console.error('Error sending spa booking cancellation email:', error);
        }
    }
}