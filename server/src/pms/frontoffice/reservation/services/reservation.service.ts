import {
    ReservationRepository,
    PriceBrakeDownRepo,
    AriManupulationRepo,
    GuestRepository,
} from '../repository';
import { successResponse, errorResponse } from '../../../../utils/return';
import { IApiResponse } from '../../../../utils/return.types';
import {
    IAriManulupulation,
    ICGuest,
    IReservationUpdatePayload,
    IReservationPromotionCreate,
    IBookingAddonCreate,
    ICReservationR,
    IGuestCheckInDetails,
    ICReservationPayload,
    DeviceType,
    IAddonBreakdown,
    ICPricingBreakDown,
    IPropertyDetailsFromMiddleware,
    ICReservationPayloadForEmail
} from '../types';
import { prisma } from '../../../../config';
import { IPropertyCodeAndIds } from '../../../../dashboard/types';
import { DashUtilsRepo } from '../../../../dashboard/repository';
import { nowUTC, toUTC, toUTCDate } from '../../../../utils';
import {
    BookingAddonRepository,
    // ReservationPromotionRepository,
} from '../repository/reservation.repository';
import { ReservationEmailService } from '../../../../sms-email-service/service';
import { LoyaltyGuestRepository } from '../../../../loyalty/repository';
import { RTIntegrationDao } from '../../../../integrations/rate-tiger/dao/rt-integration.dao';
import { RTReservationPushService } from '../../../../integrations/rate-tiger/services/rt-reservation-push.service';
import { CurrencyCode } from '../../../../tax-system/interfaces/tourist-tax.type';
import { BookingStatus } from '../types/reservation.type';
import { ngeniusService } from '../../../../payment/services/ngenius.service';
import { CreationLoyalityService } from '../../../../loyalty/services';
import { CreationGuestRepository } from '../../../../loyalty/repository/creation-guest.repository';
import { PromoCodeRepository } from '../../../../promocode/repository/index';
export class ReservationService {
    reservationRepository: ReservationRepository;
    priceBrakeDownRepo: PriceBrakeDownRepo;
    ariManupulationRepo: AriManupulationRepo;
    guestRepository: GuestRepository;
    dashUtils: DashUtilsRepo;
    bookingAddonRepository: BookingAddonRepository;
    // reservationPromotionRepository: ReservationPromotionRepository;
    emailService: ReservationEmailService;
    loyalityGuestRepo: LoyaltyGuestRepository;
    creationGuestRepository: CreationGuestRepository;
    promoCodeRepository: PromoCodeRepository;
    constructor() {
        this.reservationRepository = new ReservationRepository();
        this.priceBrakeDownRepo = new PriceBrakeDownRepo();
        this.ariManupulationRepo = new AriManupulationRepo();
        this.guestRepository = new GuestRepository();
        this.dashUtils = new DashUtilsRepo();
        this.bookingAddonRepository = new BookingAddonRepository();
        // this.reservationPromotionRepository =
        //     new ReservationPromotionRepository();
        this.emailService = new ReservationEmailService();
        this.loyalityGuestRepo = new LoyaltyGuestRepository();
        this.creationGuestRepository = new CreationGuestRepository();
        this.promoCodeRepository = new PromoCodeRepository();
    }

