import {
    ReservationRepository,
    PriceBrakeDownRepo,
    AriManupulationRepo,
    GuestRepository,
} from '../repository';
import { successResponse, errorResponse } from '../../../../utils/return';
import { IApiResponse } from '../../../../utils/return.types';
import {
    ICReservation,
    IReservationPriceBrakeDownR,
    IAriManulupulation,
    ICreateReservationPayload,
    ICGuest,
    IReservationUpdatePayload,
    IReservationPromotionCreate,
    IBookingAddonCreate,
    IBookingDetails,
} from '../types';
import { prisma } from '../../../../config';
import { IPropertyCodeAndIds } from '../../../../dashboard/types';
import { DashUtilsRepo } from '../../../../dashboard/repository';
import { nowUTC, toUTC, toUTCDate } from '../../../../utils';
import {
    BookingAddonRepository,
    ReservationPromotionRepository,
} from '../repository/reservation.repository';
import { ReservationEmailService } from '../../../../sms-email-service/service';
import { LoyaltyGuestRepository } from '../../../../loyalty/repository';
import { RTIntegrationDao } from '../../../../integrations/rate-tiger/dao/rt-integration.dao';
import { RTReservationPushService } from '../../../../integrations/rate-tiger/services/rt-reservation-push.service';
import { CurrencyCode } from '../../../../tax-system/interfaces/tourist-tax.type';
import { BookingStatus } from '../types/reservation.type';
import { ngeniusService } from '../../../../payment/services/ngenius.service';

export class ReservationService {
    reservationRepository: ReservationRepository;
    priceBrakeDownRepo: PriceBrakeDownRepo;
    ariManupulationRepo: AriManupulationRepo;
    guestRepository: GuestRepository;
    dashUtils: DashUtilsRepo;
    bookingAddonRepository: BookingAddonRepository;
    reservationPromotionRepository: ReservationPromotionRepository;
    emailService: ReservationEmailService;
    loyalityGuestRepo: LoyaltyGuestRepository;
    constructor() {
        this.reservationRepository = new ReservationRepository();
        this.priceBrakeDownRepo = new PriceBrakeDownRepo();
        this.ariManupulationRepo = new AriManupulationRepo();
        this.guestRepository = new GuestRepository();
        this.dashUtils = new DashUtilsRepo();
        this.bookingAddonRepository = new BookingAddonRepository();
        this.reservationPromotionRepository =
            new ReservationPromotionRepository();
        this.emailService = new ReservationEmailService();
        this.loyalityGuestRepo = new LoyaltyGuestRepository();
    }

    private async generateBookingCode(propertyCode: string): Promise<string> {
        const code =
            'BOOK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const existingReservation =
            await this.reservationRepository.getReservaltionByCode(code, propertyCode);

        if (existingReservation !== null) {
            return this.generateBookingCode(propertyCode);
        }
        return code;
    }

    private generateDateRange(startDate: Date, endDate: Date): Date[] {
        const dates: Date[] = [];
        const start = toUTCDate(startDate);
        const end = toUTCDate(endDate);

        const startMs = start.getTime();
        const endMs = end.getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        for (
            let currentMs = startMs;
            currentMs < endMs;
            currentMs += oneDayMs
        ) {
            dates.push(new Date(currentMs));
        }

        return dates;
    }

    private mapPaymentMethod(
        method: string
    ): 'pay_at_hotel' | 'net_banking' | 'upi' | 'payment_gateway' {
        const methodMap: Record<
            string,
            'pay_at_hotel' | 'net_banking' | 'upi' | 'payment_gateway'
        > = {
            payAtHotel: 'pay_at_hotel',
            pay_at_hotel: 'pay_at_hotel',
            netBanking: 'net_banking',
            net_banking: 'net_banking',
            upi: 'upi',
            paymentGateway: 'payment_gateway',
            ngenius: 'payment_gateway',
            payment_gateway: 'payment_gateway',
        };
        return methodMap[method] || 'pay_at_hotel';
    }

    private normalizePayload(payload: any): ICreateReservationPayload['data'] {
        const { bookingDetails, guestDetails } = payload;
        const { finalPrice } = bookingDetails;

        // ── New PriceBrakeDown shape ──
        // Promotions come from promotionBrakeDown[] array directly
        let selectedPromotions = bookingDetails.selectedPromotions || [];

        if (
            finalPrice.promotionBrakeDown &&
            Array.isArray(finalPrice.promotionBrakeDown) &&
            finalPrice.promotionBrakeDown.length > 0
        ) {
            selectedPromotions = finalPrice.promotionBrakeDown
                .filter((promo: any) => promo.restrictionType !== 'payLater') // Exclude tourist tax entries
                .map((promo: any) => ({
                    id: promo.id || null,
                    promotionType: promo.promotionType || 'normal',
                    promotionName: promo.name,
                    discountValue: promo.discountValue,
                    discountType: promo.discountType,
                    amount: promo.discountAmount,
                }));
        }

        // Addons come from addonBrakeDown[] array directly
        let selectedAddons = bookingDetails.selectedAddons || [];

        if (
            finalPrice.addonBrakeDown &&
            Array.isArray(finalPrice.addonBrakeDown) &&
            finalPrice.addonBrakeDown.length > 0
        ) {
            selectedAddons = finalPrice.addonBrakeDown.map(
                (addon: any) => ({
                    addonId: addon.addonId || null,
                    addonName: addon.name,
                    price: addon.amount, // per-unit price
                    quantity: addon.quantity,
                    totalPrice: addon.totalAmount,
                    type: addon.type || 'addon',
                    date: addon.date || bookingDetails.startDate,
                })
            );
        }

        return {
            bookingDetails: {
                ...bookingDetails,
                finalPrice,
                selectedPromotions,
                selectedAddons,
            },
            guestDetails: guestDetails,
            bankDetails: payload.bankDetails,
        };
    }

