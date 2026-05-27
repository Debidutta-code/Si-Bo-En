import { AgentCommissionType } from '../../agency/types';
import { ReservationEmailService } from '../../sms-email-service/service/reservation-email.service';
import { DashUtilsRepo } from '../../dashboard/repository';
import { IPropertyCodeAndIds } from '../../dashboard/types';
import { RTIntegrationDao } from '../../integrations/rate-tiger/dao/rt-integration.dao';
import { RTReservationPushService } from '../../integrations/rate-tiger/services/rt-reservation-push.service';
import { LoyaltyGuestRepository } from '../../loyalty/repository';
import { ngeniusService } from '../../payment/services/ngenius.service';
import { PromoCodeRepository } from '../../promocode/repository';
import { CurrencyCode } from '../../tax-system/interfaces';
import {
    IApiResponse,
    successResponse,
    errorResponse,
    paginatedSuccessResponse,
    toUTCDate,
    nowUTC,
} from '../../utils';
import {
    AgencyCommissionRepository,
    AgencyPricing,
    AriManupulationRepo,
    BookingAddonRepository,
    GuestRepository,
    IPropertyConfig,
    PaymentRepository,
    PriceBrakeDownRepo,
    ReservationRepository,
} from '../repository';
import {
    BookingStatus,
    DeviceType,
    IAddonBreakdown,
    IAriManulupulation,
    IBookingAddonCreate,
    ICReservationGuest,
    ICPrimaryGuest,
    ICPricingBreakDown,
    ICReservationR,
    ICReservationS,
    IGuestCheckInDetails,
    IPropertyDetailsFromMiddleware,
    IReservationPromotionCreate,
    IUReservation,
} from '../types';
import { IntegrationDispatcher } from '../../integrations/dispatcher/integration-dispatcher.service';
export class NewReservationService {
    private reservationRepository: ReservationRepository;
    private promoCodeRepository: PromoCodeRepository;
    private guestRepository: GuestRepository;
    private loyalityGuestRepo: LoyaltyGuestRepository;
    private ariManupulationRepo: AriManupulationRepo;
    private agencyCommissionRepository: AgencyCommissionRepository;
    private priceBrakeDownRepo: PriceBrakeDownRepo;
    private bookingAddonRepository: BookingAddonRepository;
    private dashUtils: DashUtilsRepo;
    private agencyPricingRepo: AgencyPricing;
    private paymentRepository: PaymentRepository;
    private reservationEmailService: ReservationEmailService;
    constructor() {
        this.reservationRepository = new ReservationRepository();
        this.promoCodeRepository = new PromoCodeRepository();
        this.guestRepository = new GuestRepository();
        this.loyalityGuestRepo = new LoyaltyGuestRepository();
        this.ariManupulationRepo = new AriManupulationRepo();
        this.agencyCommissionRepository = new AgencyCommissionRepository();
        this.priceBrakeDownRepo = new PriceBrakeDownRepo();
        this.bookingAddonRepository = new BookingAddonRepository();
        this.dashUtils = new DashUtilsRepo();
        this.agencyPricingRepo = new AgencyPricing();
        this.paymentRepository = new PaymentRepository();
        this.reservationEmailService = new ReservationEmailService();
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
    ): 'pay_at_hotel' | 'payment_gateway' {
        const methodMap: Record<string, 'pay_at_hotel' | 'payment_gateway'> = {
            payAtHotel: 'pay_at_hotel',
            pay_at_hotel: 'pay_at_hotel',
            paymentGateway: 'payment_gateway',
            ngenius: 'payment_gateway',
            payment_gateway: 'payment_gateway',
        };
        return methodMap[method] || 'pay_at_hotel';
    }
    public async createReservation(
        payload: ICReservationS,
        propertyDetails: IPropertyDetailsFromMiddleware,
        countryCode: CurrencyCode,
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
            const primaryGuestData = guestDetails.find(g => g.type === 'adult');
            if (!primaryGuestData) {
                return errorResponse('At least one adult guest is required');
            }
            let promoCodeId: string | null = null;
            let promoCodeDetails;
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
                const newGuestPayload: ICPrimaryGuest = {
                    firstName: primaryGuestData.firstName,
                    lastName: primaryGuestData.lastName,
                    email: bookingUserEmail,
                    phoneNumber: bookingUserPhone || null,
                    propertyId: propertyDetails.id,
                    userType: primaryGuestData.type as 'adult',
                };
                const newGuest =
                    await this.guestRepository.createGuest(newGuestPayload);
                primaryGuestId = newGuest.id;
            }

