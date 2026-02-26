import { Decimal } from '@prisma/client/runtime/library';
import { calculateNights, toUTCDate } from '../../utils';
import { RoomBookingRepository } from '../repository';
import {
    IAppliedDiscount,
    IBookingSearchPayload,
    IPromotion,
    IRoom,
    IRoomPrice,
    ITouristTax,
} from '../types';

export class RoomBookingService {
    public static async fetchRooms(payload: IBookingSearchPayload) {
        const { PropertyCode, startDate, endDate, guests, deviceType, countryCode } = payload;

        const property = await RoomBookingRepository.getPropertyByCode(PropertyCode);
        if (!property || !property.isAvailable) {
            return { success: false, message: 'Property not available' };
        }
        let promoCodeData = null;
        if (payload.promocode) {
            promoCodeData = await RoomBookingRepository.getPromoCodeByPropertyAndCode(
                property.id,
                payload.promocode
            );
        }
        // Build date array (check-in inclusive, check-out exclusive)
        const dates: Date[] = [];
        let current = toUTCDate(startDate);
        const last = toUTCDate(endDate);
        while (current < last) {
            dates.push(current);
            current = toUTCDate(new Date(new Date(current).setDate(current.getDate() + 1)));
        }

        const totalGuests = guests.adults + guests.children;
        const numberOfNights = calculateNights(startDate, endDate);

        // Process all rooms in parallel
        const roomResults = await Promise.all(
            property.propertyRooms.map(room =>
                this.processRoom(
                    room,
                    property,
                    dates,
                    totalGuests,
                    numberOfNights,
                    guests,
                    payload,
                    countryCode,
                    deviceType,
                    promoCodeData
                )
            )
        );

        const rooms: IRoom[] = roomResults.filter((r): r is IRoom => r !== null);

        return {
            success: true,
            message: 'Rooms fetched successfully',
            data: {
                propertyDetails: {
                    id: property.id,
                    propertyName: property.propertyName,
                    propertyVideos: property.propertyConfigs?.showVideo
                        ? property.propertyVideos
                        : null,
                    loyaltyProgramConfig: property.loyaltyProgramConfig,
                    propertyCode: property.propertyCode,
                    starRating: property.starRating,
                    bookingEngineConfig: property.bookingEngineConfig,
                    address: property.propertyAddress,
                },
                rooms,
                searchCriteria: payload,
            },
        };
    }
    private static async processRoom(
        room: any,
        property: any,
        dates: Date[],
        totalGuests: number,
        numberOfNights: number,
        guests: IBookingSearchPayload['guests'],
        payload: IBookingSearchPayload,
        countryCode?: string,
        deviceType?: string,
        promoCodeData?: any
    ): Promise<IRoom | null> {
        // Check inventory first
        const inventory = await RoomBookingRepository.getInventoryByProperty(
            property.propertyCode,
            room.roomType,
            dates
        );
        if (inventory.length !== dates.length) return null;

        // Process all rate plans in parallel
        const ratePlanResults = await Promise.all(
            property.ratePlans.map((ratePlan: any) =>
                this.processRatePlan(
                    ratePlan,
                    room,
                    property,
                    dates,
                    totalGuests,
                    numberOfNights,
                    guests,
                    payload,
                    countryCode,
                    deviceType,
                    promoCodeData
                )
            )
        );

        const room_price: IRoomPrice[] = ratePlanResults.filter(
            (r): r is IRoomPrice => r !== null
        );

        return {
            id: room.id,
            room_name: room.roomName,
            room_type: room.roomType,
            room_size: Number(room.roomSize),
            room_unit: room.roomUnit,
            room_view: room.roomView,
            max_occupancy: room.maxOccupancy,
            description: room.description || '',
            images: room.image || [],
            amenities: room.roomAmenities.map((r: any) => r.amenity),
            has_valid_rate: room_price.length > 0,
            room_price,
            roomVideos: room.roomVideos || null,
        };
    }

