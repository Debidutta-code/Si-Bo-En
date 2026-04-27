import puppeteer from 'puppeteer';

import {
    IGenerateReportRequest,
    IArrivalReport,
    IDepartureReport,
} from '../interfaces';
import { successResponse, errorResponse } from '../../utils/return';
import { ReportsRepository } from '../dao/reports.dao';
import { ExcelExportService } from './xl.service';
import {
    generateBookingInvoiceHTML,
    generateBookingVoucherHTML,
} from '../templates';
import {
    IGuestReport,
    IGuestsData,
    IReservationReport,
    ReportType,
} from '../interfaces/reports.type';

export class ReportsService {
    private reportsRepository: ReportsRepository;
    private excelExportService: ExcelExportService;

    constructor() {
        this.reportsRepository = new ReportsRepository();
        this.excelExportService = new ExcelExportService();
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

    public async generatePropertyReport(request: IGenerateReportRequest) {
        try {
            const { propertyId, reportType, startDate, endDate } = request;

            // Validate dates
            const start = startDate ? new Date(startDate) : new Date();
            const end = endDate ? new Date(endDate) : new Date();

            // Get property details
            const property =
                await this.reportsRepository.getPropertyDetails(propertyId);

            if (!property) {
                return errorResponse('Property not found');
            }

            let reportData: any;
            let fileName: string;

            switch (reportType) {
                case ReportType.GUEST:
                    reportData = await this.generateGuestReport(propertyId);
                    fileName = `guest-report-${property.propertyCode}-${start.toISOString().split('T')[0]}.xlsx`;
                    break;

                case ReportType.RESERVATION:
                    reportData = await this.generateReservationReport(
                        propertyId,
                        start,
                        end
                    );
                    fileName = `reservation-report-${property.propertyCode}-${start.toISOString().split('T')[0]}.xlsx`;
                    break;

                case ReportType.ARRIVAL:
                    reportData = await this.generateArrivalReport(
                        propertyId,
                        start,
                        end
                    );
                    fileName = `arrival-report-${property.propertyCode}-${start.toISOString().split('T')[0]}.xlsx`;
                    break;

                case ReportType.DEPARTURE:
                    reportData = await this.generateDepartureReport(
                        propertyId,
                        start,
                        end
                    );
                    fileName = `departure-report-${property.propertyCode}-${start.toISOString().split('T')[0]}.xlsx`;
                    break;

                default:
                    return errorResponse('Invalid report type');
            }

            // Generate Excel
            const excelBuffer =
                await this.excelExportService.generateExcelReport(
                    reportType as ReportType,
                    reportData,
                    property.propertyName,
                    {
                        startDate: start.toISOString(),
                        endDate: end.toISOString(),
                    }
                );

            return successResponse('Report generated successfully', {
                file: excelBuffer,
                fileName: fileName,
                contentType:
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
        } catch (error) {
            console.error('Error generating property report:', error);
            return errorResponse(
                'Failed to generate report',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    private async generateGuestReport(
        propertyId: string
    ): Promise<IGuestReport> {
        const guests =
            await this.reportsRepository.getGuestsByProperty(propertyId);

        const guestData = guests.map(guest => {
            const totalReservations = guest.primaryReservations.length;
            const totalSpent = guest.primaryReservations.reduce(
                (sum, res) => sum + Number(res.amount),
                0
            );
            const lastVisit =
                guest.primaryReservations.length > 0
                    ? guest.primaryReservations.sort(
                        (a, b) =>
                            new Date(b.reservationStartDate).getTime() -
                            new Date(a.reservationEndDate).getTime()
                    )[0].reservationStartDate
                    : null;

            return {
                id: guest.id,
                firstName: guest.firstName,
                lastName: guest.lastName,
                email: guest.email,
                phoneNumber: guest.phoneNumber,
                userType: guest.userType,
                totalReservations,
                totalSpent,
                lastVisit,
            };
        });

        return {
            totalGuests: guests.length,
            guests: guestData,
        };
    }

    private async generateReservationReport(
        propertyId: string,
        startDate: Date,
        endDate: Date
    ): Promise<IReservationReport> {
        const stats = await this.reportsRepository.getPropertyReservationStats(
            propertyId,
            startDate,
            endDate
        );

        const reservations =
            await this.reportsRepository.getReservationsByDateRange(
                propertyId,
                startDate,
                endDate
            );

        const reservationData = reservations.map(res => {
            const guestsData = (res.guests as IGuestsData) || {
                adults: 0,
                children: 0,
                infants: 0,
            };
            const numberOfGuests =
                (guestsData.adults || 0) +
                (guestsData.children || 0) +
                (guestsData.infants || 0);

            const checkIn = new Date(res.reservationStartDate);
            const checkOut = new Date(res.reservationEndDate);
            const numberOfNights = Math.ceil(
                (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
                id: res.id,
                bookingCode: res.bookingCode,
                bookedAt: res.bookedAt,
                bookingStatus: res.bookingStatus,
                checkInDate: res.reservationStartDate,
                checkOutDate: res.reservationEndDate,
                numberOfNights,
                numberOfGuests,
                amount: Number(res.amount),
                paidAmount: Number(res.paidAmount),
                bookingSource: res.bookingSource,
                primaryGuestName: res.primaryGuest
                    ? `${res.primaryGuest.firstName} ${res.primaryGuest.lastName}`
                    : 'N/A',
                primaryGuestEmail: res.primaryGuest?.email || null,
                primaryGuestPhone: res.primaryGuest?.phoneNumber || null,
                roomTypeCode: res.roomTypeCode,
                ratePlanCode: res.ratePlanCode,
            };
        });

        const totalPaid = reservations
            .filter(r => r.bookingStatus === 'confirmed')
            .reduce((sum, r) => sum + Number(r.paidAmount), 0);

        const totalOutstanding = reservations
            .filter(r => r.bookingStatus === 'confirmed')
            .reduce(
                (sum, r) => sum + (Number(r.amount) - Number(r.paidAmount)),
                0
            );

        return {
            totalReservations: stats.total,
            reservations: reservationData,
            summary: {
                confirmedReservations: stats.confirmed,
                cancelledReservations: stats.cancelled,
                pendingReservations:
                    stats.total - stats.confirmed - stats.cancelled,
                totalRevenue: stats.totalRevenue,
                totalPaid,
                totalOutstanding,
            },
        };
    }

    private async generateArrivalReport(
        propertyId: string,
        startDate: Date,
        endDate: Date
    ): Promise<IArrivalReport> {
        const arrivals =
            await this.reportsRepository.getReservationsByDateRange(
                propertyId,
                startDate,
                endDate
            );

        const arrivalData = arrivals.map(res => {
            const guestsData = (res.guests as IGuestsData) || {
                adults: 0,
                children: 0,
                infants: 0,
            };
            const numberOfGuests =
                (guestsData.adults || 0) +
                (guestsData.children || 0) +
                (guestsData.infants || 0);

            const checkIn = new Date(res.reservationStartDate);
            const checkOut = new Date(res.reservationEndDate);
            const numberOfNights = Math.ceil(
                (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
                id: res.id,
                bookingCode: res.bookingCode,
                bookingStatus: res.bookingStatus,
                checkInDate: res.reservationStartDate,
                checkOutDate: res.reservationEndDate,
                numberOfNights,
                numberOfGuests,
                amount: Number(res.amount),
                primaryGuestName: res.primaryGuest
                    ? `${res.primaryGuest.firstName} ${res.primaryGuest.lastName}`
                    : 'N/A',
                primaryGuestEmail: res.primaryGuest?.email || null,
                primaryGuestPhone: res.primaryGuest?.phoneNumber || null,
                roomTypeCode: res.roomTypeCode,
                ratePlanCode: res.ratePlanCode,
            };
        });

        return {
            totalArrivals: arrivals.length,
            arrivals: arrivalData,
        };
    }

    private async generateDepartureReport(
        propertyId: string,
        startDate: Date,
        endDate: Date
    ): Promise<IDepartureReport> {
        const departures = await this.reportsRepository.getDeparturesForDate(
            propertyId,
            startDate
        );

        const departureData = departures.map(res => {
            const guestsData = (res.guests as IGuestsData) || {
                adults: 0,
                children: 0,
                infants: 0,
            };
            const numberOfGuests =
                (guestsData.adults || 0) +
                (guestsData.children || 0) +
                (guestsData.infants || 0);

            const checkIn = new Date(res.reservationStartDate);
            const checkOut = new Date(res.reservationEndDate);
            const numberOfNights = Math.ceil(
                (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
                id: res.id,
                bookingCode: res.bookingCode,
                bookingStatus: res.bookingStatus,
                checkInDate: res.reservationStartDate,
                checkOutDate: res.reservationEndDate,
                numberOfNights,
                numberOfGuests,
                amount: Number(res.amount),
                paidAmount: Number(res.paidAmount),
                primaryGuestName: res.primaryGuest
                    ? `${res.primaryGuest.firstName} ${res.primaryGuest.lastName}`
                    : 'N/A',
                primaryGuestEmail: res.primaryGuest?.email || null,
                primaryGuestPhone: res.primaryGuest?.phoneNumber || null,
                roomTypeCode: res.roomTypeCode,
                ratePlanCode: res.ratePlanCode,
            };
        });

        return {
            totalDepartures: departures.length,
            departures: departureData,
        };
    }
}