            const [bookingCode, 
                // loyalityGuestRepo,
                 rateplan, propertyConfig] =
                await Promise.all([
                    await this.generateBookingCode(propertyCode),
                    // await this.loyalityGuestRepo.addGuestTOLoyalty(
                    //     bookingUserEmail,
                    //     primaryGuestId
                    // ),
                    await this.ariManupulationRepo.getRatePlanName(
                        ratePlanCode,
                        propertyDetails.id
                    ),
                    await this.ariManupulationRepo.getPropertyConfig(
                        propertyDetails.id
                    ),
                ]);
            if (!propertyConfig)
                return errorResponse('Property config not found');
            const paymentMethods = this.mapPaymentMethod(paymentMethod);
            const reservationStart = new Date(reservationStartDate);
            const reservationEnd = new Date(reservationEndDate);
            const numberOfNights = Math.max(
                1,
                Math.ceil(
                    (reservationEnd.getTime() - reservationStart.getTime()) /
                    (24 * 60 * 60 * 1000)
                )
            );

            if (!rateplan) {
                return errorResponse('Rate plan not found');
            }
            const activeIntegration =
                await this.ariManupulationRepo.getActiveIntegration(
                    propertyDetails.id,
                    propertyConfig
                );
            let paidAmount = 0;
            let initialBookingStatus: 'pending' | 'confirmed' = 'confirmed';
            const isFikafiPayment =
                bankDetails?.selectedPaymentIntegrations?.paymentIntegration
                    ?.name === 'fikafi';
            if (paymentMethods === 'payment_gateway') {
                if (isFikafiPayment) {
                    paidAmount = 0;
                    initialBookingStatus = 'pending';
                } else {
                    paidAmount = finalPrice.currentChargeableAmount;
                }
            }
            if (activeIntegration) {
                console.log("activeIntegration1",activeIntegration)
                const result = await IntegrationDispatcher.pushCommit(
                    payload,
                    propertyDetails.id,
                    countryCode,
                    bookingCode,
                    activeIntegration
                );
                if (!result.success) {
                    return errorResponse(`Integration sync failed: ${result.message}`);
                }
            }
            const reservation =
                await this.reservationRepository.createReservation({
                    bookingCode: bookingCode,
                    reservationStartDate: reservationStart,
                    reservationEndDate: reservationEnd,
                    bookedAt: new Date(),
                    propertyId: propertyDetails.id,
                    propertyCode: propertyDetails.propertyCode,
                    hotelName: propertyDetails.propertyName,
                    roomTypeCode,
                    ratePlanCode,
                    roomName,
                    ratePlanName: rateplan.ratePlanName,
                    primaryGuestId,
                    guests: guestDetails,
                    bookingUserEmail,
                    bookingUserPhone,
                    amount: finalPrice.totalAmount,
                    currencyCode,
                    paidAmount,
                    extraAmountToPay: finalPrice.latterpayableAmount || 0,
                    refundAmount: 0,
                    timezone: propertyDetails.timezone || 'Asia/Kolkata',
                    countryCode: countryCode || 'IN',
                    bookingStatus: initialBookingStatus,
                    deviceTypes: deviceType,
                    bookingSource: bookingSource,
                    isPromoUsed: !!(
                        payload.promoCode ||
                        (payload.selectedPromotions &&
                            payload.selectedPromotions.length > 0)
                    ),
                    promoId: promoCodeId || null,
                    agencyId: agencyId || null,
                    platforms: platforms || 'web',
                    paymentMethod: paymentMethods,
                    customerId: payload.customerId,
                });
            if (promoCode && promoCodeDetails) {
                this.reservationRepository.createReservationPromoCode({
                    reservationId: reservation.id,
                    promoCodeId: promoCodeDetails.id,
                    amount: finalPrice.promoCodeDiscount || 0,
                    currency: currencyCode,
                });
                if (promoCodeDetails.usageLimit !== null) {
                    this.promoCodeRepository.decreasePromoCodeUsageCount(
                        promoCodeDetails.id
                    );
                }
            }
            const ngeniusOrderRef = payload?.ngeniusOrderRef;
            if (ngeniusOrderRef) {
                const count =
                    await this.reservationRepository.linkPaymentToReservation(
                        ngeniusOrderRef,
                        reservation.id
                    );
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
                totalSpa: 0,
            };
            await Promise.all([

                await this.priceBrakeDownRepo.createFullPricingBreakdown(
                    reservation.id,
                    priceBreakdownPayload,
                    finalPrice.dailyPriceBrakeDown || [],
                    finalPrice.taxBrakeDown || [],
                    finalPrice.addonBrakeDowns || [],
                    finalPrice.promotionBrakeDown || []
                ),
                await this.reservationRepository.createReservationGuests(
                    reservation.id,
                    guestDetails
                )
            ])
            if (agencyId && finalPrice.agencyCommission) {
                const {
                    commissionType,
                    commissionValue,
                    commissionAmount,
                    commissionCurrency,
                } = finalPrice.agencyCommission;

                await this.agencyCommissionRepository.createAgencyCommission({
                    reservationId: reservation.id,
                    agencyId,
                    agentId: payload.agentId || null,
                    commissionType: commissionType as AgentCommissionType,
                    commissionValue,
                    commissionAmount,
                    currencyCode: (commissionCurrency ||
                        currencyCode) as CurrencyCode,
                });
            }
            if (
                finalPrice.addonBrakeDowns &&
                finalPrice.addonBrakeDowns.length > 0
            ) {
                const addonPayloads: IBookingAddonCreate[] =
                    finalPrice.addonBrakeDowns
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
                roomTypeCode,
                dates: reservationDates,
                numberOfRooms: finalPrice.requestedRooms,
            };
            await Promise.all([
                this.decreaseAri(propertyConfig, ariPayload),
                this.loyalityGuestRepo.handlePostBookingLoyalty(
                    bookingUserEmail,
                    propertyDetails.creationId,
                    propertyDetails.id,
                    payload.isLoyalityGuest
                ),
                this.reservationRepository
                    .getReservaltionByCode(bookingCode, propertyCode)
                    .then(fullReservation => {
                        if (fullReservation) {
                            this.reservationEmailService
                                .reservationConfirmation(fullReservation as any)
                                .catch(err =>
                                    console.error('Confirmation email error:', err)
                                );
                        }
                    })
                    .catch(err => console.error('Failed to fetch reservation for email:', err))
            ]);

