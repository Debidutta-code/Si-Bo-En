import { Request, Response } from "express";
import { fikafiPaymentService } from "../service/fikafi.service";
import { PropertyRequest } from "../../utils";
import prisma from "../../config/prisma.client";

interface FikafiGuestDetails {
  guestName: string;
  phoneNum?: string;
  email: string;
}

interface FikafiBookingDetails {
  propertyId: string;
  propertyName: string;
  referenceDetails: string;
  communicationMode: "WHATSAPP" | "EMAIL";
  arrivalDate: string;
  numberOfNights: number;
}

interface FikafiPaymentDetails {
  currency: string;
  totalAmounts: number;
  numOfPayments: number;
  validity: "3 hours" | "8 hours" | "24 hours" | "3 days" | "7 days";
  payments: Array<{
    paymentNumber: number;
    paymentName: string;
    amount: number;
    dueDate: string;
  }>;
}

interface FikafiReturnUrl {
  success_url: string;
  failed_url: string;
}

interface FikafiWebhook {
  payment_details_url: string;
  payment_event_url: string;
}

interface FikafiPaymentRequestBody {
  bookingRefNum: string;
  guestDetails: FikafiGuestDetails;
  country: string;
  bookingDetails: FikafiBookingDetails;
  paymentDetails: FikafiPaymentDetails;
  returnURL: FikafiReturnUrl;
  webhook: FikafiWebhook;
}