    private static async processRatePlan(
        ratePlan: any,
        room: any,
        property: any,
        dates: Date[],
        totalGuests: number,
        numberOfNights: number,
        guests: IBookingSearchPayload['guests'],
        payload: IBookingSearchPayload,
        countryCode?: string,
        deviceType?: string,
        promoCodeData?: any
    ): Promise<IRoomPrice | null> {
        const today = new Date();
        const checkInDate = dates[0];

        // Fetch everything in parallel
        const [
            charges,
            ratePlanAddons,
            geoRatePlan,
            promotions,
            ratePlanRule,
            devicePromotion,
            touristTaxData,
        ] = await Promise.all([
            RoomBookingRepository.getCharges(
                property.propertyCode,
                room.roomType,
                ratePlan.ratePlanCode,
                dates
            ),
            RoomBookingRepository.getRatePlanAddons(ratePlan.id),
            RoomBookingRepository.getGeoRatePlan(
                property.id,
                room.id,
                ratePlan.id,
                countryCode || 'US'
            ),
            RoomBookingRepository.getPromotions(
                property.id,
                room.id,
                ratePlan.id,
                checkInDate,
                today,
                numberOfNights
            ),
            RoomBookingRepository.getRatePlanRule(ratePlan.id),
            deviceType
                ? RoomBookingRepository.getDeviceSpecificPromotion(
                    property.id,
                    room.id,
                    ratePlan.id,
                    checkInDate,
                    deviceType
                )
                : Promise.resolve(null),
            RoomBookingRepository.getTouristTax(ratePlan.id),
        ]);

        // Must have charges for all dates
        if (!charges.length) return null;

        // ── Geo: restricted = skip this rate plan entirely ──────────────────────
        if (geoRatePlan?.restrictionType === 'restricted') return null;

        // ── Addons: fetch availability in parallel, skip rate plan if any missing ─
        const addonPrices: Record<string, number> = {};

        if (ratePlanAddons.length > 0) {
            const addonAvailabilityResults = await Promise.all(
                ratePlanAddons.map(rpa =>
                    RoomBookingRepository.getAddonAvailability(rpa.addonId, dates)
                )
            );

            for (let i = 0; i < ratePlanAddons.length; i++) {
                const availability = addonAvailabilityResults[i];
                if (availability.length !== dates.length) return null; // addon not available = skip rate plan

                const addon = ratePlanAddons[i].addon;
                addonPrices[addon.id] = this.calculateAddonPrice(
                    addon,
                    availability,
                    numberOfNights,
                    totalGuests,
                    guests.rooms
                );
            }
        }

        // ── Base amount from first charge, matching guest tier ───────────────────
        const charge = charges[0];
        const sortedBase = [...charge.baseGuestAmounts].sort(
            (a, b) => a.numberOfGuests - b.numberOfGuests
        );
        const selectedTier =
            sortedBase.find(b => b.numberOfGuests >= totalGuests) ||
            sortedBase[sortedBase.length - 1];

        const baseAmount = Number(selectedTier.amountBeforeTax);

        // ── Calculate all discounts independently from baseAmount ────────────────
        let totalAutoDiscount = 0;
        const availablePromotions: IPromotion[] = [];
        const appliedDiscounts: IAppliedDiscount[] = [];


        // 1. Device promotion
        if (devicePromotion) {
            const discount = this.calculateDiscount(
                baseAmount,
                devicePromotion.discountType,
                Number(devicePromotion.discountValue)
            );
            if (devicePromotion.isAutoApplied) {
                totalAutoDiscount += discount;
                appliedDiscounts.push({
                    id: devicePromotion.id,
                    promotionName: devicePromotion.promotionName,
                    promotionType: devicePromotion.promotionType,
                    discountType: devicePromotion.discountType,
                    discountValue: Number(devicePromotion.discountValue),
                    calculatedDiscountAmount: discount,
                });
            } else {
                availablePromotions.push({
                    id: devicePromotion.id,
                    promotionName: devicePromotion.promotionName,
                    promotionType: devicePromotion.promotionType,
                    discountType: devicePromotion.discountType,
                    discountValue: devicePromotion.discountValue,
                    validFrom: devicePromotion.validFrom,
                    validTo: devicePromotion.validTo,
                    advanceBookingDays: devicePromotion.advanceBookingDays ?? 0,
                    monApplicable: devicePromotion.monApplicable,
                    tueApplicable: devicePromotion.tueApplicable,
                    wedApplicable: devicePromotion.wedApplicable,
                    thuApplicable: devicePromotion.thuApplicable,
                    friApplicable: devicePromotion.friApplicable,
                    satApplicable: devicePromotion.satApplicable,
                    sunApplicable: devicePromotion.sunApplicable,

                });
            }
        }

        if (geoRatePlan) {
            const restrictionValue = geoRatePlan.restrictionValue
                ? Number(geoRatePlan.restrictionValue)
                : 0;
            const geoDiscount = this.calculateGeoDiscount(
                baseAmount,
                geoRatePlan.restrictionType,
                geoRatePlan.restrictionTypeAction,
                restrictionValue
            );
            if (geoRatePlan) {
                totalAutoDiscount += geoDiscount;
                appliedDiscounts.push({
                    id: geoRatePlan.id,
                    promotionName: 'Geo rate adjustment',
                    promotionType: 'geo',
                    discountType: geoRatePlan.restrictionType === 'percentage' ? 'percentage' : 'flat',
                    discountValue: Number(geoRatePlan.restrictionValue ?? 0),
                    calculatedDiscountAmount: geoDiscount,
                });
            } else {
                availablePromotions.push({
                    id: geoRatePlan.id,
                    promotionName: `Geo rate adjustment`,
                    promotionType: 'geo',
                    discountType: geoRatePlan.restrictionType === 'percentage' ? 'percentage' : 'flat',
                    discountValue: new Decimal(geoDiscount),
                    validFrom: null,
                    validTo: null,
                    advanceBookingDays: null
                });
            }
        }

        for (const promo of promotions) {
            const discount = this.calculateDiscount(
                baseAmount,
                promo.discountType,
                Number(promo.discountValue)
            );
            if (promo.isAutoApplied) {
                totalAutoDiscount += discount;
                appliedDiscounts.push({
                    id: promo.id,
                    promotionName: promo.promotionName,
                    promotionType: promo.promotionType,
                    discountType: promo.discountType,
                    discountValue: Number(promo.discountValue),
                    calculatedDiscountAmount: discount,
                });
            } else {
                availablePromotions.push({
                    id: promo.id,
                    promotionName: promo.promotionName,
                    promotionType: promo.promotionType,
                    discountType: promo.discountType,
                    discountValue: promo.discountValue,
                    validFrom: promo.validFrom,
                    validTo: promo.validTo,
                    advanceBookingDays: promo.advanceBookingDays ?? 0,
                    monApplicable: promo.monApplicable,
                    tueApplicable: promo.tueApplicable,
                    wedApplicable: promo.wedApplicable,
                    thuApplicable: promo.thuApplicable,
                    friApplicable: promo.friApplicable,
                    satApplicable: promo.satApplicable,
                    sunApplicable: promo.sunApplicable,
                });
            }
        }

        if (
            ratePlanRule &&
            ratePlanRule.isActive &&
            ratePlanRule.minLos &&
            numberOfNights >= ratePlanRule.minLos &&
            this.isDateRangeWithinPeriod(
                payload.startDate,
                payload.endDate,
                ratePlanRule.startDate,
                ratePlanRule.endDate
            ) &&
            ratePlanRule.discountType &&
            ratePlanRule.discountValue
        ) {
            const discount = this.calculateDiscount(
                baseAmount,
                ratePlanRule.discountType,
                Number(ratePlanRule.discountValue)
            );
            if (ratePlanRule.isAutoApplied) {
                totalAutoDiscount += discount;
                appliedDiscounts.push({
                    id: ratePlanRule.id,
                    promotionName: `Minimum ${ratePlanRule.minLos} nights stay`,
                    promotionType: 'mlos',
                    discountType: ratePlanRule.discountType,
                    discountValue: Number(ratePlanRule.discountValue),
                    calculatedDiscountAmount: discount,
                });
            } else {
                availablePromotions.push({
                    id: ratePlanRule.id,
                    promotionName: `Minimum ${ratePlanRule.minLos} nights stay`,
                    promotionType: '',
                    discountType: ratePlanRule.discountType,
                    discountValue: ratePlanRule.discountValue,
                    minLos: ratePlanRule.minLos,
                    maxLos: ratePlanRule.maxLos || undefined,
                    validFrom: ratePlanRule.startDate,
                    validTo: ratePlanRule.endDate,
                    advanceBookingDays: null
                });
            }
        }
        const totalAddonPrice = Object.values(addonPrices).reduce(
            (sum, price) => sum + price,
            0
        );
        // ── Promo code ───────────────────────────────────────────────────────────────
        if (promoCodeData) {
            const roomApplicable =
                promoCodeData.applicableRoomTypes.includes('all') ||
                promoCodeData.applicableRoomTypes.includes(room.roomType);

            const ratePlanApplicable =
                promoCodeData.applicableRatePlans.includes('all') ||
                promoCodeData.applicableRatePlans.includes(ratePlan.ratePlanCode);

            const deviceApplicable =
                !deviceType ||
                (deviceType === 'mobile' && promoCodeData.isApplicableForMobileApp) ||
                (deviceType === 'tablet' && promoCodeData.isApplicableForTablet) ||
                (deviceType === 'desktop' && promoCodeData.isApplicableForDesktop);

            const now = new Date();
            // ✅ fix
            const dateValid =
                (!promoCodeData.validFrom || new Date(promoCodeData.validFrom) <= now) &&
                (!promoCodeData.validTo || new Date(promoCodeData.validTo) >= now);

            const minAmountValid =
                !promoCodeData.minBookingAmount ||
                baseAmount >= Number(promoCodeData.minBookingAmount);

            if (roomApplicable && ratePlanApplicable && deviceApplicable && dateValid && minAmountValid) {
                let promoDiscount = this.calculateDiscount(
                    baseAmount,
                    promoCodeData.discountType,
                    Number(promoCodeData.discountValue)
                );

                if (promoCodeData.maxDiscountAmount && promoDiscount > Number(promoCodeData.maxDiscountAmount)) {
                    promoDiscount = Number(promoCodeData.maxDiscountAmount);
                }

                totalAutoDiscount += promoDiscount;
                appliedDiscounts.push({
                    id: promoCodeData.id,
                    promotionName: promoCodeData.name,
                    promotionType: 'promocode',
                    discountType: promoCodeData.discountType,
                    discountValue: Number(promoCodeData.discountValue),
                    calculatedDiscountAmount: promoDiscount,
                });
            }
        }
        const totalAmount = baseAmount - totalAutoDiscount + totalAddonPrice;

        let touristTax: ITouristTax | null = null;
        if (touristTaxData) {
            const calculatedTaxAmount =
                touristTaxData.discountType === 'percentage'
                    ? baseAmount * (Number(touristTaxData.discountValue) / 100)
                    : Number(touristTaxData.discountValue); // flat

            touristTax = {
                id: touristTaxData.id,
                name: touristTaxData.name || '',
                discountType: touristTaxData.discountType,
                discountValue: touristTaxData.discountValue,
                currencyCode: touristTaxData.currencyCode || 'USD',
                calculatedTaxAmount,
            };
        }

        return {
            ratePlanName: ratePlan.ratePlanName,
            ratePlanCode: ratePlan.ratePlanCode,
            totalAmount,
            currencyCode: charge.currencyCode,
            baseByGuestAmts: sortedBase.map(b => ({
                numberOfGuests: b.numberOfGuests,
                amountBeforeTax: Number(b.amountBeforeTax),
            })),
            policy: {
                depositPolicy: ratePlan.depositPolicy,
                cancellationPolicy: ratePlan.cancellationPolicy,
                guaranteePolicy: ratePlan.guaranteePolicy,
            },
            addons: ratePlanAddons.map(rpa => ({
                id: rpa.addon.id,
                name: rpa.addon.name,
                price: addonPrices[rpa.addon.id] ?? 0,
                postingRhythm: rpa.addon.postingRhythm,
            })),
            availablePromotions,
            appliedDiscounts,
            touristTax,
        };
    }

