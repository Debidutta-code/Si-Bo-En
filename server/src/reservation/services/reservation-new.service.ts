import { AgentCommissionType } from "../../agency/types";
import { RTIntegrationDao } from "../../integrations/rate-tiger/dao/rt-integration.dao";
import { RTReservationPushService } from "../../integrations/rate-tiger/services/rt-reservation-push.service";
import { LoyaltyGuestRepository } from "../../loyalty/repository";
import { PromoCodeRepository } from "../../promocode/repository";
import { CurrencyCode } from "../../tax-system/interfaces";
import { IApiResponse, successResponse, errorResponse, paginatedSuccessResponse, toUTCDate } from "../../utils";
import { AgencyCommissionRepository, AriManupulationRepo, BookingAddonRepository, GuestRepository, PriceBrakeDownRepo, ReservationRepository } from "../repository";
import { DeviceType, IAddonBreakdown, IAriManulupulation, IBookingAddonCreate, ICGuest, ICPricingBreakDown, ICReservationS, IPropertyDetailsFromMiddleware } from "../types";
export class NewReservationService {
    private reservationRepository: ReservationRepository;
    private promoCodeRepository: PromoCodeRepository;
    private guestRepository: GuestRepository;
    private loyalityGuestRepo: LoyaltyGuestRepository;
    private ariManupulationRepo: AriManupulationRepo;
    private agencyCommissionRepository: AgencyCommissionRepository;
    private priceBrakeDownRepo: PriceBrakeDownRepo;
    private bookingAddonRepository: BookingAddonRepository;

    constructor() {
        this.reservationRepository = new ReservationRepository();
        this.promoCodeRepository = new PromoCodeRepository();
        this.guestRepository = new GuestRepository();
        this.loyalityGuestRepo = new LoyaltyGuestRepository();
        this.ariManupulationRepo = new AriManupulationRepo();
        this.agencyCommissionRepository = new AgencyCommissionRepository();
        this.priceBrakeDownRepo=new PriceBrakeDownRepo();
        this.bookingAddonRepository = new BookingAddonRepository();
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
        const methodMap: Record<
            string,
            'pay_at_hotel' | 'payment_gateway'
        > = {
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

            const [bookingCode, loyalityGuestRepo, rateplan, propertyConfig] = await Promise.all([
                await this.generateBookingCode(propertyCode),
                await this.loyalityGuestRepo.addGuestTOLoyalty(bookingUserEmail, primaryGuestId),
                await this.ariManupulationRepo.getRatePlanName(
                    ratePlanCode,
                    propertyDetails.id
                ),
                await this.ariManupulationRepo.getPropertyConfig(
                    propertyDetails.id
                ),

            ])
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
            const reservation = await this.reservationRepository.createReservation({
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

            })
            if (promoCode && promoCodeDetails) {
                this.reservationRepository.createReservationPromoCode({
                    reservationId: reservation.id,
                    promoCodeId: promoCodeDetails.id,
                    amount: finalPrice.promoCodeDiscount || 0,
                    currency: currencyCode,
                })
                if (promoCodeDetails.usageLimit !== null) {
                    this.promoCodeRepository.decreasePromoCodeUsageCount(
                        promoCodeDetails.id
                    )

                }
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
                totalSpa:0
            };

            await this.priceBrakeDownRepo.createFullPricingBreakdown(
                reservation.id,
                priceBreakdownPayload,
                finalPrice.dailyPriceBrakeDown || [],
                finalPrice.taxBrakeDown || [],
                finalPrice.addonBrakeDown || [],
                finalPrice.promotionBrakeDown || []
            );
            if (agencyId && finalPrice.agencyCommission) {
                const { commissionType, commissionValue, commissionAmount, commissionCurrency } =
                    finalPrice.agencyCommission;

                await this.agencyCommissionRepository.createAgencyCommission({
                    reservationId: reservation.id,
                    agencyId,
                    agentId: payload.agentId || null,
                    commissionType: commissionType as AgentCommissionType,
                    commissionValue,
                    commissionAmount,
                    currencyCode: (commissionCurrency || currencyCode) as CurrencyCode,
                });
            }
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
            return successResponse("Reservation created successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occurred while creating reservation", error.message);
            }
            return errorResponse("Error occurred while creating reservation", "Unknown error");
        }
    }
}