import puppeteer from 'puppeteer';


import { successResponse, errorResponse } from '../../utils/return';
import { ReportsRepository } from '../dao/reports.dao';
import {
    generateBookingInvoiceHTML,
    generateBookingVoucherHTML,
} from '../templates';
import {
    IGuestsData
} from '../interfaces/reports.type';

export class ReportsService {
    private reportsRepository: ReportsRepository;

    constructor() {
        this.reportsRepository = new ReportsRepository();
    }

    public async getBookingVoucher(bookingCode: string) {
        try {
            const reservation =
                await this.reportsRepository.getReservationDetails(bookingCode);
            if (!reservation) {
                return errorResponse(
                    'Reservation not found',
                    'No reservation found with this booking code'
                );
            }

            const property = reservation.property;

            // Parse guests from JSON field
            const guestsData = (reservation.guests as IGuestsData) || {
                adults: 0,
                children: 0,
                infants: 0,
            };

            // Calculate nights
            const checkIn = new Date(reservation.reservationStartDate);
            const checkOut = new Date(reservation.reservationEndDate);
            const nights = Math.ceil(
                (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Get price breakdown
            const priceBreakdown = reservation.PricingBrakeDown

            // Prepare data for template
            const voucherData = {
                property: {
                    propertyName: property.propertyName,
                    propertyEmail: property.propertyEmail,
                    propertyContact: property.propertyContact,
                    propertyCode: property.propertyCode,
                    description: property.description,
                    image: property.image,
                    // ── Use logo from booking engine config ───────────────────────
                    logo: property.bookingEngineConfig?.logo ?? property.image?.[0] ?? null,
                    primaryColor: property.bookingEngineConfig?.primaryColor ?? '#1e293b',
                    starRating: property.starRating,
                    propertyAddress: property.propertyAddress,
                    propertyAmenities: property.propertyAmenities,
                },
                room: reservation.room ?? null,
                // ── Pass ratePlanName ─────────────────────────────────────────────
                ratePlanName: reservation.ratePlanName ?? reservation.ratePlanCode,
                reservation: {
                    bookingCode: reservation.bookingCode,
                    checkInDate: reservation.reservationStartDate,
                    checkOutDate: reservation.reservationEndDate,
                    numberOfGuests: reservation.reservationGuests?.length ?? 0,
                    bookingSource: reservation.bookingSource,
                    bookingStatus: reservation.bookingStatus,
                    amount: reservation.amount,
                    paidAmount: reservation.paidAmount,
                    currencyCode: reservation.currencyCode,
                    createdAt: reservation.createdAt,
                    roomTypeCode: reservation.roomTypeCode,
                    ratePlanCode: reservation.ratePlanCode,
                    guests: reservation.guests,
                    paymentMethod: reservation.paymentMethod,
                },
                reservationGuests: reservation.reservationGuests ?? [],
                primaryGuest: reservation.primaryGuest ? {
                    firstName: reservation.primaryGuest.firstName,
                    lastName: reservation.primaryGuest.lastName,
                    email: reservation.primaryGuest.email,
                    phoneNumber: reservation.primaryGuest.phoneNumber,
                    userType: reservation.primaryGuest.userType,
                    userIdentityCardType: reservation.primaryGuest.userIdentityCardType,
                    identityCardNumber: reservation.primaryGuest.identityCardNumber,
                } : null,
                addOns: reservation.addOns.map(addon => ({
                    name: addon.name,
                    quantity: addon.quantity,
                    totalPrice: addon.totalPrice,
                    unitPrice: addon.unitPrice,
                    date: addon.date,
                    type: addon.type,
                    images: addon.addon?.images ?? [],
                })),
                priceBreakdown: priceBreakdown ? {
                    totalAmount: Number(priceBreakdown.totalAmount),
                    totalTax: Number(priceBreakdown.taxedAmount),
                    baseRatePerNight: Number(priceBreakdown.DailyPriceBrakeDown.reduce((acc, curr) => acc + curr.baseChargesAmount, 0)),
                    numberOfNights: priceBreakdown.DailyPriceBrakeDown.length,
                    // requestedRooms: priceBreakdown.,
                    dailyBreakdown: priceBreakdown.DailyPriceBrakeDown.map(item => ({
                        date: item.date,
                        baseChargesAmount: item.baseChargesAmount,
                        totalAmount: item.totalAmount,
                    })),
                    breakdown: priceBreakdown,
                    tax: priceBreakdown.taxedAmount,
                } : null,
                finalPrice: reservation.finalPrice,
            };
            // Generate HTML
            const html = generateBookingVoucherHTML(voucherData);

            // Generate PDF
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm',
                },
            });

            await browser.close();

            return {
                success: true,
                message: 'Booking voucher generated successfully',
                data: {
                    pdf: Buffer.from(pdfBuffer),
                    fileName: `booking-voucher-${bookingCode}.pdf`,
                    contentType: 'application/pdf',
                },
            };
        } catch (error) {
            console.error('Error generating booking voucher:', error);
            return errorResponse(
                'Failed to generate booking voucher',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    public async generateBookingInvoice(bookingCode: string) {
        try {
            const reservation =
                await this.reportsRepository.getReservationDetails(bookingCode);

            if (!reservation) {
                return errorResponse(
                    'Reservation not found',
                    'No reservation found with this booking code'
                );
            }

            const property = reservation.property;

            // Parse guests from JSON field
            const guestsData = (reservation.guests as IGuestsData) || {
                adults: 0,
                children: 0,
                infants: 0,
            };

            // Get price breakdown
            const priceBreakdown = reservation.PricingBrakeDown;

            // Prepare data for template
            const invoiceData = {
                property: {
                    propertyName: property.propertyName,
                    propertyEmail: property.propertyEmail,
                    propertyContact: property.propertyContact,
                    propertyCode: property.propertyCode,
                    description: property.description,
                    image: property.image,
                    starRating: property.starRating,
                    propertyAddress: property.propertyAddress,
                },
                reservation: {
                    bookingCode: reservation.bookingCode,
                    checkInDate: reservation.reservationStartDate,
                    checkOutDate: reservation.reservationEndDate,
                    numberOfGuests:
                        (guestsData.adults || 0) +
                        (guestsData.children || 0) +
                        (guestsData.infants || 0),
                    bookingSource: reservation.bookingSource,
                    bookingStatus: reservation.bookingStatus,
                    amount: reservation.amount,
                    paidAmount: reservation.paidAmount,
                    currencyCode: reservation.currencyCode,
                    createdAt: reservation.createdAt,
                    roomTypeCode: reservation.roomTypeCode,
                    ratePlanCode: reservation.ratePlanCode,
                    paymentMethod: reservation.paymentMethod,
                    guests: reservation.guests,
                },
                primaryGuest: reservation.primaryGuest
                    ? {
                        firstName: reservation.primaryGuest.firstName,
                        lastName: reservation.primaryGuest.lastName,
                        email: reservation.primaryGuest.email,
                        phoneNumber: reservation.primaryGuest.phoneNumber,
                        userType: reservation.primaryGuest.userType,
                        userIdentityCardType:
                            reservation.primaryGuest.userIdentityCardType,
                        identityCardNumber:
                            reservation.primaryGuest.identityCardNumber,
                    }
                    : null,
                addOns: reservation.addOns.map(addon => ({
                    name: addon.name,
                    quantity: addon.quantity,
                    totalPrice: addon.totalPrice,
                })),
                priceBreakdown: priceBreakdown
                    ? {
                        totalAmount: Number(priceBreakdown.totalAmount),
                        totalTax: Number(priceBreakdown.taxedAmount),
                        baseRatePerNight: Number(
                            priceBreakdown.DailyPriceBrakeDown.reduce((acc, curr) => acc + curr.baseChargesAmount, 0)
                        ),
                        numberOfNights: priceBreakdown.DailyPriceBrakeDown.length,
                        additionalGuestCharges:
                            priceBreakdown.DailyPriceBrakeDown.reduce((acc, curr) => acc + curr.additionalChargesAmount, 0),
                        breakdown: priceBreakdown,
                    }
                    : null,
            };

            // Generate HTML
            const html = generateBookingInvoiceHTML(invoiceData);

            // Generate PDF
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm',
                },
            });

            await browser.close();

            return successResponse(
                'Invoice generated successfully', // message first
                {
                    // data second
                    pdf: Buffer.from(pdfBuffer),
                    fileName: `invoice-${bookingCode}.pdf`,
                    contentType: 'application/pdf',
                }
            );
        } catch (error) {
            console.error('Error generating invoice:', error);
            return errorResponse(
                'Failed to generate invoice',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }


}
