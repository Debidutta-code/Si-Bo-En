import puppeteer from 'puppeteer';
import { successResponse, errorResponse } from '../../utils/return';
import { ReportsRepository } from '../dao/reports.dao';
import { generateBookingVoucherHTML } from '../templates';
import {
    IPriceData,
    IVoucherData,
    IRawPricingBreakdown,
} from '../interfaces/reports.type';

export class ReportsService {
    private reportsRepository: ReportsRepository;

    constructor() {
        this.reportsRepository = new ReportsRepository();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  BUILD PRICE DATA  —  single source of truth from DB relations only
    //  No finalPrice JSON blob ever touched here.
    // ─────────────────────────────────────────────────────────────────────────
    private buildPriceData(
        pricingBreakdown: IRawPricingBreakdown | null,
        fallbackCurrency: string
    ): IPriceData | null {
        if (!pricingBreakdown) return null;

        const cur = pricingBreakdown.currencyCode || fallbackCurrency;

        const daily      = pricingBreakdown.DailyPriceBrakeDown  ?? [];
        const taxes      = pricingBreakdown.taxBrakeDown         ?? [];
        const addons     = pricingBreakdown.AddonBrakeDowns      ?? [];
        const promotions = pricingBreakdown.promotionBrakeDown   ?? [];

        // Unique nights = unique date strings; unique rooms = unique roomNumbers
        const numberOfNights =
            new Set(daily.map((d) => new Date(d.date).toDateString())).size ||
            daily.length ||
            1;
        const requestedRooms =
            new Set(daily.map((d) => d.roomNumber)).size || 1;

        return {
            // ── Totals ────────────────────────────────────────────────────
            totalAmount:             Number(pricingBreakdown.totalAmount),
            amountBeforeTax:         Number(pricingBreakdown.amountBeforeTax),
            taxedAmount:             Number(pricingBreakdown.taxedAmount),
            totalAddonAmount:        Number(pricingBreakdown.totalAddonAmount),
            totalPromotionAmount:    Number(pricingBreakdown.totalPromotionAmount),
            currentChargeableAmount: Number(pricingBreakdown.currentChargeableAmount),
            latterpayableAmount:     Number(pricingBreakdown.latterpayableAmount),
            promoCodeDiscount:       Number(pricingBreakdown.promoCodeDiscount),
            loyalityDiscount:        Number(pricingBreakdown.loyalityDiscount),
            currencyCode:            cur,

            // ── Computed ──────────────────────────────────────────────────
            numberOfNights,
            requestedRooms,
            baseRatePerNight:
                numberOfNights > 0
                    ? Number(pricingBreakdown.amountBeforeTax) / numberOfNights
                    : 0,

            // ── Daily breakdown ───────────────────────────────────────────
            dailyPriceBrakeDown: daily.map((d) => ({
                date:                    d.date,
                roomNumber:              d.roomNumber,
                guestDistribution:       d.guestDistribution ?? null,
                baseChargesAmount:       Number(d.baseChargesAmount),
                additionalChargesAmount: Number(d.additionalChargesAmount),
                totalAmount:             Number(d.totalAmount),
                currencyCode:            d.currencyCode || cur,
            })),

            // ── Taxes ─────────────────────────────────────────────────────
            taxBrakeDown: taxes.map((t) => ({
                name:         t.name,
                taxedAmount:  Number(t.taxedAmount),
                currencyCode: t.currencyCode || cur,
            })),

            // ── Add-ons ───────────────────────────────────────────────────
            addonBrakeDown: addons.map((a) => ({
                addonId:      a.addonId,
                name:         a.name,
                amount:       Number(a.amount),
                quantity:     Number(a.quantity),
                totalAmount:  Number(a.totalAmount),
                currencyCode: a.currencyCode || cur,
                date:         a.date,
                type:         a.type,
            })),

            // ── Promotions ────────────────────────────────────────────────
            promotionBrakeDown: promotions.map((p) => ({
                id:              p.id,
                name:            p.name,
                promotionType:   p.promotionType,
                discountType:    p.discountType,
                discountValue:   Number(p.discountValue),
                discountAmount:  Number(p.discountAmount),
                currencyCode:    p.currencyCode || cur,
                restrictionType: p.restrictionType,
                type:            p.type,
            })),
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  SHARED VOUCHER DATA BUILDER
    //  Both voucher and invoice use the same data shape — the template decides
    //  what to render.
    // ─────────────────────────────────────────────────────────────────────────
    private buildVoucherData(reservation: NonNullable<Awaited<ReturnType<ReportsRepository['getReservationDetails']>>>): IVoucherData {
        const property  = reservation.property;
        const priceData = this.buildPriceData(
            reservation.PricingBrakeDown,
            reservation.currencyCode
        );

        return {
            property: {
                propertyName:      property.propertyName,
                propertyEmail:     property.propertyEmail,
                propertyContact:   property.propertyContact,
                propertyCode:      property.propertyCode,
                description:       property.description ?? null,
                image:             property.image ?? null,
                logo:              property.bookingEngineConfig?.logo ?? property.image?.[0] ?? null,
                primaryColor:      property.bookingEngineConfig?.primaryColor ?? '#1e293b',
                starRating:        property.starRating ?? null,
                propertyAddress:   property.propertyAddress ?? null,
                propertyAmenities: property.propertyAmenities ?? [],
            },

            room: reservation.room ?? null,

            ratePlanName: reservation.ratePlanName ?? reservation.ratePlanCode ?? null,

            reservation: {
                bookingCode:    reservation.bookingCode,
                checkInDate:    reservation.reservationStartDate,
                checkOutDate:   reservation.reservationEndDate,
                numberOfGuests: reservation.reservationGuests?.length ?? 0,
                bookingSource:  reservation.bookingSource,
                bookingStatus:  reservation.bookingStatus,
                amount:         Number(reservation.amount),
                paidAmount:     Number(reservation.paidAmount ?? 0),
                currencyCode:   reservation.currencyCode,
                createdAt:      reservation.createdAt,
                roomTypeCode:   reservation.roomTypeCode ?? null,
                ratePlanCode:   reservation.ratePlanCode ?? null,
                guests:         reservation.guests,
                paymentMethod:  reservation.paymentMethod,
            },

            reservationGuests: (reservation.reservationGuests ?? []).map((g) => ({
                id:        g.id,
                firstName: g.firstName,
                lastName:  g.lastName,
                type:      g.type,
                age:       g.age ?? null,
            })),

            primaryGuest: reservation.primaryGuest
                ? {
                      firstName:            reservation.primaryGuest.firstName,
                      lastName:             reservation.primaryGuest.lastName,
                      email:                reservation.primaryGuest.email ?? null,
                      phoneNumber:          reservation.primaryGuest.phoneNumber ?? null,
                      userType:             reservation.primaryGuest.userType,
                      userIdentityCardType: reservation.primaryGuest.userIdentityCardType ?? null,
                      identityCardNumber:   reservation.primaryGuest.identityCardNumber ?? null,
                  }
                : null,

            // Booking-level addOns carry images; priceData.addonBrakeDown has amounts
            addOns: (reservation.addOns ?? []).map((addon) => ({
                name:       addon.name,
                quantity:   addon.quantity,
                totalPrice: Number(addon.totalPrice),
                unitPrice:  Number(addon.unitPrice),
                date:       addon.date ?? null,
                type:       addon.type,
                images:     addon.addon?.images ?? [],
            })),

            priceData,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  BOOKING VOUCHER
    // ─────────────────────────────────────────────────────────────────────────
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

            const voucherData = this.buildVoucherData(reservation);
            const html        = generateBookingVoucherHTML(voucherData);
            const pdf         = await this.generatePdf(html);

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
            const reservation =
                await this.reportsRepository.getReservationDetails(bookingCode);

            if (!reservation) {
                return errorResponse(
                    'Reservation not found',
                    'No reservation found with this booking code'
                );
            }

            // Same data shape — pass a flag or a separate template if invoice
            // layout should differ from the voucher layout.
            const invoiceData = this.buildVoucherData(reservation);
            const html        = generateBookingVoucherHTML(invoiceData);
            const pdf         = await this.generatePdf(html);

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
                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm',
                },
            });
            return Buffer.from(pdfBuffer);
        } finally {
            await browser.close();
        }
    }
}