    private static calculateDiscount(
        baseAmount: number,
        discountType: string,
        discountValue: number
    ): number {
        if (discountType === 'percentage') {
            return baseAmount * (discountValue / 100);
        }
        return discountValue; // flat
    }

    private static calculateGeoDiscount(
        baseAmount: number,
        restrictionType: string,
        restrictionTypeAction: string,
        restrictionValue: number
    ): number {
        // 'restricted' is handled before this is called
        if (restrictionType === 'percentage') {
            const delta = baseAmount * (restrictionValue / 100);
            return restrictionTypeAction === 'increase' ? -delta : delta; // increase = add cost, decrease = discount
        }
        if (restrictionType === 'fixed') {
            return restrictionTypeAction === 'increase'
                ? -restrictionValue
                : restrictionValue;
        }
        return 0;
    }

    private static calculateAddonPrice(
        addon: any,
        availabilities: any[],
        numberOfNights: number,
        totalGuests: number,
        numberOfRooms: number
    ): number {
        const singleDatePrice = Number(availabilities[0].price);

        switch (addon.postingRhythm) {
            case 'per_stay':
                return singleDatePrice;
            case 'per_night':
                return singleDatePrice * numberOfNights;
            case 'per_person_per_night':
                return singleDatePrice * totalGuests * numberOfNights;
            case 'per_person_per_stay':
                return singleDatePrice * totalGuests;
            case 'per_room':
                return singleDatePrice * numberOfRooms;
            case 'per_room_per_night':
                return singleDatePrice * numberOfRooms * numberOfNights;
            case 'per_person_per_room':
                return singleDatePrice * totalGuests * numberOfRooms;
            default:
                return 0;
        }
    }

    private static isDateRangeWithinPeriod(
        startDate: string,
        endDate: string,
        periodStart: Date | null | undefined,
        periodEnd: Date | null | undefined
    ): boolean {
        if (!periodStart && !periodEnd) return true;
        const bookingStart = new Date(startDate);
        const bookingEnd = new Date(endDate);
        if (periodStart && bookingStart < periodStart) return false;
        if (periodEnd && bookingEnd > periodEnd) return false;
        return true;
    }
}