    public async createReservation(payload: any): Promise<IApiResponse> {
        try {
            // Normalize the payload first
            const normalizedPayload = this.normalizePayload(payload);
            const { bookingDetails, guestDetails } = normalizedPayload;

            const {
                startDate,
                endDate,
                propertyCode,
                hotelName,
                roomTypeCode,
                ratePlanCode,
                finalPrice,
                currency,
                email,
                phone,
                paymentMethod,
                bookingSource,
                agencyId,
            } = bookingDetails;

            const propertyId = await this.getPropertyIdByCode(propertyCode);
            if (!propertyId) {
                return errorResponse('Property not found');
            }

            const primaryGuestData = guestDetails[0];
            if (!primaryGuestData) {
                return errorResponse('At least one guest is required');
            }

            let primaryGuestId: string;
            const existingGuest =
                await this.guestRepository.getGuestByEmail(email);

            if (existingGuest) {
                primaryGuestId = existingGuest.id;
            } else {
                const newGuestPayload: ICGuest = {
                    firstName: primaryGuestData.firstName,
                    lastName: primaryGuestData.lastName,
                    email: email,
                    phoneNumber: phone || null,
                    propertyId: propertyId,
                    userType: primaryGuestData.type as
                        | 'adult'
                        | 'child'
                        | 'infant',
                    address: null,
                    city: null,
                    state: null,
                    country: null,
                    zipCode: null,
                    identityCardImage: null,
                    identityCardNumber: null,
                    userIdentityCardType: null,
                };

                const newGuest =
                    await this.guestRepository.createGuest(newGuestPayload);
                primaryGuestId = newGuest.id;
            }

            const bookingCode = await this.generateBookingCode(propertyCode);
            const paymentMethods = this.mapPaymentMethod(paymentMethod);

            // ── Integration check ─────────────────────────────────────────────────────
            const propertyConfig = await prisma.propertyConfigs.findUnique({
                where: { propertyId },
                select: {
                    selfAriActive: true,
                    pmsIntegrationActive: true,
                    channelManagerIntegrationActive: true,
                },
            });

            const selfAriActive = propertyConfig?.selfAriActive ?? true;
            const isPmsActive = propertyConfig?.pmsIntegrationActive ?? false;
            const isCmActive =
                propertyConfig?.channelManagerIntegrationActive ?? false;

            const activeIntegrationType: 'channel_manager' | 'pms' | null =
                isCmActive ? 'channel_manager' : isPmsActive ? 'pms' : null;

            let activeIntegrationName: string | null = null;
            if (activeIntegrationType) {
                const propertyIntegration =
                    await prisma.propertyIntegrations.findFirst({
                        where: {
                            propertyId,
                            isActive: true,
                            MasterIntegration: {
                                type:
                                    activeIntegrationType === 'channel_manager'
                                        ? 'channel_manager'
                                        : 'pms',
                                isActive: true,
                            },
                        },
                        include: {
                            MasterIntegration: {
                                select: { name: true },
                            },
                        },
                    });
                activeIntegrationName =
                    propertyIntegration?.MasterIntegration?.name ?? null;
            }
            console.log("active", activeIntegrationName)

            // Check if payment gateway is Fikafi - if so, payment is pending until webhook confirms
            const isFikafiPayment = payload.bankDetails?.selectedPaymentIntegrations?.paymentIntegration?.name === 'fikafi';

            // ── Compute numberOfNights from dates ──
            const checkIn = new Date(startDate);
            const checkOut = new Date(endDate);
            const numberOfNights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000)));

            let paidAmount = 0;
            let initialBookingStatus: 'pending' | 'confirmed' = 'confirmed';

            if (paymentMethods === 'payment_gateway') {
                if (isFikafiPayment) {
                    // For Fikafi, payment is pending until webhook confirms successful payment
                    paidAmount = 0;
                    initialBookingStatus = 'pending';
                } else {
                    // For other payment gateways, paidAmount = currentChargeableAmount (pay now)
                    paidAmount = finalPrice.currentChargeableAmount;
                }
            }

            const reservationPayload: ICReservation = {
                bookingCode,
                propertyId,
                propertyCode,
                hotelName,
                roomTypeCode,
                ratePlanCode,

                checkInDate: toUTC(startDate),
                checkOutDate: toUTC(endDate),
                bookedAt: nowUTC(),

                primaryGuestId,
                guests: guestDetails,
                bookingUserEmail: email,
                bookingUserPhone: phone || null,

                amount: finalPrice.totalAmount,
                currencyCode: currency,
                finalPrice: finalPrice,

                paidAmount: paidAmount,
                extraAmountToPay: finalPrice.latterpayableAmount || 0,
                refundAmount: 0,
                timezone: payload.timezone || 'Asia/Kolkata',
                countryCode: payload.countryCode || 'IN',
                paymentMethod: paymentMethods,
                paymentImages: null,

                bookingStatus: initialBookingStatus,
                cancellationReason: null,
                deviceTypes: payload.deviceTypes || 'desktop',
                bookingSource: bookingSource || 'direct',

                isPromoUsed: !!(
                    bookingDetails.promoCode ||
                    (normalizedPayload.bookingDetails.selectedPromotions &&
                        normalizedPayload.bookingDetails.selectedPromotions
                            .length > 0)
                ),
                promoId: null,
                agencyId: agencyId || null,
            };
            if (
                activeIntegrationType &&
                activeIntegrationName === 'Rate Tiger'
            ) {
                const rtConfig = await RTIntegrationDao.getRTConfig(
                    propertyId,
                    activeIntegrationType
                );

                if (!rtConfig) {
                    return errorResponse(
                        'Rate Tiger integration config not found for this property'
                    );
                }

                const rtResult = await RTReservationPushService.pushCommit(
                    normalizedPayload as any,
                    bookingCode,
                    rtConfig
                );

                if (!rtResult.success) {
                    return errorResponse(
                        `Rate Tiger sync failed: ${rtResult.message}`
                    );
                }
            }
            const reservation =
                await this.reservationRepository.createReservation(
                    reservationPayload
                );

            if (guestDetails && guestDetails.length > 0) {
                await this.reservationRepository.createReservationGuests(
                    reservation.id,
                    guestDetails
                );
            }
            const ngeniusOrderRef = bookingDetails.ngeniusOrderRef;
            if (ngeniusOrderRef) {
                try {
                    const updateResult = await prisma.payment.updateMany({
                        where: { paymentIntentId: ngeniusOrderRef },
                        data: { reservationId: reservation.id },
                    });

                    if (updateResult.count > 0) {
                        console.log(`✅ Linked reservation ${reservation.id} to N-Genius payment record:
  - Order Reference: ${ngeniusOrderRef}
  - Records Updated: ${updateResult.count}`);
                    } else {
                        console.warn(`⚠️ No N-Genius payment record found with reference ${ngeniusOrderRef} to link with reservation ${reservation.id}`);
                    }
                } catch (linkError) {
                    console.error(`❌ Database Error linking reservation ${reservation.id} to payment ${ngeniusOrderRef}:`, linkError);
                }
            }

            const priceBreakdownPayload: IReservationPriceBrakeDownR = {
                reservationId: reservation.id,
                additionalGuestCharges: 0,
                baseRatePerNight: numberOfNights > 0 ? Math.round(finalPrice.amountBeforeTax / numberOfNights) : 0,
                numberOfNights: numberOfNights,
                priceAfterTax: finalPrice.totalAmount,
                totalAmount: finalPrice.totalAmount,
                totalTax: finalPrice.taxedAmount|| 0,
                breakdown: {
                    totalBaseAmount: finalPrice.amountBeforeTax,
                    totalAddonAmount: finalPrice.totalAddonAmount || 0,
                    totalPromotionAmount: finalPrice.totalPromotionAmount || 0,
                    currentChargeableAmount: finalPrice.currentChargeableAmount,
                    latterpayableAmount: finalPrice.latterpayableAmount || 0,
                    promoCodeDiscount: finalPrice.promoCodeDiscount || 0,
                    loyalityDiscount: finalPrice.loyalityDiscount || 0,
                },
                dailyBreakdown: finalPrice.dailyPriceBrakeDown || [],
                availableRooms: finalPrice.requestedRooms || 0,
                requestedRooms: finalPrice.requestedRooms || 0,
                tax: finalPrice.taxBrakeDown || [],
            };
            const loyalityBrakedown = finalPrice.loyaltyDiscount;

            await this.priceBrakeDownRepo.createpriceBrakeDowns([
                priceBreakdownPayload,
            ]);
            if (
                normalizedPayload.bookingDetails.selectedAddons &&
                normalizedPayload.bookingDetails.selectedAddons.length > 0
            ) {
                const addonPayloads: IBookingAddonCreate[] =
                    normalizedPayload.bookingDetails.selectedAddons
                        .filter((addon: any) => addon.addonId) // Skip addons without a valid addonId (required FK)
                        .map(
                            (addon: any) => ({
                                reservationId: reservation.id,
                                addonId: addon.addonId,
                                name: addon.addonName || addon.name,
                                unitPrice: addon.price,
                                quantity: addon.quantity,
                                totalPrice: addon.totalPrice,
                                currencyCode: currency,
                                specialInstructions: null,
                                type: addon.type,
                                date: new Date(addon.date),
                            })
                        );

                if (addonPayloads.length > 0) {
                    await this.bookingAddonRepository.createBookingAddons(
                        addonPayloads
                    );
                }
            }

            if (
                normalizedPayload.bookingDetails.selectedPromotions &&
                normalizedPayload.bookingDetails.selectedPromotions.length > 0
            ) {
                const promotionPayloads: IReservationPromotionCreate[] = [];

                for (const promo of normalizedPayload.bookingDetails
                    .selectedPromotions) {
                    if (promo.promotionType === 'mlos') {
                        if (!promo.id) {
                            console.warn('MLOS promotion missing id:', promo);
                            return errorResponse('MLOS promotion missing id');
                        }

                        promotionPayloads.push({
                            bookingCode: bookingCode,
                            bookingId: reservation.id,
                            promotionId: null, // ✅ NULL for MLOS
                            mlosId: promo.id, // ✅ Use the id directly - it's the RatePlanRule ID
                            amount: promo.amount, // ✅ Use pre-calculated amount
                            currency: currency as CurrencyCode,
                            promotionType: promo.promotionType,
                        });
                    } else {
                        if (!promo.id) {
                            console.warn('Promotion missing id:', promo);
                            return errorResponse('Promotion missing id');
                        }

                        promotionPayloads.push({
                            bookingCode: bookingCode,
                            bookingId: reservation.id,
                            promotionId: promo.id, // ✅ Use the id - it's the Promotion ID
                            mlosId: null, // ✅ NULL for regular promotions
                            amount: promo.amount, // ✅ Use pre-calculated amount
                            currency: currency as CurrencyCode,
                            promotionType: promo.promotionType,
                        });
                    }
                }

                if (promotionPayloads.length > 0) {
                    await this.reservationPromotionRepository.createReservationPromotions(
                        promotionPayloads
                    );
                }
            }

            const reservationDates = this.generateDateRange(
                toUTCDate(startDate),
                toUTCDate(endDate)
            );
            const ariPayload: IAriManulupulation = {
                propertyCode,
                dates: reservationDates,
                roomInfos: [
                    {
                        roomTypeCode,
                        numberOfRooms: finalPrice.requestedRooms || 1,
                    },
                ],
            };

            // ── Push to Rate Tiger if active integration is Rate Tiger ────────────────

            // ── Non-blocking tasks ────────────────────────────────────────────────────
            const nonBlockingPromises: Promise<any>[] = [
                ...(selfAriActive && !activeIntegrationType
                    ? [
                        this.ariManupulationRepo.decreaseAvailableRooms(
                            ariPayload
                        ),
                    ]
                    : []),
                this.emailService.reservationConfirmation({
                    ...bookingDetails,
                    numberOfNights: numberOfNights,
                    guestDetails: guestDetails.map((guest: any) => ({
                        type: guest.type,
                        firstName: guest.firstName,
                        lastName: guest.lastName,
                        dateOfBirth: guest.dateOfBirth || guest.dob || '',
                        email: guest.type === 'adult' ? email : undefined,
                        phone: guest.type === 'adult' ? phone : undefined,
                    })),
                    bookingCode: reservation.bookingCode,
                    reservationId: reservation.id,
                    bookedAt: reservation.bookedAt.toISOString(),
                    bookingStatus: reservation.bookingStatus,
                }),
            ];

            // ✅ Add loyalty only if discount exists
            if (finalPrice?.loyaltyDiscount?.loyaltyMemberId) {
                nonBlockingPromises.push(
                    this.loyalityGuestRepo.addGuest(
                        finalPrice.loyaltyDiscount.loyaltyMemberId,
                        primaryGuestId
                    )
                );
            }

            Promise.all(nonBlockingPromises).catch(error => {
                console.error('Non-blocking operations failed:', error);
            });

            return successResponse(
                'Reservation created successfully',
                reservation
            );
        } catch (error) {
            console.error('Error creating reservation:', error);
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create reservation',
                    error.message
                );
            }
            return errorResponse('Failed to create reservation');
        }
    }
    private async getPropertyIdByCode(
        propertyCode: string
    ): Promise<string | null> {
        try {
            const property = await prisma.property.findUnique({
                where: { propertyCode },
                select: { id: true },
            });
            return property?.id || null;
        } catch (error) {
            return null;
        }
    }

    public async getReservaltionByCode(
        reservationCode: string,
        propertyCode: string
    ): Promise<IApiResponse> {
        try {
            const reservation =
                await this.reservationRepository.getReservaltionByCode(
                    reservationCode,
                    propertyCode
                );

            if (!reservation) {
                return errorResponse('Reservation not found');
            }
            return successResponse(
                'Reservation fetched successfully',
                reservation
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch reservation',
                    error.message
                );
            }
            return errorResponse('Failed to fetch reservation');
        }
    }
    public async updateReservation(
        reservationCode: string,
        updatePayload: IReservationUpdatePayload
    ): Promise<IApiResponse> {
        try {
            // 1. Get existing reservation
            const existingReservation =
                await this.reservationRepository.getReservaltionByCode(
                    reservationCode,
                    updatePayload.propertyCode
                );

            if (!existingReservation) {
                return errorResponse('Reservation not found');
            }

            // 2. Validate property matches
            if (
                existingReservation.propertyCode !== updatePayload.propertyCode
            ) {
                return errorResponse(
                    'Cannot change property for existing reservation'
                );
            }

            if (
                existingReservation.roomTypeCode !== updatePayload.roomTypeCode
            ) {
                return errorResponse(
                    'Cannot change room type for existing reservation'
                );
            }

            if (
                existingReservation.ratePlanCode !== updatePayload.ratePlanCode
            ) {
                return errorResponse(
                    'Cannot change rate plan for existing reservation'
                );
            }

            // 3. Parse dates
            const newCheckInDate = new Date(updatePayload.checkInDate);
            const newCheckOutDate = new Date(updatePayload.checkOutDate);
            const oldCheckInDate = existingReservation.checkInDate;
            const oldCheckOutDate = existingReservation.checkOutDate;

            // Validate new dates
            if (newCheckInDate >= newCheckOutDate) {
                return errorResponse(
                    'Check-in date must be before check-out date'
                );
            }

            // 4. Generate date ranges for ARI comparison
            const oldDates = this.generateDateRange(
                oldCheckInDate,
                oldCheckOutDate
            );

            const newDates = this.generateDateRange(
                newCheckInDate,
                newCheckOutDate
            );

            // 5. Calculate ARI changes
            const oldRooms =
                existingReservation.finalPrice?.requestedRooms || 1;
            const newRooms = updatePayload.requestedRooms;

            // Determine dates that need ARI updates
            const datesToFree = oldDates.filter(
                date => !newDates.includes(date)
            );
            const datesToReserve = newDates.filter(
                date => !oldDates.includes(date)
            );
            const commonDates = oldDates.filter(date =>
                newDates.includes(date)
            );

            // 6. Check availability for new requirements
            if (datesToReserve.length > 0 || newRooms > oldRooms) {
                const allNewDates = [...new Set([...newDates])]; // Unique dates

                const isAvailable =
                    await this.reservationRepository.checkRoomAvailability(
                        updatePayload.propertyCode,
                        updatePayload.roomTypeCode,
                        allNewDates,
                        newRooms
                    );

                if (!isAvailable) {
                    return errorResponse(
                        'Not enough rooms available for the selected dates'
                    );
                }
            }

            // 7. Calculate financial changes
            const oldAmount = existingReservation.amount;
            const newAmount = updatePayload.amount;
            const priceDifference = newAmount - oldAmount;

            let extraAmountToPay = 0;
            let refundAmount = 0;

            if (priceDifference > 0) {
                extraAmountToPay = priceDifference;
            } else if (priceDifference < 0) {
                refundAmount = Math.abs(priceDifference);
            }

            // 8. Update ARI in a transaction
            // ── Integration check for update ─────────────────────────────────────────
            const updatePropConfig = await prisma.propertyConfigs.findUnique({
                where: { propertyId: existingReservation.propertyId },
                select: {
                    selfAriActive: true,
                    pmsIntegrationActive: true,
                    channelManagerIntegrationActive: true,
                },
            });

            const selfAriActiveU = updatePropConfig?.selfAriActive ?? true;
            const activeIntegrationTypeU: 'channel_manager' | 'pms' | null =
                updatePropConfig?.channelManagerIntegrationActive
                    ? 'channel_manager'
                    : updatePropConfig?.pmsIntegrationActive
                        ? 'pms'
                        : null;

            if (activeIntegrationTypeU) {
                const rtConfig = await RTIntegrationDao.getRTConfig(
                    existingReservation.propertyId,
                    activeIntegrationTypeU
                );

                if (!rtConfig) {
                    return errorResponse(
                        'Rate Tiger integration config not found for this property'
                    );
                }

                const rtResult = await RTReservationPushService.pushModify(
                    existingReservation as any,
                    {
                        checkInDate: newCheckInDate,
                        checkOutDate: newCheckOutDate,
                        amount: newAmount,
                        finalPrice: updatePayload.finalPrice,
                    },
                    rtConfig
                );

                if (!rtResult.success) {
                    return errorResponse(
                        `Rate Tiger sync failed: ${rtResult.message}`
                    );
                }
            }

            // 8. Update ARI in a transaction — only if selfAri active and no external integration
            if (selfAriActiveU && !activeIntegrationTypeU) {
                await prisma.$transaction(async tx => {
                    // Free up old inventory for dates that are no longer needed
                    if (datesToFree.length > 0) {
                        const freeAriPayload: IAriManulupulation = {
                            propertyCode: updatePayload.propertyCode,
                            dates: datesToFree,
                            roomInfos: [
                                {
                                    roomTypeCode: updatePayload.roomTypeCode,
                                    numberOfRooms: oldRooms,
                                },
                            ],
                        };

                        // Use direct prisma call since AriManupulationRepo doesn't have transaction support
                        for (const room of freeAriPayload.roomInfos) {
                            await tx.inventory.updateMany({
                                where: {
                                    propertyCode: freeAriPayload.propertyCode,
                                    roomTypeCode: room.roomTypeCode,
                                    date: { in: freeAriPayload.dates },
                                },
                                data: {
                                    availability: {
                                        increment: room.numberOfRooms,
                                    },
                                },
                            });
                        }
                    }

                    // For common dates, adjust if room count changed
                    if (commonDates.length > 0 && oldRooms !== newRooms) {
                        const roomDifference = newRooms - oldRooms;
                        if (roomDifference !== 0) {
                            const adjustment =
                                roomDifference > 0
                                    ? { decrement: Math.abs(roomDifference) }
                                    : { increment: Math.abs(roomDifference) };

                            await tx.inventory.updateMany({
                                where: {
                                    propertyCode: updatePayload.propertyCode,
                                    roomTypeCode: updatePayload.roomTypeCode,
                                    date: { in: commonDates },
                                },
                                data: {
                                    availability: adjustment,
                                },
                            });
                        }
                    }

                    // Reserve new inventory for new dates
                    if (datesToReserve.length > 0) {
                        const reserveAriPayload: IAriManulupulation = {
                            propertyCode: updatePayload.propertyCode,
                            dates: datesToReserve,
                            roomInfos: [
                                {
                                    roomTypeCode: updatePayload.roomTypeCode,
                                    numberOfRooms: newRooms,
                                },
                            ],
                        };

                        for (const room of reserveAriPayload.roomInfos) {
                            await tx.inventory.updateMany({
                                where: {
                                    propertyCode:
                                        reserveAriPayload.propertyCode,
                                    roomTypeCode: room.roomTypeCode,
                                    date: { in: reserveAriPayload.dates },
                                },
                                data: {
                                    availability: {
                                        decrement: room.numberOfRooms,
                                    },
                                },
                            });
                        }
                    }
                });
            }
            // 9. Update reservation record
            const updateData: Partial<ICReservation> = {
                checkInDate: newCheckInDate,
                checkOutDate: newCheckOutDate,
                amount: newAmount,
                finalPrice: updatePayload.finalPrice,
                guests: updatePayload.guests,
                bookingUserEmail: updatePayload.bookingUserEmail,
                bookingUserPhone: updatePayload.bookingUserPhone || null,
                bookingStatus: 'modified' as BookingStatus,
                extraAmountToPay:
                    existingReservation.extraAmountToPay + extraAmountToPay,
                refundAmount: existingReservation.refundAmount + refundAmount,
            };

            // Compute numberOfNights for update
            const updateNumberOfNights = Math.max(1, Math.ceil(
                (newCheckOutDate.getTime() - newCheckInDate.getTime()) / (24 * 60 * 60 * 1000)
            ));
            const addonBrakeDown = updatePayload.finalPrice.addonBrakeDown || [];
            const addonPayloads: IBookingAddonCreate[] = addonBrakeDown
                .filter((addon: any) => addon.addonId)
                .map((addon: any) => ({
                    reservationId: existingReservation.id,
                    addonId: addon.addonId,
                    name: addon.name,
                    unitPrice: addon.amount,
                    quantity: addon.quantity,
                    totalPrice: addon.totalAmount,
                    currencyCode: addon.currencyCode || updatePayload.currencyCode,
                    specialInstructions: null,
                    type: addon.type,
                    date: new Date(addon.date),
                }));

            // Prepare promotion payloads
            const promotionBrakeDown = updatePayload.finalPrice.promotionBrakeDown || [];
            const promotionPayloads: IReservationPromotionCreate[] = promotionBrakeDown
                .filter((promo: any) => promo.id && promo.restrictionType !== 'payLater')
                .map((promo: any) => ({
                    bookingCode: existingReservation.bookingCode,
                    bookingId: existingReservation.id,
                    promotionId: promo.promotionType === 'mlos' ? null : promo.id,
                    mlosId: promo.promotionType === 'mlos' ? promo.id : null,
                    amount: promo.discountAmount,
                    currency: updatePayload.currencyCode as CurrencyCode,
                    promotionType: promo.promotionType,
                }));

            const updatedReservation =
                await this.reservationRepository.updateReservationWithTransaction(
                    existingReservation.id,
                    updateData,
                    {
                        additionalGuestCharges: 0,
                        baseRatePerNight: updateNumberOfNights > 0
                            ? Math.round((updatePayload.finalPrice.amountBeforeTax || updatePayload.finalPrice.totalAmount || 0) / updateNumberOfNights)
                            : 0,
                        numberOfNights: updateNumberOfNights,
                        priceAfterTax: 
                            updatePayload.finalPrice.totalAmount || 0
                        ,
                        totalAmount: 
                            updatePayload.finalPrice.totalAmount || 0
                        ,
                        totalTax: 
                            updatePayload.finalPrice.taxedAmount || 0
                        ,
                        breakdown: {
                            totalBaseAmount: updatePayload.finalPrice.amountBeforeTax || 0,
                            totalAddonAmount: updatePayload.finalPrice.totalAddonAmount || 0,
                            totalPromotionAmount: updatePayload.finalPrice.totalPromotionAmount || 0,
                            currentChargeableAmount: updatePayload.finalPrice.currentChargeableAmount || updatePayload.finalPrice.totalAmount || 0,
                            latterpayableAmount: updatePayload.finalPrice.latterpayableAmount || 0,
                            promoCodeDiscount: updatePayload.finalPrice.promoCodeDiscount || 0,
                            loyalityDiscount: updatePayload.finalPrice.loyalityDiscount || 0,
                        },
                        dailyBreakdown: updatePayload.finalPrice.dailyPriceBrakeDown || [],
                        availableRooms: updatePayload.finalPrice.requestedRooms || 0,
                        requestedRooms: updatePayload.requestedRooms,
                        tax: updatePayload.finalPrice.taxBrakeDown || [],
                    },
                    updateData.guests,
                    addonPayloads,
                    promotionPayloads
                );

            // 10. Prepare response with change summary
            const modificationSummary = {
                reservation: updatedReservation,
                ariChanges: {
                    datesFreed: datesToFree,
                    datesReserved: datesToReserve,
                    roomsFreed: oldRooms,
                    roomsReserved: newRooms,
                    commonDates: commonDates,
                    roomChange: newRooms - oldRooms,
                },
                financialSummary: {
                    oldAmount,
                    newAmount,
                    difference: priceDifference,
                    extraAmountToPay,
                    refundAmount,
                    totalExtraAmountToPay:
                        existingReservation.extraAmountToPay + extraAmountToPay,
                    totalRefundAmount:
                        existingReservation.refundAmount + refundAmount,
                },
                dateChanges: {
                    oldCheckIn: oldCheckInDate,
                    oldCheckOut: oldCheckOutDate,
                    newCheckIn: newCheckInDate,
                    newCheckOut: newCheckOutDate,
                    nightsChanged:
                        updateNumberOfNights -
                        (existingReservation.finalPrice?.numberOfNights || 1),
                },
            };

            // Send reservation updated email (non-blocking)
            const emailBookingDetails: IBookingDetails = {
                startDate: updatePayload.checkInDate,
                endDate: updatePayload.checkOutDate,
                propertyCode: updatePayload.propertyCode,
                hotelName: existingReservation.hotelName || '',
                roomTypeCode: updatePayload.roomTypeCode,
                ratePlanCode: updatePayload.ratePlanCode,
                numberOfRooms: updatePayload.requestedRooms,
                numberOfNights: updateNumberOfNights,
                refundAmount: updatedReservation.refundAmount,
                finalPrice: updatePayload.finalPrice,
                promoCode: null,
                currency: updatePayload.currencyCode,
                bookingSource: existingReservation.bookingSource,
                email: updatePayload.bookingUserEmail,
                phone: updatePayload.bookingUserPhone,
                guests: {
                    adults: updatePayload.rooms.reduce(
                        (sum, room) => sum + room.adults,
                        0
                    ),
                    children: updatePayload.rooms.reduce(
                        (sum, room) => sum + room.children,
                        0
                    ),
                    rooms: updatePayload.rooms.length,
                },
                guestDetails: updatePayload.guests.map(guest => ({
                    type: guest.type,
                    firstName: guest.firstName,
                    lastName: guest.lastName,
                    dateOfBirth: guest.dateOfBirth,
                    email:
                        guest.type === 'adult'
                            ? updatePayload.bookingUserEmail
                            : undefined,
                    phone:
                        guest.type === 'adult'
                            ? updatePayload.bookingUserPhone
                            : undefined,
                })),
                paymentMethod: existingReservation.paymentMethod,
                bookingCode: existingReservation.bookingCode,
                reservationId: existingReservation.id,
                bookedAt: existingReservation.bookedAt.toISOString(),
                bookingStatus: 'modified' as BookingStatus,
            };

            this.emailService
                .reservationUpdatedEmail(emailBookingDetails)
                .catch(error => {
                    console.error(
                        'Failed to send reservation update email:',
                        error
                    );
                });

            return successResponse(
                'Reservation updated successfully',
                modificationSummary
            );
        } catch (error) {
            console.error('Error updating reservation:', error);
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update reservation',
                    error.message
                );
            }
            return errorResponse('Failed to update reservation');
        }
    }
    private async getAccessiblePropertyIds(
        creationId: string,
        userLevel: number,
        specificPropertyId?: string,
        specificPropertyCode?: string
    ): Promise<{ success: boolean; propertyIds: string[]; message?: string }> {
        try {
            // If specific property requested, validate access first
            if (specificPropertyId || specificPropertyCode) {
                // First get all accessible properties for validation
                let allAccessibleProperties: IPropertyCodeAndIds[] = [];
                let daoRes: any;

                switch (userLevel) {
                    case 4:
                        daoRes =
                            await this.dashUtils.getPropertyIdsAndCodesForLevel4(
                                creationId
                            );
                        break;
                    case 3:
                        daoRes =
                            await this.dashUtils.getPropertyIdsAndCodesForLevel3(
                                creationId
                            );
                        break;
                    case 2:
                        daoRes =
                            await this.dashUtils.getPropertyIdsAndCodesForLevel2(
                                creationId
                            );
                        break;
                    case 1:
                    case 0:
                        daoRes =
                            await this.dashUtils.getPropertyIdAndCodeForLevel0And1(
                                creationId
                            );
                        break;
                    default:
                        return {
                            success: false,
                            propertyIds: [],
                            message: 'Invalid user level',
                        };
                }

                if (!daoRes.success) {
                    return {
                        success: false,
                        propertyIds: [],
                        message: daoRes.message,
                    };
                }

                allAccessibleProperties = daoRes.data;

                // Validate access to specific property
                const hasAccess = allAccessibleProperties.some(
                    p =>
                        p.id === specificPropertyId ||
                        p.code === specificPropertyCode
                );

                if (!hasAccess) {
                    return {
                        success: false,
                        propertyIds: [],
                        message: 'Access denied to this property',
                    };
                }

                // Return only the specific property ID
                const specificProperty = allAccessibleProperties.find(
                    p =>
                        p.id === specificPropertyId ||
                        p.code === specificPropertyCode
                );
                return { success: true, propertyIds: [specificProperty!.id] };
            }

            // Get all accessible properties
            let daoRes: any;
            switch (userLevel) {
                case 4:
                    daoRes =
                        await this.dashUtils.getPropertyIdsAndCodesForLevel4(
                            creationId
                        );
                    break;
                case 3:
                    daoRes =
                        await this.dashUtils.getPropertyIdsAndCodesForLevel3(
                            creationId
                        );
                    break;
                case 2:
                    daoRes =
                        await this.dashUtils.getPropertyIdsAndCodesForLevel2(
                            creationId
                        );
                    break;
                case 1:
                case 0:
                    daoRes =
                        await this.dashUtils.getPropertyIdAndCodeForLevel0And1(
                            creationId
                        );
                    break;
                default:
                    return {
                        success: false,
                        propertyIds: [],
                        message: 'Invalid user level',
                    };
            }

            if (!daoRes.success) {
                return {
                    success: false,
                    propertyIds: [],
                    message: daoRes.message,
                };
            }

            const propertyIds = daoRes.data.map(
                (p: IPropertyCodeAndIds) => p.id
            );
            return { success: true, propertyIds };
        } catch (error) {
            return {
                success: false,
                propertyIds: [],
                message:
                    error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    public async getReservationsForDateRange(
        creationId: string,
        userLevel: number,
        startDate: Date,
        endDate: Date,
        page: number,
        limit: number,
        specificPropertyId?: string,
        specificPropertyCode?: string,
        bookingStatus?: string,
        bookingSource?: string, 
        deviceType?: string, 
        bookingCode?: string, 
        guestName?: string, 
        promoCode?: string, 
        countryCode?: string, 
        dateFilterType?: 'checkin' | 'booking' | 'modification' 
    ): Promise<IApiResponse> {
        try {
            const accessResult = await this.getAccessiblePropertyIds(
                creationId,
                userLevel,
                specificPropertyId,
                specificPropertyCode
            );

            if (!accessResult.success) {
                return errorResponse(
                    accessResult.message ||
                    'Failed to get accessible properties'
                );
            }

            if (accessResult.propertyIds.length === 0) {
                return successResponse('No reservations found', [], {
                    currentPage: page,
                    totalPages: 0,
                    totalResults: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    resultsPerPage: limit,
                });
            }

            const result =
                await this.reservationRepository.getReservationsForDateRange(
                    accessResult.propertyIds,
                    startDate,
                    endDate,
                    page,
                    limit,
                    bookingStatus,
                    bookingSource, // ← Add these
                    deviceType, // ← Add these
                    bookingCode, // ← Add these
                    guestName, // ← Add these
                    promoCode, // ← Add these
                    countryCode, // ← Add these
                    dateFilterType // ← Add these
                );

            return successResponse(
                'Reservations fetched successfully',
                result.data,
                result.pagination
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch reservations',
                    error.message
                );
            }
            return errorResponse('Failed to fetch reservations');
        }
    }

    public async getArrivals(
        creationId: string,
        userLevel: number,
        startDate: Date,
        endDate: Date,
        page: number,
        limit: number,
        specificPropertyId?: string,
        specificPropertyCode?: string,
        bookingStatus?: string
    ): Promise<IApiResponse> {
        try {
            const accessResult = await this.getAccessiblePropertyIds(
                creationId,
                userLevel,
                specificPropertyId,
                specificPropertyCode
            );

            if (!accessResult.success) {
                return errorResponse(
                    accessResult.message ||
                    'Failed to get accessible properties'
                );
            }

            if (accessResult.propertyIds.length === 0) {
                return successResponse('No arrivals found', [], {
                    currentPage: page,
                    totalPages: 0,
                    totalResults: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    resultsPerPage: limit,
                });
            }

            const result = await this.reservationRepository.getArrivals(
                accessResult.propertyIds,
                startDate,
                endDate,
                page,
                limit,
                bookingStatus
            );

            return successResponse(
                'Arrivals fetched successfully',
                result.data,
                result.pagination
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch arrivals', error.message);
            }
            return errorResponse('Failed to fetch arrivals');
        }
    }

    public async getDepartures(
        creationId: string,
        userLevel: number,
        startDate: Date,
        endDate: Date,
        page: number,
        limit: number,
        specificPropertyId?: string,
        specificPropertyCode?: string,
        bookingStatus?: string
    ): Promise<IApiResponse> {
        try {
            const accessResult = await this.getAccessiblePropertyIds(
                creationId,
                userLevel,
                specificPropertyId,
                specificPropertyCode
            );

            if (!accessResult.success) {
                return errorResponse(
                    accessResult.message ||
                    'Failed to get accessible properties'
                );
            }

            if (accessResult.propertyIds.length === 0) {
                return successResponse('No departures found', [], {
                    currentPage: page,
                    totalPages: 0,
                    totalResults: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    resultsPerPage: limit,
                });
            }

            const result = await this.reservationRepository.getDepartures(
                accessResult.propertyIds,
                startDate,
                endDate,
                page,
                limit,
                bookingStatus
            );

            return successResponse(
                'Departures fetched successfully',
                result.data,
                result.pagination
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch departures',
                    error.message
                );
            }
            return errorResponse('Failed to fetch departures');
        }
    }

    public async getCheckedInReservations(
        creationId: string,
        userLevel: number,
        startDate: Date,
        endDate: Date,
        page: number,
        limit: number,
        specificPropertyId?: string,
        specificPropertyCode?: string
    ): Promise<IApiResponse> {
        try {
            const accessResult = await this.getAccessiblePropertyIds(
                creationId,
                userLevel,
                specificPropertyId,
                specificPropertyCode
            );

            if (!accessResult.success) {
                return errorResponse(
                    accessResult.message ||
                    'Failed to get accessible properties'
                );
            }

            if (accessResult.propertyIds.length === 0) {
                return successResponse('No check-ins found', [], {
                    currentPage: page,
                    totalPages: 0,
                    totalResults: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    resultsPerPage: limit,
                });
            }

            const result = await this.reservationRepository.getCheckIns(
                accessResult.propertyIds,
                startDate,
                endDate,
                page,
                limit
            );

            return successResponse(
                'Checked-in reservations fetched successfully',
                result.data,
                result.pagination
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch checked-in reservations',
                    error.message
                );
            }
            return errorResponse('Failed to fetch checked-in reservations');
        }
    }

    public async getCheckedOutReservations(
        creationId: string,
        userLevel: number,
        startDate: Date,
        endDate: Date,
        page: number,
        limit: number,
        specificPropertyId?: string,
        specificPropertyCode?: string
    ): Promise<IApiResponse> {
        try {
            const accessResult = await this.getAccessiblePropertyIds(
                creationId,
                userLevel,
                specificPropertyId,
                specificPropertyCode
            );

            if (!accessResult.success) {
                return errorResponse(
                    accessResult.message ||
                    'Failed to get accessible properties'
                );
            }

            if (accessResult.propertyIds.length === 0) {
                return successResponse('No check-outs found', [], {
                    currentPage: page,
                    totalPages: 0,
                    totalResults: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    resultsPerPage: limit,
                });
            }

            const result = await this.reservationRepository.getCheckouts(
                accessResult.propertyIds,
                startDate,
                endDate,
                page,
                limit
            );

            return successResponse(
                'Checked-out reservations fetched successfully',
                result.data,
                result.pagination
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch checked-out reservations',
                    error.message
                );
            }
            return errorResponse('Failed to fetch checked-out reservations');
        }
    }

    public async deleteReservation(
        reservationId: string
    ): Promise<IApiResponse> {
        try {
            console.log(`\n[DEBUG - REFUND FLOW] 🟢 Starting deleteReservation for reservationId: ${reservationId}`);
            
            const reservation =
                await this.reservationRepository.getReservationById(
                    reservationId
                );

            if (!reservation) {
                return errorResponse('Reservation not found');
            }

            // Generate dates for ARI increase
            const reservationDates = this.generateDateRange(
                reservation.checkInDate,
                reservation.checkOutDate
            );

            // Cancel reservation
            // CORRECT ORDER:

            // 1. getReservationById
            // 2. generateDateRange
            // 3. ── Integration check ──
            const delPropConfig = await prisma.propertyConfigs.findUnique({
                where: { propertyId: reservation.propertyId },
                select: {
                    selfAriActive: true,
                    pmsIntegrationActive: true,
                    channelManagerIntegrationActive: true,
                },
            });

            const selfAriActiveD = delPropConfig?.selfAriActive ?? true;
            const activeIntegrationTypeD: 'channel_manager' | 'pms' | null =
                delPropConfig?.channelManagerIntegrationActive
                    ? 'channel_manager'
                    : delPropConfig?.pmsIntegrationActive
                        ? 'pms'
                        : null;

            // 4. ── RT pushCancel FIRST ──
            if (activeIntegrationTypeD) {
                const rtConfig = await RTIntegrationDao.getRTConfig(
                    reservation.propertyId,
                    activeIntegrationTypeD
                );

                if (!rtConfig) {
                    return errorResponse(
                        'Rate Tiger integration config not found'
                    );
                }

                const rtResult = await RTReservationPushService.pushCancel(
                    reservation as any,
                    rtConfig
                );

                if (!rtResult.success) {
                    return errorResponse(
                        `Rate Tiger cancel failed: ${rtResult.message}`
                    );
                }
            }

            // 5. ── Only AFTER RT success — cancel in DB ──
            const cancelledReservation =
                await this.reservationRepository.deleteReservation(
                    reservationId
                );

            // Prepare email booking details for cancellation email
            const cancelNumberOfNights = Math.max(1, Math.ceil(
                (reservation.checkOutDate.getTime() - reservation.checkInDate.getTime()) / (24 * 60 * 60 * 1000)
            ));

            const emailBookingDetails: IBookingDetails = {
                startDate: reservation.checkInDate.toISOString(),
                endDate: reservation.checkOutDate.toISOString(),
                propertyCode: reservation.propertyCode || '',
                hotelName: reservation.hotelName || '',
                refundAmount: reservation.refundAmount || 0,
                roomTypeCode: reservation.roomTypeCode || '',
                ratePlanCode: reservation.ratePlanCode || '',
                numberOfRooms: reservation.finalPrice?.requestedRooms || 1,
                numberOfNights: cancelNumberOfNights,
                finalPrice: reservation.finalPrice || {
                    totalAmount: reservation.amount,
                    amountBeforeTax: reservation.amount,
                    taxedAmount: 0,
                    totalAddonAmount: 0,
                    totalPromotionAmount: 0,
                    currentChargeableAmount: reservation.amount,
                    latterpayableAmount: 0,
                    promoCodeDiscount: 0,
                    loyalityDiscount: 0,
                    currencyCode: reservation.currencyCode,
                    dailyPriceBrakeDown: [],
                    taxBrakeDown: [],
                    addonBrakeDown: [],
                    promotionBrakeDown: [],
                },
                promoCode: null,
                currency: reservation.currencyCode,
                bookingSource: reservation.bookingSource,
                email: reservation.bookingUserEmail,
                phone: reservation.bookingUserPhone || '',
                guests: {
                    adults: Array.isArray(reservation.guests)
                        ? reservation.guests.filter(
                            (g: any) => g.type === 'adult'
                        ).length
                        : 1,
                    children: Array.isArray(reservation.guests)
                        ? reservation.guests.filter(
                            (g: any) => g.type === 'child'
                        ).length
                        : 0,
                    rooms: 1,
                },
                guestDetails: Array.isArray(reservation.guests)
                    ? reservation.guests.map((guest: any) => ({
                        type: guest.type,
                        firstName: guest.firstName,
                        lastName: guest.lastName,
                        dateOfBirth: guest.dateOfBirth || guest.dob,
                        email:
                            guest.type === 'adult'
                                ? reservation.bookingUserEmail
                                : undefined,
                        phone:
                            guest.type === 'adult'
                                ? reservation.bookingUserPhone || undefined
                                : undefined,
                    }))
                    : [],
                paymentMethod: reservation.paymentMethod,
                bookingCode: reservation.bookingCode,
                reservationId: reservation.id,
                bookedAt: reservation.bookedAt.toISOString(),
                bookingStatus: 'cancelled' as BookingStatus,
            };

            if (reservation.propertyCode && reservation.roomTypeCode) {
                if (
                    selfAriActiveD &&
                    !activeIntegrationTypeD &&
                    reservation.propertyCode &&
                    reservation.roomTypeCode
                ) {
                    Promise.all([
                        this.ariManupulationRepo.increaseAvailableRooms({
                            propertyCode: reservation.propertyCode,
                            dates: reservationDates,
                            roomInfos: [
                                {
                                    roomTypeCode: reservation.roomTypeCode,
                                    numberOfRooms:
                                        reservation.finalPrice?.requestedRooms,
                                },
                            ],
                        }),
                        this.emailService.reservationCancelEmail(
                            emailBookingDetails
                        ),
                    ]).catch(error => {
                        console.error('Non-blocking operations failed:', error);
                    });
                } else {
                    this.emailService
                        .reservationCancelEmail(emailBookingDetails)
                        .catch(error => {
                            console.error(
                                'Failed to send cancellation email:',
                                error
                            );
                        });
                }
            } else {
                // If no room info, just send the email
                this.emailService
                    .reservationCancelEmail(emailBookingDetails)
                    .catch(error => {
                        console.error(
                            'Failed to send cancellation email:',
                            error
                        );
                    });
            }

            // After successful cancellation in DB and before returning response, attempt N-Genius refund if applicable
            let refundResult: { success: boolean; message: string; data?: any } | null = null;
            try {
                console.log(`[DEBUG - REFUND FLOW] 🔍 Looking up payment record for reservation: ${reservationId}`);
                const paymentRecord = await prisma.payment.findFirst({
                    where: { reservationId },
                    select: {
                        paymentIntentId: true,
                        paymentMethod: true,
                        PropertyPaymentIntegration: true,
                    }
                });
                
                console.log(`[DEBUG - REFUND FLOW] 📄 Payment record found:`, JSON.stringify(paymentRecord));

                if (paymentRecord?.paymentIntentId && paymentRecord.paymentMethod === 'payment_gateway') {
                    console.log(`[DEBUG - REFUND FLOW] 💸 Triggering N-Genius refund for order: ${paymentRecord.paymentIntentId}`);
                    refundResult = await ngeniusService.processRefund(paymentRecord.paymentIntentId, paymentRecord.PropertyPaymentIntegration?.outletId);

                    console.log(`[DEBUG - REFUND FLOW] 📥 Refund result received:`, JSON.stringify(refundResult));

                    if (!refundResult.success) {
                        console.error(`[DEBUG - REFUND FLOW] ⚠️ Refund failed for reservation ${reservationId}: ${refundResult.message}`);
                    }
                } else {
                    console.log(`[DEBUG - REFUND FLOW] ⏭️ Skipping refund. reason: No paymentIntentId or method is not payment_gateway.`);
                }
            } catch (refundError) {
                console.error(`[DEBUG - REFUND FLOW] ❌ Error during refund for reservation ${reservationId}:`, refundError);
                refundResult = { success: false, message: 'Refund processing encountered an error' };
            }

            const returnData = {
                ...cancelledReservation,
                refund: refundResult
            };

            return successResponse(
                'Reservation cancelled successfully',
                returnData
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to cancel reservation',
                    error.message
                );
            }
            return errorResponse('Failed to cancel reservation');
        }
    }

    public async noShowReservation(
        reservationId: string
    ): Promise<IApiResponse> {
        try {
            const reservation =
                await this.reservationRepository.getReservationById(
                    reservationId
                );

            if (!reservation) {
                return errorResponse('Reservation not found');
            }

            const currentCheckout = reservation.checkOutDate;
            const additionalDates = this.generateDateRange(
                reservation.checkInDate,
                currentCheckout
            );

            const noShowReservation =
                await this.reservationRepository.NoShow(reservationId);

            // Increase room availability back
            if (reservation.propertyCode && reservation.roomTypeCode) {
                await this.ariManupulationRepo.increaseAvailableRooms({
                    propertyCode: reservation.propertyCode,
                    dates: additionalDates,
                    roomInfos: [
                        {
                            roomTypeCode: reservation.roomTypeCode,
                            numberOfRooms:
                                reservation.finalPrice?.requestedRooms,
                        },
                    ],
                });
            }

            return successResponse('Status updated to No show', reservation);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update reservation status',
                    error.message
                );
            }
            return errorResponse('Failed to update reservation status');
        }
    }
    public async amendReservation(
        reservationId: string,
        newCheckoutDate: Date
    ): Promise<IApiResponse> {
        try {
            const reservation =
                await this.reservationRepository.getReservationById(
                    reservationId
                );

            if (!reservation) {
                return errorResponse('Reservation not found');
            }

            // Calculate additional dates needed
            const currentCheckout = reservation.checkOutDate;
            const additionalDates = this.generateDateRange(
                currentCheckout,
                newCheckoutDate
            );

            if (
                additionalDates.length > 0 &&
                reservation.propertyCode &&
                reservation.roomTypeCode
            ) {
                // Decrease availability for extended dates
                await this.ariManupulationRepo.decreaseAvailableRooms({
                    propertyCode: reservation.propertyCode,
                    dates: additionalDates,
                    roomInfos: [
                        {
                            roomTypeCode: reservation.roomTypeCode,
                            numberOfRooms: 1,
                        },
                    ],
                });
            }

            // Update reservation
            const updatedReservation =
                await this.reservationRepository.amendReservation(
                    reservationId,
                    newCheckoutDate
                );

            return successResponse(
                'Reservation amended successfully',
                updatedReservation
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to amend reservation',
                    error.message
                );
            }
            return errorResponse('Failed to amend reservation');
        }
    }
}