    private async generateBookingCode(propertyCode: string): Promise<string> {
        const code =
            'BOOK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const existingReservation =
            await this.reservationRepository.getReservaltionByCode(
                code,
                propertyCode
            );

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


    private async resolveRefundStrategy(orderReference: string): Promise<{
        strategy: 'same_day' | 'day_after';
        outletId: string | undefined;
        reason: string;
    }> {
        console.log(`\n[REFUND STRATEGY] 🔍 Resolving strategy for orderReference: ${orderReference}`);

        try {
            // ── Step 1: Check if same_day_refund column exists (migration guard) ──
            try {
                const columnCheck = await (prisma as any).$queryRaw`
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'property_payment_integrations'
                      AND column_name = 'same_day_refund'
                `;
                const columnExists = Array.isArray(columnCheck) && columnCheck.length > 0;
                console.log(`[REFUND STRATEGY] 🗄️  Column 'same_day_refund' exists in DB: ${columnExists}`);

                if (!columnExists) {
                    console.error(`[REFUND STRATEGY] ❌ MIGRATION NOT RUN!`);
                    console.error(`[REFUND STRATEGY]    Run: npx prisma migrate dev --name add_same_day_refund_to_payment_integration`);
                    console.error(`[REFUND STRATEGY]    Defaulting to 'same_day' since that is the intended default.`);
                    return {
                        strategy: 'same_day',
                        outletId: undefined,
                        reason: 'MIGRATION_NOT_RUN — defaulting to same_day',
                    };
                }
            } catch (colErr) {
                console.warn(`[REFUND STRATEGY] ⚠️  Could not verify column existence:`, colErr);
            }

            // ── Step 2: Find Payment record by paymentIntentId (N-Genius orderReference) ──
            const payment = await prisma.payment.findFirst({
                where: { paymentIntentId: orderReference },
                include: {
                    PropertyPaymentIntegration: true,
                },
            });

            console.log(`[REFUND STRATEGY] 💳 Payment found: ${payment ? 'YES' : 'NO'}`);

            if (!payment) {
                console.warn(`[REFUND STRATEGY] ⚠️  No payment record found for orderReference: ${orderReference}`);
                console.warn(`[REFUND STRATEGY]    Defaulting to 'same_day' (safe default for new payments).`);
                return {
                    strategy: 'same_day',
                    outletId: undefined,
                    reason: 'NO_PAYMENT_RECORD_FOUND — defaulting to same_day',
                };
            }

            console.log(`[REFUND STRATEGY]    Payment ID                   : ${payment.id}`);
            console.log(`[REFUND STRATEGY]    propertyPaymentIntegrationId : ${payment.propertyPaymentIntegrationId ?? '(null)'}`);

            const integration = payment.PropertyPaymentIntegration;

            if (!integration) {
                console.warn(`[REFUND STRATEGY] ⚠️  No PropertyPaymentIntegration linked to payment: ${payment.id}`);
                console.warn(`[REFUND STRATEGY]    Defaulting to 'same_day'.`);
                return {
                    strategy: 'same_day',
                    outletId: undefined,
                    reason: 'NO_INTEGRATION_LINKED — defaulting to same_day',
                };
            }

            // ── Step 3: Read sameDayRefund flag ──
            // Cast needed until Prisma client is regenerated after migration
            const sameDayRefund: boolean = (integration as any).sameDayRefund ?? true;
            const strategy: 'same_day' | 'day_after' = sameDayRefund ? 'same_day' : 'day_after';
            const outletId: string = integration.outletId;

            console.log(`[REFUND STRATEGY] ✅ Resolution complete:`);
            console.log(`[REFUND STRATEGY]    Integration ID  : ${integration.id}`);
            console.log(`[REFUND STRATEGY]    outletId        : ${outletId}`);
            console.log(`[REFUND STRATEGY]    sameDayRefund   : ${sameDayRefund}`);
            console.log(`[REFUND STRATEGY]    ➡️  Strategy     : ${strategy.toUpperCase()}`);

            return {
                strategy,
                outletId,
                reason: `sameDayRefund=${sameDayRefund} from integration ${integration.id}`,
            };
        } catch (error) {
            console.error(`[REFUND STRATEGY] ❌ Unexpected error:`, error);
            // Safe default — same_day is the intended default per requirements
            return {
                strategy: 'same_day',
                outletId: undefined,
                reason: `ERROR_RESOLVING — defaulting to same_day: ${error instanceof Error ? error.message : 'unknown'}`,
            };
        }
    }

    public async createReservation(
        payload: ICReservationPayload,
        propertyDetails: IPropertyDetailsFromMiddleware,
        countryCode: string,
        deviceType: DeviceType
    ): Promise<IApiResponse> {
        try {
            const {
                propertyCode,
                roomTypeCode,
                ratePlanCode,
                hotelName,
                roomName,
                guestDetails,
                reservationStartDate,
                reservationEndDate,
                platforms,
                bookingUserEmail,
                bookingUserPhone,
                currencyCode,
                finalPrice,
                paymentMethod,
                bookingSource,
                promoCode,
                agencyId,
                bankDetails,
            } = payload;
            const primaryGuestData = guestDetails.find(
                (g) => g.type === 'adult'
            );
            if (!primaryGuestData) {
                return errorResponse('At least one adult guest is required');
            }
            let promoCodeId: string | null = null;
            let promoCodeDetails: any = null;

            if (promoCode && promoCode !== '') {
                promoCodeDetails =
                    await this.promoCodeRepository.getPromoCodeByIdOrCode(
                        propertyDetails.id,
                        promoCode
                    );
                if (!promoCodeDetails) {
                    return errorResponse('Promo code is invalid');
                }
                promoCodeId = promoCodeDetails.id;
            }

            let primaryGuestId: string;
            const existingGuest =
                await this.guestRepository.getGuestByEmail(bookingUserEmail);

            if (existingGuest) {
                primaryGuestId = existingGuest.id;
            } else {
                const newGuestPayload: ICGuest = {
                    firstName: primaryGuestData.firstName,
                    lastName: primaryGuestData.lastName,
                    email: bookingUserEmail,
                    phoneNumber: bookingUserPhone || null,
                    propertyId: propertyDetails.id,
                    userType: primaryGuestData.type as 'adult',
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
            this.loyalityGuestRepo
                .addGuestTOLoyalty(bookingUserEmail, primaryGuestId)
                .catch((err) =>
                    console.error('loyaltyGuestRepo.addGuestTOLoyalty:', err)
                );

            const bookingCode = await this.generateBookingCode(propertyCode);
            const paymentMethods = this.mapPaymentMethod(paymentMethod);

            const rateplan = await this.ariManupulationRepo.getRatePlanName(
                ratePlanCode,
                propertyDetails.id
            );
            if (!rateplan) {
                return errorResponse('Rate plan name not found');
            }

            const propertyConfig =
                await this.ariManupulationRepo.getPropertyConfig(
                    propertyDetails.id
                );

            const activeIntegration =
                await this.ariManupulationRepo.getActiveIntegration(
                    propertyDetails.id,
                    propertyConfig
                );

            const isFikafiPayment =
                bankDetails?.selectedPaymentIntegrations?.paymentIntegration
                    ?.name === 'fikafi';

            const checkIn = new Date(reservationStartDate);
            const checkOut = new Date(reservationEndDate);
            const numberOfNights = Math.max(
                1,
                Math.ceil(
                    (checkOut.getTime() - checkIn.getTime()) /
                    (24 * 60 * 60 * 1000)
                )
            );

            let paidAmount = 0;
            let initialBookingStatus: 'pending' | 'confirmed' = 'confirmed';

            if (paymentMethods === 'payment_gateway') {
                if (isFikafiPayment) {
                    paidAmount = 0;
                    initialBookingStatus = 'pending';
                } else {
                    paidAmount = finalPrice.currentChargeableAmount;
                }
            }
            if (
                activeIntegration &&
                activeIntegration.name === 'Rate Tiger'
            ) {
                const rtConfig = await RTIntegrationDao.getRTConfig(
                    propertyDetails.id,
                    activeIntegration.type
                );

                if (!rtConfig) {
                    return errorResponse(
                        'Rate Tiger integration config not found for this property'
                    );
                }

                const rtResult = await RTReservationPushService.pushCommit(
                    payload,
                    countryCode,
                    bookingCode,
                    rtConfig
                );

                if (!rtResult.success) {
                    return errorResponse(
                        `Rate Tiger sync failed: ${rtResult.message}`
                    );
                }
            }

            const reservationPayload: ICReservationR = {
                bookingCode,
                propertyId: propertyDetails.id,
                propertyCode,
                hotelName,
                roomTypeCode,
                ratePlanCode,
                roomName,
                ratePlanName: rateplan.ratePlanName,
                checkInDate: null,
                checkOutDate: null,
                bookedAt: nowUTC(),
                cancelledAt: null,
                reservationEndDate: toUTC(reservationEndDate),
                reservationStartDate: toUTC(reservationStartDate),
                primaryGuestId,
                guests: guestDetails,
                bookingUserEmail,
                bookingUserPhone,
                amount: finalPrice.totalAmount,
                currencyCode,
                finalPrice,
                pricingBrakedownId: null,
                paidAmount,
                extraAmountToPay: finalPrice.latterpayableAmount || 0,
                refundAmount: 0,
                timezone: propertyDetails.timezone || 'Asia/Kolkata',
                countryCode: countryCode || 'IN',
                paymentMethod: paymentMethods,
                paymentImages: null,
                bookingStatus: initialBookingStatus,
                cancellationReason: null,
                deviceTypes: deviceType || 'desktop',
                bookingSource: bookingSource || 'direct',
                isPromoUsed: !!(
                    payload.promoCode ||
                    (payload.selectedPromotions &&
                        payload.selectedPromotions.length > 0)
                ),
                promoId: promoCodeId || null,
                agencyId: agencyId || null,
                platforms: platforms || 'web',
            };

            const reservation =
                await this.reservationRepository.createReservation(
                    reservationPayload
                );

            if (promoCode && promoCodeDetails) {
                const promoTasks: Promise<any>[] = [
                    this.reservationRepository.createReservationPromoCode({
                        reservationId: reservation.id,
                        promoCodeId: promoCodeDetails.id,
                        amount: finalPrice.promoCodeDiscount || 0,
                        currency: currencyCode,
                    }),
                ];

                if (promoCodeDetails.usageLimit !== null) {
                    promoTasks.push(
                        this.promoCodeRepository.decreasePromoCodeUsageCount(
                            promoCodeDetails.id
                        )
                    );
                }

                await Promise.all(promoTasks);
            }

            if (guestDetails && guestDetails.length > 0) {
                await this.reservationRepository.createReservationGuests(
                    reservation.id,
                    guestDetails
                );
            }

            const ngeniusOrderRef = payload?.ngeniusOrderRef;
            if (ngeniusOrderRef) {
                const count =
                    await this.reservationRepository.linkPaymentToReservation(
                        ngeniusOrderRef,
                        reservation.id
                    );
                if (count > 0) {
                    console.log(
                        `✅ Linked reservation ${reservation.id} to N-Genius payment ${ngeniusOrderRef} (${count} record(s))`
                    );
                } else {
                    console.warn(
                        `⚠️ No N-Genius payment found for reference ${ngeniusOrderRef}`
                    );
                }
            }

            const priceBreakdownPayload: ICPricingBreakDown = {
                reservationId: reservation.id,
                totalAmount: finalPrice.totalAmount,
                amountBeforeTax: finalPrice.amountBeforeTax,
                taxedAmount: finalPrice.taxedAmount,
                totalAddonAmount: finalPrice.totalAddonAmount,
                totalPromotionAmount: finalPrice.totalPromotionAmount,
                currentChargeableAmount: finalPrice.currentChargeableAmount,
                latterpayableAmount: finalPrice.latterpayableAmount,
                promoCodeDiscount: finalPrice.promoCodeDiscount,
                currencyCode: finalPrice.currencyCode,
                loyalityDiscount: finalPrice.loyalityDiscount,
            };

            await this.priceBrakeDownRepo.createFullPricingBreakdown(
                reservation.id,
                priceBreakdownPayload,
                finalPrice.dailyPriceBrakeDown || [],
                finalPrice.taxBrakeDown || [],
                finalPrice.addonBrakeDown || [],
                finalPrice.promotionBrakeDown || []
            );

            if (
                finalPrice.addonBrakeDown &&
                finalPrice.addonBrakeDown.length > 0
            ) {
                const addonPayloads: IBookingAddonCreate[] = finalPrice
                    .addonBrakeDown
                    .filter((addon: IAddonBreakdown) => addon.addonId)
                    .map((addon: IAddonBreakdown) => ({
                        reservationId: reservation.id,
                        addonId: addon.addonId,
                        name: addon.name,
                        unitPrice: addon.amount,
                        quantity: addon.quantity,
                        totalPrice: addon.totalAmount,
                        currencyCode: addon.currencyCode,
                        specialInstructions: null,
                        type: addon.type,
                        date: new Date(addon.date),
                    }));

                if (addonPayloads.length > 0) {
                    await this.bookingAddonRepository.createBookingAddons(
                        addonPayloads
                    );
                }
            }


            const reservationDates = this.generateDateRange(
                toUTCDate(reservationStartDate),
                toUTCDate(reservationEndDate)
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

            const nonBlockingTasks: Promise<any>[] = [
                ...(propertyConfig.selfAriActive && !activeIntegration
                    ? [
                        this.ariManupulationRepo.decreaseAvailableRooms(
                            ariPayload
                        ),
                    ]
                    : []),

                this.emailService.reservationConfirmation({
                    ...payload,
                    numberOfNights,
                    bookingCode: reservation.bookingCode,
                    reservationId: reservation.id,
                    bookedAt: reservation.bookedAt.toISOString(),
                    bookingStatus: reservation.bookingStatus,
                    ratePlanName:rateplan.ratePlanName
                }),

                // loyalty — pass isLoyalityGuest flag from payload
                this.loyalityGuestRepo.handlePostBookingLoyalty(
                    bookingUserEmail,
                    propertyDetails.creationId,
                    propertyDetails.id,
                    payload.isLoyalityGuest
                ),
            ];

            Promise.all(nonBlockingTasks).catch((err) =>
                console.error('Non-blocking operations failed:', err)
            );

            return successResponse(
                'Reservation created successfully',
                reservation
            );
        } catch (error) {
            console.error('Error creating reservation:', error);
            return error instanceof Error
                ? errorResponse('Failed to create reservation', error.message)
                : errorResponse('Failed to create reservation');
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
            const existingReservation =
                await this.reservationRepository.getReservaltionByCode(
                    reservationCode,
                    updatePayload.propertyCode
                );

            if (!existingReservation) {
                return errorResponse('Reservation not found');
            }

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

            const startDate = new Date(updatePayload.checkInDate);
            const endDate = new Date(updatePayload.checkOutDate);
            const oldStartDate = existingReservation.reservationStartDate;
            const oldEndDate = existingReservation.reservationEndDate;

            if (startDate >= endDate) {
                return errorResponse(
                    'Check-in date must be before check-out date'
                );
            }

            const oldDates = this.generateDateRange(
                oldStartDate,
                oldEndDate
            );

            const newDates = this.generateDateRange(
                startDate,
                endDate
            );

            const oldRooms = updatePayload.previousRooms || 1;
            const newRooms = updatePayload.requestedRooms;

            const oldDateStrings = oldDates.map(
                d => d.toISOString().split('T')[0]
            );
            const newDateStrings = newDates.map(
                d => d.toISOString().split('T')[0]
            );

            const datesToFree = oldDates.filter(
                (_, i) => !newDateStrings.includes(oldDateStrings[i])
            );
            const datesToReserve = newDates.filter(
                (_, i) => !oldDateStrings.includes(newDateStrings[i])
            );
            const commonDates = oldDates.filter((_, i) =>
                newDateStrings.includes(oldDateStrings[i])
            );

            if (datesToReserve.length > 0 || newRooms > oldRooms) {
                const additionalRoomsNeeded = newRooms - oldRooms;

                if (datesToReserve.length > 0) {
                    const isAvailable =
                        await this.reservationRepository.checkRoomAvailability(
                            updatePayload.propertyCode,
                            updatePayload.roomTypeCode,
                            datesToReserve,
                            newRooms
                        );
                    if (!isAvailable) {
                        return errorResponse(
                            'Not enough rooms available for the selected dates'
                        );
                    }
                }

                if (additionalRoomsNeeded > 0) {
                    const isAvailable =
                        await this.reservationRepository.checkRoomAvailability(
                            updatePayload.propertyCode,
                            updatePayload.roomTypeCode,
                            commonDates,
                            additionalRoomsNeeded
                        );
                    if (!isAvailable) {
                        return errorResponse(
                            'Not enough rooms available for the selected dates'
                        );
                    }
                }
            }

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
                        checkInDate: startDate,
                        checkOutDate: endDate,
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

            if (selfAriActiveU && !activeIntegrationTypeU) {
                await prisma.$transaction(async (tx: any) => {
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

            const updateData: Partial<ICReservationR> = {
                reservationStartDate: startDate,
                reservationEndDate: endDate,
                amount: newAmount,
                finalPrice: updatePayload.finalPrice,
                guests: updatePayload.guests,
                bookingUserEmail: updatePayload.bookingUserEmail,
                bookingUserPhone: updatePayload.bookingUserPhone || null,
                bookingStatus: 'modified' as BookingStatus,
                currencyCode: updatePayload.currencyCode,
                extraAmountToPay: existingReservation.extraAmountToPay + extraAmountToPay,
                refundAmount: existingReservation.refundAmount + refundAmount,
            };

            const updateNumberOfNights = Math.max(
                1,
                Math.ceil(
                    (endDate.getTime() - startDate.getTime()) /
                    (24 * 60 * 60 * 1000)
                )
            );
            const addonBrakeDown =
                updatePayload.finalPrice.addonBrakeDown || [];
            const addonPayloads: IBookingAddonCreate[] = addonBrakeDown
                .filter((addon: IAddonBreakdown) => addon.addonId)
                .map((addon: IAddonBreakdown) => ({
                    reservationId: existingReservation.id,
                    addonId: addon.addonId,
                    name: addon.name,
                    unitPrice: addon.amount,
                    quantity: addon.quantity,
                    totalPrice: addon.totalAmount,
                    currencyCode:
                        addon.currencyCode || updatePayload.currencyCode,
                    specialInstructions: null,
                    type: addon.type,
                    date: new Date(addon.date),
                }));

            const promotionBrakeDown =
                updatePayload.finalPrice.promotionBrakeDown || [];
            const promotionPayloads: IReservationPromotionCreate[] =
                promotionBrakeDown
                    .filter(
                        (promo: any) =>
                            promo.id && promo.restrictionType !== 'payLater'
                    )
                    .map((promo: any) => ({
                        bookingCode: existingReservation.bookingCode,
                        bookingId: existingReservation.id,
                        promotionId:
                            promo.promotionType === 'mlos' ? null : promo.id,
                        mlosId:
                            promo.promotionType === 'mlos' ? promo.id : null,
                        amount: promo.discountAmount,
                        currency: updatePayload.currencyCode as CurrencyCode,
                        promotionType: promo.promotionType,
                        type: promo.type,
                    }));

            const updatedReservation =
                await this.reservationRepository.updateReservationWithTransaction(
                    existingReservation.id,
                    updateData,
                    updateData.guests,
                    addonPayloads,
                    promotionPayloads
                );

            // ── Replace full pricing breakdown ─────────────────────
            const updateBreakdownHeader: ICPricingBreakDown = {
                reservationId: existingReservation.id,
                totalAmount: updatePayload.finalPrice.totalAmount || 0,
                amountBeforeTax: updatePayload.finalPrice.amountBeforeTax || 0,
                taxedAmount: updatePayload.finalPrice.taxedAmount || 0,
                totalAddonAmount: updatePayload.finalPrice.totalAddonAmount || 0,
                totalPromotionAmount: updatePayload.finalPrice.totalPromotionAmount || 0,
                currentChargeableAmount: updatePayload.finalPrice.currentChargeableAmount || updatePayload.finalPrice.totalAmount || 0,
                latterpayableAmount: updatePayload.finalPrice.latterpayableAmount || 0,
                promoCodeDiscount: updatePayload.finalPrice.promoCodeDiscount || 0,
                currencyCode: updatePayload.currencyCode,
                loyalityDiscount: updatePayload.finalPrice.loyalityDiscount || 0,
            };

            await this.priceBrakeDownRepo.replacePricingBreakdown(
                existingReservation.id,
                existingReservation.pricingBrakedownId || null,
                updateBreakdownHeader,
                updatePayload.finalPrice.dailyPriceBrakeDown || [],
                updatePayload.finalPrice.taxBrakeDown || [],
                updatePayload.finalPrice.addonBrakeDown || [],
                updatePayload.finalPrice.promotionBrakeDown || []
            );


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
                    oldCheckIn: oldStartDate,
                    oldCheckOut: oldEndDate,
                    newCheckIn: startDate,
                    newCheckOut: endDate,
                    nightsChanged:
                        updateNumberOfNights -
                        (existingReservation.finalPrice?.numberOfNights || 1),
                },
            };

            // const emailBookingDetails: ICReservationPayloadForEmail = {
            //     // startDate: updatePayload.checkInDate,
            //     // endDate: updatePayload.checkOutDate,
            //     reservationStartDate: updatePayload.checkInDate,
            //     reservationEndDate: updatePayload.checkOutDate,
            //     propertyCode: updatePayload.propertyCode,
            //     hotelName: existingReservation.hotelName || '',
            //     roomTypeCode: updatePayload.roomTypeCode,
            //     ratePlanCode: updatePayload.ratePlanCode,
            //     numberOfRooms: updatePayload.requestedRooms,
            //     numberOfNights: updateNumberOfNights,
            //     // refundAmount: updatedReservation.refundAmount,
            //     finalPrice: updatePayload.finalPrice,
            //     // promoCode:updatePayload.promoCode || null,
            //     currencyCode: updatePayload.currencyCode,
            //     bookingSource: existingReservation.bookingSource,
            //     bookingUserEmail: updatePayload.bookingUserEmail,
            //     bookingUserPhone: updatePayload.bookingUserPhone,
            //     roomName:"",
            //     // guests: {
            //     //     adults: updatePayload.rooms.reduce(
            //     //         (sum, room) => sum + room.adults,
            //     //         0
            //     //     ),
            //     //     children: updatePayload.rooms.reduce(
            //     //         (sum, room) => sum + room.children,
            //     //         0
            //     //     ),
            //     //     rooms: updatePayload.rooms.length,
            //     // },
            //     // guests: updatePayload.guests.map(guest => ({
            //     //     type: guest.type,
            //     //     firstName: guest.firstName,
            //     //     lastName: guest.lastName,
            //     //     dateOfBirth: guest.dateOfBirth,
            //     //     // email:
            //     //     //     guest.type === 'adult'
            //     //     //         ? updatePayload.bookingUserEmail
            //     //     //         : undefined,
            //     //     // phone:
            //     //     //     guest.type === 'adult'
            //     //     //         ? updatePayload.bookingUserPhone
            //     //     //         : undefined,
            //     // })),
            //     paymentMethod: existingReservation.paymentMethod,
            //     bookingCode: existingReservation.bookingCode,
            //     reservationId: existingReservation.id,
            //     bookedAt: existingReservation.bookedAt.toISOString(),
            //     bookingStatus: 'modified' as BookingStatus,
            // };

            // this.emailService
            //     .reservationUpdatedEmail(emailBookingDetails)
            //     .catch(error => {
            //         console.error(
            //             'Failed to send reservation update email:',
            //             error
            //         );
            //     });

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
            if (specificPropertyId || specificPropertyCode) {
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

                const specificProperty = allAccessibleProperties.find(
                    p =>
                        p.id === specificPropertyId ||
                        p.code === specificPropertyCode
                );
                return { success: true, propertyIds: [specificProperty!.id] };
            }

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
                    bookingSource,
                    deviceType,
                    bookingCode,
                    guestName,
                    promoCode,
                    countryCode,
                    dateFilterType
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


    public async deleteReservation(
        reservationId: string,
        cancellationReason: string,
    ): Promise<IApiResponse> {
        try {
            const reservation =
                await this.reservationRepository.getReservationById(
                    reservationId
                );

            if (!reservation) {
                return errorResponse('Reservation not found');
            }

            const reservationDates = this.generateDateRange(
                reservation.reservationStartDate,
                reservation.reservationEndDate
            );
            let refundResult: { success: boolean; message: string; data?: any } | null = null;

            try {
                const paymentRecord = await prisma.payment.findFirst({
                    where: { reservationId },
                    select: {
                        id: true,
                        paymentIntentId: true,
                        paymentMethod: true,
                        status: true,
                        amount: true,
                        currency: true,
                        propertyPaymentIntegrationId: true,
                        PropertyPaymentIntegration: {
                            select: {
                                id: true,
                                outletId: true,
                                isActive: true,

                            },
                        },
                    },
                });


                if (!paymentRecord) {
                    console.warn(`[CANCEL RESERVATION] ⚠️  No payment record found. Skipping refund.`);
                } else if (!paymentRecord.paymentIntentId) {
                    console.warn(`[CANCEL RESERVATION] ⚠️  paymentIntentId is null. Skipping refund.`);
                } else if (paymentRecord.paymentMethod !== 'payment_gateway') {
                    console.log(`[CANCEL RESERVATION] ⏭️  Payment method is '${paymentRecord.paymentMethod}'. Not a gateway payment — skipping refund.`);
                } else {
                    // ── This IS a gateway payment — resolve strategy and refund ──────────
                    const orderReference = paymentRecord.paymentIntentId;

                    console.log(`\n[CANCEL RESERVATION] 💡 Gateway payment detected. Resolving refund strategy...`);
                    console.log(`[CANCEL RESERVATION]    orderReference : ${orderReference}`);

                    const { strategy, outletId, reason } = await this.resolveRefundStrategy(orderReference);

                    console.log(`\n[CANCEL RESERVATION] 🎯 Refund strategy resolved:`);
                    console.log(`[CANCEL RESERVATION]    strategy  : ${strategy.toUpperCase()}`);
                    console.log(`[CANCEL RESERVATION]    outletId  : ${outletId ?? '(not resolved)'}`);
                    console.log(`[CANCEL RESERVATION]    reason    : ${reason}`);

                    if (strategy === 'same_day') {
                        // ── SAME-DAY: Cancel capture → Reverse authorization ──────────────
                        console.log(`\n[CANCEL RESERVATION] ⚡ Routing to SAME-DAY refund (cancel capture + reverse auth)`);

                        if (!outletId) {
                            console.error(`[CANCEL RESERVATION] ❌ Cannot proceed with same-day refund — outletId is missing.`);
                            return errorResponse(
                                'Refund failed: outletId could not be resolved for same-day refund. Reservation was not cancelled.'
                            );
                        }

                        refundResult = await ngeniusService.processSameDayRefund(orderReference, outletId);
                    } else {
                        // ── DAY-AFTER: Standard refund API ───────────────────────────────
                        console.log(`\n[CANCEL RESERVATION] 🕐 Routing to DAY-AFTER refund (standard refund API)`);
                        refundResult = await ngeniusService.processRefund(orderReference, outletId);
                    }

                    console.log(`\n[CANCEL RESERVATION] 📥 Refund result:`, JSON.stringify(refundResult));

                    if (!refundResult.success) {
                        console.error(`[CANCEL RESERVATION] ❌ Refund failed: ${refundResult.message}`);
                        return errorResponse(
                            `Refund failed: ${refundResult.message}. Reservation was not cancelled.`
                        );
                    }

                    console.log(`[CANCEL RESERVATION] ✅ Refund succeeded. Proceeding to cancel reservation in DB.`);
                }
            } catch (refundError) {
                console.error(`[CANCEL RESERVATION] ❌ Unexpected error during refund:`, refundError);
                return errorResponse(
                    'Refund processing encountered an unexpected error. Reservation was not cancelled.'
                );
            }
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

            let actualRefundAmount = 0;
            if (reservation.paymentMethod !== "pay_at_hotel") {
                actualRefundAmount = refundResult?.data?.refundAmount ?? refundResult?.data?.amount ?? 0;
            }
            const cancelledReservation =
                await this.reservationRepository.deleteReservation(
                    reservationId,
                    actualRefundAmount,
                    cancellationReason
                );

            const cancelNumberOfNights = Math.max(
                1,
                Math.ceil(
                    (reservation.reservationEndDate.getTime() -
                        reservation.reservationStartDate.getTime()) /
                    (24 * 60 * 60 * 1000)
                )
            );

            const emailBookingDetails: ICReservationPayloadForEmail = {
                reservationStartDate: reservation.reservationStartDate.toISOString(),
                reservationEndDate: reservation.reservationEndDate.toISOString(),
                propertyCode: reservation.propertyCode || '',
                hotelName: reservation.hotelName || '',
                refundAmount: cancelledReservation.refundAmount,
                roomTypeCode: reservation.roomTypeCode || '',
                ratePlanCode: reservation.ratePlanCode || '',
                numberOfRooms: reservation.finalPrice?.requestedRooms || 1,
                numberOfNights: cancelNumberOfNights,
                ratePlanName: reservation.ratePlanName || '',
                platforms:reservation.platforms,
                promoCode:reservation.promo?.code || '',
                roomName: reservation.roomName || '',
                finalPrice: reservation.finalPrice,
                currencyCode: reservation.currencyCode,
                bookingSource: reservation.bookingSource,
                bookingUserEmail: reservation.bookingUserEmail,
                bookingUserPhone: reservation.bookingUserPhone || '',
                guestDetails:reservation.guests,
                paymentMethod: reservation.paymentMethod,
                bookingCode: reservation.bookingCode,
                reservationId: reservation.id,
                bookedAt: reservation.bookedAt.toISOString(),
                bookingStatus: 'cancelled' as BookingStatus,
            };

            // Build non-blocking tasks array
            const cancelNonBlockingTasks: Promise<any>[] = [
                // Cancellation email
                this.emailService.reservationCancelEmail(emailBookingDetails),
                // Loyalty decrement (non-blocking)
                this.loyalityGuestRepo.handlePostCancelLoyalty(
                    reservation.bookingUserEmail,
                    reservation.propertyId
                ),
            ];

            // ARI increment only when self-ARI is on and no external CM/PMS
            if (
                reservation.propertyCode &&
                reservation.roomTypeCode &&
                selfAriActiveD &&
                !activeIntegrationTypeD
            ) {
                cancelNonBlockingTasks.push(
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
                    })
                );
            }

            Promise.all(cancelNonBlockingTasks).catch(error => {
                console.error('Non-blocking cancel operations failed:', error);
            });

            console.log(`\n[CANCEL RESERVATION] ✅ Reservation cancelled successfully: ${reservationId}`);
            console.log(`${'='.repeat(60)}\n`);

            return successResponse('Reservation cancelled successfully', {
                ...cancelledReservation,
                refund: refundResult,
            });
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

            const currentCheckout = reservation.reservationEndDate;
            const additionalDates = this.generateDateRange(
                reservation.reservationStartDate,
                currentCheckout
            );

            const noShowReservation =
                await this.reservationRepository.NoShow(reservationId);

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

    public async makeCheckOut(bookingCode: string): Promise<IApiResponse> {
        try {
            const reservation = await this.reservationRepository.getReservationByBookingCode(bookingCode);

            if (!reservation) {
                return errorResponse('Reservation not found');
            }

            const updatedReservation = await this.reservationRepository.makeCheckOut(reservation.id, nowUTC());

            return successResponse("Reservation checked out successfully", updatedReservation);
        } catch (error) {
            if (error instanceof Error) {
                return Promise.reject(new Error(`Failed to check out reservation: ${error.message}`));
            }
            return Promise.reject(new Error('Failed to check out reservation'));
        }
    }
    public async makeCheckIn(bookingCode: string, guestDetails: IGuestCheckInDetails): Promise<IApiResponse> {
        try {
            const reservation = await this.reservationRepository.getReservationByBookingCode(bookingCode);
            if (!reservation) {
                return errorResponse('Reservation not found');
            }
            const [updatedReservation, guestDetailsUpdateRes] = await Promise.all([
                this.reservationRepository.makeCheckIn(reservation.id, nowUTC()),
                this.guestRepository.addGuestDetails(reservation.primaryGuestId, guestDetails)
            ]);

            return successResponse("Reservation checked in successfully", updatedReservation);
        } catch (error) {
            if (error instanceof Error) {
                return Promise.reject(new Error(`Failed to check out reservation: ${error.message}`));
            }
            return Promise.reject(new Error('Failed to check out reservation'));
        }
    }
}