            return successResponse('Reservation created successfully', {
                bookingCode,
                bookingStatus: reservation.bookingStatus,
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error occurred while creating reservation',
                    error.message
                );
            }
            return errorResponse(
                'Error occurred while creating reservation',
                'Unknown error'
            );
        }
    }
    private async decreaseAri(
        propertyConfig: IPropertyConfig,
        ari: IAriManulupulation
    ): Promise<void> {
        try {
            if (!propertyConfig.selfAriActive) {
                return;
            }
            await this.ariManupulationRepo.decreaseAvailableRooms(ari);
        } catch (error) { }
    }
    private async increaseAri(
        propertyConfig: IPropertyConfig,
        ari: IAriManulupulation
    ): Promise<void> {
        try {
            if (!propertyConfig.selfAriActive) {
                return;
            }
            await this.ariManupulationRepo.increaseAvailableRooms(ari);
        } catch (error) { }
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
    public async updateReservation(
        reservationCode: string,
        updatePayload: IUReservation
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

            const oldDates = this.generateDateRange(oldStartDate, oldEndDate);

            const newDates = this.generateDateRange(startDate, endDate);

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

            const updatePropConfig =
                await this.ariManupulationRepo.getPropertyConfig(
                    existingReservation.propertyId
                );
            if (!updatePropConfig) {
                return errorResponse('Property config not found');
            }

            const selfAriActiveU = updatePropConfig?.selfAriActive ?? true;
            const activeIntegrationTypeU: 'channel_manager' | 'pms' | null =
                updatePropConfig?.channelManagerIntegrationActive
                    ? 'channel_manager'
                    : updatePropConfig?.pmsIntegrationActive
                        ? 'pms'
                        : null;

            const activeIntegrationU = activeIntegrationTypeU
                ? await this.ariManupulationRepo.getActiveIntegration(
                    existingReservation.propertyId,
                    {
                        selfAriActive: selfAriActiveU,
                        pmsIntegrationActive: updatePropConfig?.pmsIntegrationActive ?? false,
                        channelManagerIntegrationActive: updatePropConfig?.channelManagerIntegrationActive ?? false,
                    }
                )
                : null;
            if (activeIntegrationTypeU) {
                const result = await IntegrationDispatcher.pushModify(
                    existingReservation as any,
                    {
                        checkInDate: startDate,
                        checkOutDate: endDate,
                        amount: newAmount,
                        finalPrice: updatePayload.finalPrice,
                        rooms: updatePayload.rooms,
                        requestedRooms: updatePayload.requestedRooms
                    },
                    existingReservation.propertyId,
                    { name: activeIntegrationU?.name ?? 'Rate Tiger', type: activeIntegrationTypeU, integrationId: '' }
                );
                if (!result.success) {
                    return errorResponse(`Integration sync failed: ${result.message}`);
                }
            }
            if (selfAriActiveU && !activeIntegrationTypeU) {
                // await prisma.$transaction(async (tx: any) => {
                if (datesToFree.length > 0) {
                    const freeAriPayload: IAriManulupulation = {
                        propertyCode: updatePayload.propertyCode,
                        dates: datesToFree,
                        numberOfRooms: oldRooms,
                        roomTypeCode: updatePayload.roomTypeCode,
                    };

                    await this.increaseAri(updatePropConfig, freeAriPayload);
                }

                if (commonDates.length > 0 && oldRooms !== newRooms) {
                    const roomDifference = newRooms - oldRooms;
                    if (roomDifference !== 0) {
                        const adjustment =
                            roomDifference > 0
                                ? await this.decreaseAri(updatePropConfig, {
                                    dates: commonDates,
                                    numberOfRooms: Math.abs(roomDifference),
                                    roomTypeCode: updatePayload.roomTypeCode,
                                    propertyCode:
                                        existingReservation.propertyCode,
                                })
                                : await this.increaseAri(updatePropConfig, {
                                    dates: commonDates,
                                    numberOfRooms: Math.abs(roomDifference),
                                    roomTypeCode: updatePayload.roomTypeCode,
                                    propertyCode:
                                        existingReservation.propertyCode,
                                });
                    }
                }
                if (datesToReserve.length > 0) {
                    const reserveAriPayload: IAriManulupulation = {
                        propertyCode: updatePayload.propertyCode,
                        dates: datesToReserve,
                        numberOfRooms: newRooms,
                        roomTypeCode: updatePayload.roomTypeCode,
                    };

                    await this.decreaseAri(updatePropConfig, reserveAriPayload);
                }
            }
            const updateData: Partial<ICReservationR> = {
                reservationStartDate: startDate,
                reservationEndDate: endDate,
                amount: newAmount,
                guests: updatePayload.guests,
                bookingUserEmail: updatePayload.bookingUserEmail,
                bookingUserPhone: updatePayload.bookingUserPhone || null,
                bookingStatus: 'modified' as BookingStatus,
                currencyCode: updatePayload.currencyCode,
                extraAmountToPay:
                    existingReservation.extraAmountToPay + extraAmountToPay,
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
                updatePayload.finalPrice.addonBrakeDowns || [];
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
            const updateBreakdownHeader: ICPricingBreakDown = {
                reservationId: existingReservation.id,
                totalAmount: updatePayload.finalPrice.totalAmount || 0,
                amountBeforeTax: updatePayload.finalPrice.amountBeforeTax || 0,
                taxedAmount: updatePayload.finalPrice.taxedAmount || 0,
                totalAddonAmount:
                    updatePayload.finalPrice.totalAddonAmount || 0,
                totalPromotionAmount:
                    updatePayload.finalPrice.totalPromotionAmount || 0,
                currentChargeableAmount:
                    updatePayload.finalPrice.currentChargeableAmount ||
                    updatePayload.finalPrice.totalAmount ||
                    0,
                latterpayableAmount:
                    updatePayload.finalPrice.latterpayableAmount || 0,
                promoCodeDiscount:
                    updatePayload.finalPrice.promoCodeDiscount || 0,
                currencyCode: updatePayload.currencyCode,
                loyalityDiscount:
                    updatePayload.finalPrice.loyalityDiscount || 0,
                totalSpa: existingReservation.PricingBrakeDown?.totalSpa || 0,
            };

            await this.priceBrakeDownRepo.replacePricingBreakdown(
                existingReservation.id,
                existingReservation.PricingBrakeDown?.id || null,
                updateBreakdownHeader,
                updatePayload.finalPrice.dailyPriceBrakeDown || [],
                updatePayload.finalPrice.taxBrakeDown || [],
                updatePayload.finalPrice.addonBrakeDowns || [],
                updatePayload.finalPrice.promotionBrakeDown || []
            );

            if (
                updatePayload.agencyId &&
                updatePayload.finalPrice.agencyCommission
            ) {
                const {
                    commissionType,
                    commissionValue,
                    commissionAmount,
                    commissionCurrency,
                } = updatePayload.finalPrice.agencyCommission;

                await this.agencyPricingRepo.updateAgencyCommission(
                    existingReservation.id,
                    updatePayload.agencyId,
                    updatePayload.agentId,
                    {
                        commissionAmount,
                        commissionCurrency,
                        commissionType,
                        commissionValue,
                    }
                );
            }
            await this.reservationEmailService
                .reservationUpdatedEmail(existingReservation, updatePayload)
            return successResponse('Reservation updated successfully');
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
    public async makeCheckOut(bookingCode: string): Promise<IApiResponse> {
        try {
            const reservation =
                await this.reservationRepository.getReservationByBookingCode(
                    bookingCode
                );

            if (!reservation) {
                return errorResponse('Reservation not found');
            }

            const updatedReservation =
                await this.reservationRepository.makeCheckOut(
                    reservation.id,
                    nowUTC()
                );

            return successResponse(
                'Reservation checked out successfully',
                updatedReservation
            );
        } catch (error) {
            if (error instanceof Error) {
                return Promise.reject(
                    new Error(
                        `Failed to check out reservation: ${error.message}`
                    )
                );
            }
            return Promise.reject(new Error('Failed to check out reservation'));
        }
    }
    public async makeCheckIn(
        bookingCode: string,
        guestDetails: IGuestCheckInDetails
    ): Promise<IApiResponse> {
        try {
            const reservation =
                await this.reservationRepository.getReservationByBookingCode(
                    bookingCode
                );
            if (!reservation) {
                return errorResponse('Reservation not found');
            }
            const [updatedReservation, guestDetailsUpdateRes] =
                await Promise.all([
                    this.reservationRepository.makeCheckIn(
                        reservation.id,
                        nowUTC()
                    ),
                    this.guestRepository.addGuestDetails(
                        reservation.primaryGuestId,
                        guestDetails
                    ),
                ]);
            return successResponse(
                'Reservation checked in successfully',
                updatedReservation
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to check in reservation',
                    error.message
                );
            }
            return errorResponse('Failed to check in reservation');
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

            const uniqueRoomNumbersSize =
                new Set(
                    reservation.PricingBrakeDown?.DailyPriceBrakeDown?.map(
                        (item: any) => item.roomNumber
                    ).filter(Boolean) || []
                ).size || 1;

            if (reservation.propertyCode && reservation.roomTypeCode) {
                await this.ariManupulationRepo.increaseAvailableRooms({
                    propertyCode: reservation.propertyCode,
                    dates: additionalDates,
                    roomTypeCode: reservation.roomTypeCode,
                    numberOfRooms: uniqueRoomNumbersSize,
                });
            }
            const noShowReservation =
                await this.reservationRepository.NoShow(reservationId);

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
    public async getReservationsByGuestId(
        guestId: string
    ): Promise<IApiResponse> {
        try {
            const reservations =
                await this.reservationRepository.getReservationsByGuestId(
                    guestId
                );

            return successResponse(
                'Reservations fetched successfully',
                reservations
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
    public async deleteReservation(
        reservationId: string,
        cancellationReason: string
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
            let refundResult: {
                success: boolean;
                message: string;
                data?: any;
            } | null = null;

            try {
                const paymentRecord =
                    await this.paymentRepository.findPayment(reservationId);

                if (!paymentRecord) {
                    console.warn(`No payment record found. Skipping refund.`);
                } else if (!paymentRecord.paymentIntentId) {
                    console.warn(`  paymentIntentId is null. Skipping refund.`);
                } else if (paymentRecord.paymentMethod !== 'payment_gateway') {
                    // console.log(
                    //     ` Payment method is '${paymentRecord.paymentMethod}'. Not a gateway payment — skipping refund.`
                    // );
                } else {
                    const orderReference = paymentRecord.paymentIntentId;

                    const { strategy, outletId, reason } =
                        await this.paymentRepository.resolveRefundStrategy(
                            orderReference
                        );

                    if (strategy === 'same_day') {
                        if (!outletId) {
                            return errorResponse(
                                'Refund failed: outletId could not be resolved for same-day refund. Reservation was not cancelled.'
                            );
                        }

                        refundResult =
                            await ngeniusService.processSameDayRefund(
                                orderReference,
                                outletId
                            );
                    } else {
                        refundResult = await ngeniusService.processRefund(
                            orderReference,
                            outletId
                        );
                    }
                    if (!refundResult.success) {
                        return errorResponse(
                            `Refund failed: ${refundResult.message}. Reservation was not cancelled.`
                        );
                    }
                }
            } catch (refundError) {
                console.error(
                    `[CANCEL RESERVATION] ❌ Unexpected error during refund:`,
                    refundError
                );
                return errorResponse(
                    'Refund processing encountered an unexpected error. Reservation was not cancelled.'
                );
            }
            const delPropConfig =
                await this.ariManupulationRepo.getPropertyConfig(
                    reservation.propertyId
                );
            if (!delPropConfig) {
                return errorResponse('Property config not found');
            }
            const selfAriActiveD = delPropConfig?.selfAriActive ?? true;
            const activeIntegrationTypeD: 'channel_manager' | 'pms' | null =
                delPropConfig?.channelManagerIntegrationActive
                    ? 'channel_manager'
                    : delPropConfig?.pmsIntegrationActive
                        ? 'pms'
                        : null;

            const activeIntegrationD = activeIntegrationTypeD
                ? await this.ariManupulationRepo.getActiveIntegration(
                    reservation.propertyId,
                    {
                        selfAriActive: selfAriActiveD,
                        pmsIntegrationActive: delPropConfig?.pmsIntegrationActive ?? false,
                        channelManagerIntegrationActive: delPropConfig?.channelManagerIntegrationActive ?? false,
                    }
                )
                : null;
             if (activeIntegrationTypeD) {
                const result = await IntegrationDispatcher.pushCancel(
                    reservation as any,
                    reservation.propertyId,
                    { name: activeIntegrationD?.name ?? 'Rate Tiger', type: activeIntegrationTypeD, integrationId: '' }
                );
                if (!result.success) {
                    return errorResponse(`Integration sync failed: ${result.message}`);
                }
            }

            let actualRefundAmount = 0;
            if (reservation.paymentMethod !== 'pay_at_hotel') {
                actualRefundAmount =
                    refundResult?.data?.refundAmount ??
                    refundResult?.data?.amount ??
                    0;
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

            const uniqueRoomNumbersSize =
                new Set(
                    reservation.PricingBrakeDown?.DailyPriceBrakeDown?.map(
                        (item: any) => item.roomNumber
                    ).filter(Boolean) || []
                ).size || 1;
            // Build non-blocking tasks array
            await Promise.all([
                this.loyalityGuestRepo.handlePostCancelLoyalty(
                    reservation.bookingUserEmail,
                    reservation.propertyId
                ),
                this.increaseAri(delPropConfig, {
                    dates: reservationDates,
                    propertyCode: reservation.propertyCode,
                    roomTypeCode: reservation.roomTypeCode,
                    numberOfRooms: uniqueRoomNumbersSize,
                }),

            ]);

            await this.reservationEmailService
                .reservationCancelEmail(reservation)
            // Send cancellation email (non-blocking)
            this.reservationEmailService
                .reservationCancelEmail(reservation)
                .catch(err => console.error('Cancellation email error:', err));

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
}