export class FikafiPaymentController {
  /**
   * Create a Fikafi payment link for a booking
   * POST /api/v1/fikafi/create-payment-link
   */
  public static async createPaymentLink(req: Request, res: Response) {
    try {
      const {
        bookingRefNum,
        guestDetails,
        country,
        bookingDetails,
        paymentDetails,
        returnURL,
        webhook,
      } = req.body as FikafiPaymentRequestBody;

      console.log('Incoming bookingDetails:', bookingDetails);

      // Validate required fields
      if (!bookingRefNum || !guestDetails || !country || !bookingDetails || !paymentDetails || !returnURL || !webhook) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // Validate guest details
      if (!guestDetails.guestName || (!guestDetails.phoneNum && !guestDetails.email)) {
        return res.status(400).json({
          success: false,
          message: "Guest name and at least one contact (phone or email) are required",
        });
      }

      // Validate booking details
      if (
          !bookingDetails.propertyId ||
          !bookingDetails.referenceDetails ||
          !bookingDetails.communicationMode ||
          !bookingDetails.arrivalDate ||
          !bookingDetails.numberOfNights
      ) {
          return res.status(400).json({
              success: false,
              message: 'Incomplete booking details',
          });
      }

      // Validate payment details
      if (!paymentDetails.currency || !paymentDetails.totalAmounts || !paymentDetails.numOfPayments || !paymentDetails.validity || !paymentDetails.payments?.length) {
        return res.status(400).json({
          success: false,
          message: "Incomplete payment details",
        });
      }

      const result = await fikafiPaymentService.createPaymentLink({
        bookingRefNum,
        guestDetails,
        country,
        bookingDetails,
        paymentDetails,
        returnURL,
        webhook,
      });

      if (result.success && result.data) {
        return res.status(200).json({
          success: true,
          message: "Payment link created successfully",
          data: {
            paymentLink: result.data.paymentLink,
            paymentId: result.data.paymentId,
            expiresAt: result.data.expiresAt,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.error || "Failed to create payment link",
        });
      }
    } catch (error: any) {
      console.error("Error creating Fikafi payment link:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
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
          message: "Payment ID is required",
        });
      }

      const result = await fikafiPaymentService.getPaymentStatus(paymentId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Error fetching payment status:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error?.message,
      });
    }
  }

  /**
   * Generate Fikafi payment link from reservation
   * This is a helper endpoint that creates the payment link from existing reservation data
   * POST /api/v1/fikafi/generate-from-reservation
   */
  public static async generateFromReservation(req: PropertyRequest, res: Response) {
    try {
      const { reservationId } = req.body;

      if (!reservationId) {
        return res.status(400).json({
          success: false,
          message: "Reservation ID is required",
        });
      }

      // Fetch reservation from database
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
          message: "Reservation not found",
        });
      }

      // Calculate number of nights
      const checkInDate = new Date(reservation.checkInDate);
      const checkOutDate = new Date(reservation.checkOutDate);
      const numberOfNights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Get property configuration for payment settings
      const propertyConfigs = await prisma.propertyConfigs.findUnique({
        where: { propertyId: reservation.propertyId },
      });

      // Construct Fikafi request from reservation data
      const fikafiRequest: FikafiPaymentRequestBody = {
        bookingRefNum: reservation.bookingCode,
        guestDetails: {
          guestName: `${reservation.primaryGuest.firstName} ${reservation.primaryGuest.lastName}`,
          phoneNum: reservation.primaryGuest.phoneNumber || undefined,
          email: reservation.primaryGuest.email || "",
        },
        country: reservation.countryCode || "AE",
        bookingDetails: {
          propertyId: reservation.property?.id || "",
          propertyName: reservation.property?.propertyName || "",
          referenceDetails: reservation.bookingCode,
          communicationMode: reservation.primaryGuest.email ? "EMAIL" : "WHATSAPP",
          arrivalDate: checkInDate.toISOString().split("T")[0],
          numberOfNights,
        },
        paymentDetails: {
          currency: reservation.currencyCode || "AED",
          totalAmounts: reservation.amount || 0,
          numOfPayments: 1,
          validity: "24 hours",
          payments: [
            {
              paymentNumber: 1,
              paymentName: "Full Payment",
              amount: reservation.amount || 0,
              dueDate: new Date().toISOString().split("T")[0],
            },
          ],
        },
        returnURL: {
          success_url: `${process.env.FRONTEND_URL}/PaymentSuccess?bookingCode=${reservation.bookingCode}`,
          failed_url: `${process.env.FRONTEND_URL}/PaymentFailed?bookingCode=${reservation.bookingCode}`,
        },
        webhook: {
          payment_details_url: `${process.env.BACKEND_URL}/api/v1/fikafi/webhook/payment-details`,
          payment_event_url: `${process.env.BACKEND_URL}/api/v1/fikafi/webhook/payment-event`,
        },
      };

      const result = await fikafiPaymentService.createPaymentLink(fikafiRequest);

      if (result.success && result.data) {
        // Optionally save the payment link to the reservation
        await prisma.reservation.update({
          where: { id: reservationId },
          data: {
            paymentMethod: "payment_gateway",
            // You can add a field to store the Fikafi payment ID if needed
          },
        });

        return res.status(200).json({
          success: true,
          message: "Payment link generated successfully",
          data: {
            paymentLink: result.data.paymentLink,
            paymentId: result.data.paymentId,
            expiresAt: result.data.expiresAt,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.error || "Failed to generate payment link",
        });
      }
    } catch (error: any) {
      console.error("Error generating Fikafi payment link from reservation:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error?.message,
      });
    }
  }

  /**
   * Handle Fikafi webhook - payment details
   * POST /api/v1/fikafi/webhook/payment-details
   */
  public static async handlePaymentDetailsWebhook(req: Request, res: Response) {
    try {
      const payload = req.body;
      const signature = req.headers["x-fikafi-signature"] as string;

      // Verify webhook signature if configured
      if (process.env.FIKAFI_WEBHOOK_SECRET) {
        const isValid = fikafiPaymentService.verifyWebhookSignature(
          JSON.stringify(payload),
          signature
        );
        
        if (!isValid) {
          return res.status(401).json({
            success: false,
            message: "Invalid webhook signature",
          });
        }
      }

      // Process the webhook payload
      // This typically contains payment method details, customer info, etc.
      console.log("Fikafi Payment Details Webhook received:", payload);

      // Update reservation based on payment details if needed
      if (payload.bookingRefNum) {
        await prisma.reservation.updateMany({
          where: { bookingCode: payload.bookingRefNum },
          data: {
            // Update relevant fields based on webhook payload
            // paidAmount: payload.amountPaid,
            // paymentMethod: payload.paymentMethod,
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
      });
    } catch (error: any) {
      console.error("Error processing Fikafi payment details webhook:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Handle Fikafi webhook - payment events
   * POST /api/v1/fikafi/webhook/payment-event
   */
  public static async handlePaymentEventWebhook(req: Request, res: Response) {
    try {
      const payload = req.body;
      const signature = req.headers["x-fikafi-signature"] as string;

      // Verify webhook signature if configured
      if (process.env.FIKAFI_WEBHOOK_SECRET) {
        const isValid = fikafiPaymentService.verifyWebhookSignature(
          JSON.stringify(payload),
          signature
        );

        if (!isValid) {
          return res.status(401).json({
            success: false,
            message: "Invalid webhook signature",
          });
        }
      }

      // Process the payment event
      // Common events: payment_initiated, payment_completed, payment_failed, payment_expired
      console.log("Fikafi Payment Event Webhook received:", payload);

      const { eventType, bookingRefNum, paymentId, amount, status } = payload;

      if (bookingRefNum && eventType) {
        // Update reservation based on event type
        switch (eventType) {
          case "payment_completed":
          case "payment_success":
            await prisma.reservation.updateMany({
              where: { bookingCode: bookingRefNum },
              data: {
                paidAmount: amount || 0,
                paymentMethod: "payment_gateway",
                bookingStatus: "confirmed",
              },
            });
            break;

          case "payment_failed":
          case "payment_expired":
            await prisma.reservation.updateMany({
              where: { bookingCode: bookingRefNum },
              data: {
                bookingStatus: "pending",
              },
            });
            break;

          default:
            console.log(`Unhandled Fikafi event type: ${eventType}`);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
      });
    } catch (error: any) {
      console.error("Error processing Fikafi payment event webhook:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

