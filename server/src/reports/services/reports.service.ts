import puppeteer from 'puppeteer';
import { successResponse, errorResponse } from '../../utils/return';
import { ReportsRepository } from '../dao/reports.dao';
import {  generateBookingVoucherHTML } from '../templates';

export class ReportsService {
    private reportsRepository: ReportsRepository;

    constructor() {
        this.reportsRepository = new ReportsRepository();
    }

    /**
     * Build a unified price object from PricingBreakdown + all its DB relations.
     * Single source of truth — no reliance on the finalPrice JSON blob (which can be null).
     */
    private buildPriceData(pricingBreakdown: any, currencyCode: string) {
        if (!pricingBreakdown) return null;

        const daily      = pricingBreakdown.DailyPriceBrakeDown ?? [];
        const taxes      = pricingBreakdown.taxBrakeDown        ?? [];
        const addons     = pricingBreakdown.AddonBrakeDowns     ?? [];
        const promotions = pricingBreakdown.promotionBrakeDown  ?? [];

        const numberOfNights = new Set(daily.map((d: any) => new Date(d.date).toDateString())).size || daily.length || 1;
        const requestedRooms = new Set(daily.map((d: any) => d.roomNumber)).size || 1;

        return {
            // ── Totals ──────────────────────────────────────────────────────
            totalAmount:             Number(pricingBreakdown.totalAmount),
            amountBeforeTax:         Number(pricingBreakdown.amountBeforeTax),
            taxedAmount:             Number(pricingBreakdown.taxedAmount),
            totalAddonAmount:        Number(pricingBreakdown.totalAddonAmount),
            totalPromotionAmount:    Number(pricingBreakdown.totalPromotionAmount),
            currentChargeableAmount: Number(pricingBreakdown.currentChargeableAmount),
            latterpayableAmount:     Number(pricingBreakdown.latterpayableAmount),
            promoCodeDiscount:       Number(pricingBreakdown.promoCodeDiscount),
            loyalityDiscount:        Number(pricingBreakdown.loyalityDiscount),
            currencyCode:            pricingBreakdown.currencyCode || currencyCode,

            // ── Computed ────────────────────────────────────────────────────
            numberOfNights,
            requestedRooms,
            baseRatePerNight: numberOfNights > 0
                ? Number(pricingBreakdown.amountBeforeTax) / numberOfNights
                : 0,

            // ── Daily breakdown ─────────────────────────────────────────────
            dailyPriceBrakeDown: daily.map((d: any) => ({
                date:                    d.date,
                roomNumber:              d.roomNumber,
                guestDistribution:       d.guestDistribution ?? null,
                baseChargesAmount:       Number(d.baseChargesAmount),
                additionalChargesAmount: Number(d.additionalChargesAmount),
                totalAmount:             Number(d.totalAmount),
                currencyCode:            d.currencyCode || currencyCode,
            })),

            // ── Taxes ────────────────────────────────────────────────────────
            taxBrakeDown: taxes.map((t: any) => ({
                name:         t.name,
                taxedAmount:  Number(t.taxedAmount),
                currencyCode: t.currencyCode || currencyCode,
            })),

            // ── Add-ons ──────────────────────────────────────────────────────
            addonBrakeDown: addons.map((a: any) => ({
                addonId:      a.addonId,
                name:         a.name,
                amount:       Number(a.amount),
                quantity:     Number(a.quantity),
                totalAmount:  Number(a.totalAmount),
                currencyCode: a.currencyCode || currencyCode,
                date:         a.date,
                type:         a.type,
            })),

            // ── Promotions ───────────────────────────────────────────────────
            promotionBrakeDown: promotions.map((p: any) => ({
                id:              p.id,
                name:            p.name,
                promotionType:   p.promotionType,
                discountType:    p.discountType,
                discountValue:   Number(p.discountValue),
                discountAmount:  Number(p.discountAmount),
                currencyCode:    p.currencyCode || currencyCode,
                restrictionType: p.restrictionType,
                type:            p.type,
            })),
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  BOOKING VOUCHER
    // ─────────────────────────────────────────────────────────────────────────
    public async getBookingVoucher(bookingCode: string) {
        try {
            const reservation = await this.reportsRepository.getReservationDetails(bookingCode);
            if (!reservation) {
                return errorResponse('Reservation not found', 'No reservation found with this booking code');
            }

            const property  = reservation.property;
            const priceData = this.buildPriceData(reservation.PricingBrakeDown, reservation.currencyCode);

            const voucherData = {
                property: {
                    propertyName:      property.propertyName,
                    propertyEmail:     property.propertyEmail,
                    propertyContact:   property.propertyContact,
                    propertyCode:      property.propertyCode,
                    description:       property.description,
                    image:             property.image,
                    logo:              property.bookingEngineConfig?.logo ?? property.image?.[0] ?? null,
                    primaryColor:      property.bookingEngineConfig?.primaryColor ?? '#1e293b',
                    starRating:        property.starRating,
                    propertyAddress:   property.propertyAddress   ?? null,
                    propertyAmenities: property.propertyAmenities ?? [],
                },
                room:         reservation.room ?? null,
                ratePlanName: reservation.ratePlanName ?? reservation.ratePlanCode,
                reservation: {
                    bookingCode:    reservation.bookingCode,
                    checkInDate:    reservation.reservationStartDate,
                    checkOutDate:   reservation.reservationEndDate,
                    numberOfGuests: reservation.reservationGuests?.length ?? 0,
                    bookingSource:  reservation.bookingSource,
                    bookingStatus:  reservation.bookingStatus,
                    amount:         reservation.amount,
                    paidAmount:     reservation.paidAmount,
                    currencyCode:   reservation.currencyCode,
                    createdAt:      reservation.createdAt,
                    roomTypeCode:   reservation.roomTypeCode,
                    ratePlanCode:   reservation.ratePlanCode,
                    guests:         reservation.guests,
                    paymentMethod:  reservation.paymentMethod,
                },
                reservationGuests: reservation.reservationGuests ?? [],
                primaryGuest: reservation.primaryGuest
                    ? {
                          firstName:            reservation.primaryGuest.firstName,
                          lastName:             reservation.primaryGuest.lastName,
                          email:                reservation.primaryGuest.email,
                          phoneNumber:          reservation.primaryGuest.phoneNumber,
                          userType:             reservation.primaryGuest.userType,
                          userIdentityCardType: reservation.primaryGuest.userIdentityCardType,
                          identityCardNumber:   reservation.primaryGuest.identityCardNumber,
                      }
                    : null,
                addOns: reservation.addOns.map((addon: any) => ({
                    name:       addon.name,
                    quantity:   addon.quantity,
                    totalPrice: addon.totalPrice,
                    unitPrice:  addon.unitPrice,
                    date:       addon.date,
                    type:       addon.type,
                    images:     addon.addon?.images ?? [],
                })),
                priceData,
            };

            const html = generateBookingVoucherHTML(voucherData);
            const pdf  = await this.generatePdf(html);

            return {
                success: true,
                message: 'Booking voucher generated successfully',
                data: {
                    pdf,
                    fileName:    `booking-voucher-${bookingCode}.pdf`,
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

    // ─────────────────────────────────────────────────────────────────────────
    //  BOOKING INVOICE
    // ─────────────────────────────────────────────────────────────────────────
    public async generateBookingInvoice(bookingCode: string) {
        try {
            const reservation = await this.reportsRepository.getReservationDetails(bookingCode);
            if (!reservation) {
                return errorResponse('Reservation not found', 'No reservation found with this booking code');
            }

            const property  = reservation.property;
            const priceData = this.buildPriceData(reservation.PricingBrakeDown, reservation.currencyCode);

            const invoiceData = {
                property: {
                    propertyName:    property.propertyName,
                    propertyEmail:   property.propertyEmail,
                    propertyContact: property.propertyContact,
                    propertyCode:    property.propertyCode,
                    description:     property.description,
                    image:           property.image,
                    starRating:      property.starRating,
                    propertyAddress: property.propertyAddress ?? null,
                },
                reservation: {
                    bookingCode:   reservation.bookingCode,
                    checkInDate:   reservation.reservationStartDate,
                    checkOutDate:  reservation.reservationEndDate,
                    bookingSource: reservation.bookingSource,
                    bookingStatus: reservation.bookingStatus,
                    amount:        reservation.amount,
                    paidAmount:    reservation.paidAmount,
                    currencyCode:  reservation.currencyCode,
                    createdAt:     reservation.createdAt,
                    roomTypeCode:  reservation.roomTypeCode,
                    ratePlanCode:  reservation.ratePlanCode,
                    paymentMethod: reservation.paymentMethod,
                    guests:        reservation.guests,
                },
                primaryGuest: reservation.primaryGuest
                    ? {
                          firstName:            reservation.primaryGuest.firstName,
                          lastName:             reservation.primaryGuest.lastName,
                          email:                reservation.primaryGuest.email,
                          phoneNumber:          reservation.primaryGuest.phoneNumber,
                          userType:             reservation.primaryGuest.userType,
                          userIdentityCardType: reservation.primaryGuest.userIdentityCardType,
                          identityCardNumber:   reservation.primaryGuest.identityCardNumber,
                      }
                    : null,
                addOns: reservation.addOns.map((addon: any) => ({
                    name:       addon.name,
                    quantity:   addon.quantity,
                    totalPrice: addon.totalPrice,
                })),
                priceData,
            };

            const html = generateBookingVoucherHTML(invoiceData);
            const pdf  = await this.generatePdf(html);

            return successResponse('Invoice generated successfully', {
                pdf,
                fileName:    `invoice-${bookingCode}.pdf`,
                contentType: 'application/pdf',
            });
        } catch (error) {
            console.error('Error generating invoice:', error);
            return errorResponse(
                'Failed to generate invoice',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  SHARED PDF HELPER
    // ─────────────────────────────────────────────────────────────────────────
    private async generatePdf(html: string): Promise<Buffer> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'load' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
            });
            return Buffer.from(pdfBuffer);
        } finally {
            await browser.close();
        }
    }
}