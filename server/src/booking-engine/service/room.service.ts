import { DateTime } from 'luxon';
import { calculateNights, toUTCDate } from '../../utils';
import { RoomBookingRepository } from '../repository';
import {
    IAddonDetail,
    IAppliedDiscount,
    IBookingSearchPayload,
    IPromotion,
    IRoom,
    IRoomPrice,
    ITouristTax,
} from '../types';

export class RoomBookingService {
    public static async fetchRooms(payload: IBookingSearchPayload) {
        const { propertyCode, startDate, endDate, guests, deviceType, countryCode } = payload;

        const property = await RoomBookingRepository.getPropertyByCode(propertyCode);
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

        const dates: Date[] = [];
        let current = toUTCDate(startDate);
        const last = toUTCDate(endDate);
        while (current < last) {
            dates.push(current);
            current = toUTCDate(new Date(new Date(current).setDate(current.getDate() + 1)));
        }

        const totalGuests = guests.adults + guests.children;
        const numberOfNights = calculateNights(startDate, endDate);

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
        const inventory = await RoomBookingRepository.getInventoryByProperty(
            property.propertyCode,
            room.roomType,
            dates
        );
        if (inventory.length !== dates.length) return null;

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

        const room_price: IRoomPrice[] = ratePlanResults
            .filter((r): r is IRoomPrice[] => r !== null)
            .flat();

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
    ): Promise<IRoomPrice[] | null> {
        const today = new Date();
        const checkInDate = dates[0];
        const checkOutDate = dates[dates.length - 1];

        const [
            charges,
            ratePlanAddons,
            geoRatePlan,
            promotions,
            ratePlanRule,
            devicePromotion,
            touristTaxData,
            bookingOffset,
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
            RoomBookingRepository.getBookingOffset(ratePlan.id, toUTCDate(checkInDate)),
        ]);

        if (charges.length !== dates.length) return null;

        for (const charge of charges) {
            if (charge.isSaleStopped) return null;

            const dow = new Date(charge.date).getDay();
            const dowFields: Record<number, keyof typeof charge> = {
                0: 'sunApplicable',
                1: 'monApplicable',
                2: 'tueApplicable',
                3: 'wedApplicable',
                4: 'thuApplicable',
                5: 'friApplicable',
                6: 'satApplicable',
            };
            if (!charge[dowFields[dow]]) return null;
        }

        const checkInCharge = charges[0];
        if (checkInCharge?.isClosedToArrival) return null;

        const checkOutCharge = charges[charges.length - 1];
        if (checkOutCharge?.isClosedToDeparture) return null;

        if (geoRatePlan?.restrictionType === 'restricted') return null;

        if (bookingOffset) {
            const hoursUntilCheckIn = DateTime.fromJSDate(toUTCDate(checkInDate))
                .diff(DateTime.fromJSDate(toUTCDate(today)), 'hours')
                .hours;

            if (
                bookingOffset.minimumAdvanceBookingOffset !== null &&
                bookingOffset.minimumAdvanceBookingOffset !== undefined &&
                hoursUntilCheckIn < bookingOffset.minimumAdvanceBookingOffset
            ) {
                return null;
            }

            if (
                bookingOffset.maximumAdvanceBookingOffset !== null &&
                bookingOffset.maximumAdvanceBookingOffset !== undefined &&
                hoursUntilCheckIn > bookingOffset.maximumAdvanceBookingOffset
            ) {
                return null;
            }
        }

        if (ratePlanRule && ratePlanRule.isActive) {
            const withinPeriod = this.isDateRangeWithinPeriod(
                payload.startDate,
                payload.endDate,
                ratePlanRule.startDate,
                ratePlanRule.endDate
            );

            if (withinPeriod) {

                if (ratePlanRule.minLos && numberOfNights < ratePlanRule.minLos) {
                    return null;
                }

                if (ratePlanRule.maxLos && numberOfNights > ratePlanRule.maxLos) {
                    return null;
                }
            }
        }

        const daysBetweenBookingAndCheckIn = Math.floor(
            DateTime.fromJSDate(toUTCDate(checkInDate))
                .diff(DateTime.fromJSDate(toUTCDate(today)), 'days')
                .days
        );

        const filteredPromotions = promotions.filter(promo => {
            if (
                promo.promotionType === 'early_bird' &&
                promo.advanceBookingDays &&
                daysBetweenBookingAndCheckIn < promo.advanceBookingDays
            ) {
                return false;
            }
            return true;
        });

        // ── Room physical-limit checks ──────────────────────────────
        if (guests.adults > room.maxNumberOfAdults) return null;
        if (guests.children > room.maxNumberOfChildren) return null;
        if (totalGuests > room.maxOccupancy) return null;

        // ── Guest-aware base-price validation & calculation ──────────
        const charge = charges[0];

        const adultBaseAmounts = charge.baseGuestAmounts
            .filter((b: any) => b.ageQualifyingCode === '10')
            .sort((a: any, b: any) => a.numberOfGuests - b.numberOfGuests);

        const childBaseAmounts = charge.baseGuestAmounts
            .filter((b: any) => b.ageQualifyingCode === '8')
            .sort((a: any, b: any) => a.numberOfGuests - b.numberOfGuests);

        const additionalAdultCharge = charge.additionalGuestAmounts
            .find((a: any) => a.ageQualifyingCode === '10');

        const additionalChildCharge = charge.additionalGuestAmounts
            .find((a: any) => a.ageQualifyingCode === '8');

        // Calculate adult price
        let adultBasePrice = 0;
        let additionalAdultCharges = 0;
        const exactAdultBase = adultBaseAmounts.find((b: any) => b.numberOfGuests === guests.adults);
        if (exactAdultBase) {
            adultBasePrice = Number(exactAdultBase.amountBeforeTax);
        } else if (adultBaseAmounts.length > 0) {
            const maxAdultBase = adultBaseAmounts[adultBaseAmounts.length - 1];
            adultBasePrice = Number(maxAdultBase.amountBeforeTax);
            const extraAdults = guests.adults - maxAdultBase.numberOfGuests;
            if (extraAdults > 0) {
                if (!additionalAdultCharge) return null; // can't cover extra adults
                additionalAdultCharges = extraAdults * Number(additionalAdultCharge.amount);
            }
        } else {
            // No adult base rows at all
            if (additionalAdultCharge) {
                additionalAdultCharges = guests.adults * Number(additionalAdultCharge.amount);
            } else {
                return null; // no way to price adults
            }
        }

        // Calculate child price
        let childBasePrice = 0;
        let additionalChildCharges = 0;
        if (guests.children > 0) {
            const exactChildBase = childBaseAmounts.find((b: any) => b.numberOfGuests === guests.children);
            if (exactChildBase) {
                childBasePrice = Number(exactChildBase.amountBeforeTax);
            } else if (childBaseAmounts.length > 0) {
                const maxChildBase = childBaseAmounts[childBaseAmounts.length - 1];
                childBasePrice = Number(maxChildBase.amountBeforeTax);
                const extraChildren = guests.children - maxChildBase.numberOfGuests;
                if (extraChildren > 0) {
                    if (!additionalChildCharge) return null; // can't cover extra children
                    additionalChildCharges = extraChildren * Number(additionalChildCharge.amount);
                }
            } else {
                // No child base rows
                if (additionalChildCharge) {
                    additionalChildCharges = guests.children * Number(additionalChildCharge.amount);
                } else {
                    return null; // no way to price children
                }
            }
        }

        const baseAmount = adultBasePrice + childBasePrice + additionalAdultCharges + additionalChildCharges;

        const sortedBase = [...charge.baseGuestAmounts].sort(
            (a: any, b: any) => a.numberOfGuests - b.numberOfGuests
        );

        let totalAutoDiscount = 0;
        const availablePromotions: IPromotion[] = [];
        const appliedDiscounts: IAppliedDiscount[] = [];
        if (devicePromotion && devicePromotion.isAutoApplied) {
            const discount = this.calculateDiscount(
                baseAmount,
                devicePromotion.discountType,
                Number(devicePromotion.discountValue)
            );
            totalAutoDiscount += discount;
            appliedDiscounts.push({
                id: devicePromotion.id,
                promotionName: devicePromotion.promotionName,
                promotionType: devicePromotion.promotionType,
                discountType: devicePromotion.discountType,
                discountValue: Number(devicePromotion.discountValue),
                calculatedDiscountAmount: discount,
            });
        }

        if (geoRatePlan) {
            const restrictionValue = Number(geoRatePlan.restrictionValue ?? 0);
            const geoDiscount = this.calculateGeoDiscount(
                baseAmount,
                geoRatePlan.restrictionType,
                geoRatePlan.restrictionTypeAction,
                restrictionValue
            );
            totalAutoDiscount += geoDiscount;
            appliedDiscounts.push({
                id: geoRatePlan.id,
                promotionName: 'Geo rate adjustment',
                promotionType: 'geo',
                discountType: geoRatePlan.restrictionType === 'percentage' ? 'percentage' : 'flat',
                discountValue: restrictionValue,
                calculatedDiscountAmount: geoDiscount,
            });
        }

        for (const promo of filteredPromotions) {
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
                availablePromotions.push(this.mapPromotion(promo));
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
                    promotionType: 'mlos',
                    discountType: ratePlanRule.discountType,
                    discountValue: ratePlanRule.discountValue,
                    minLos: ratePlanRule.minLos,
                    maxLos: ratePlanRule.maxLos || undefined,
                    validFrom: ratePlanRule.startDate,
                    validTo: ratePlanRule.endDate,
                    advanceBookingDays: null,
                });
            }
        }

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

                if (
                    promoCodeData.maxDiscountAmount &&
                    promoDiscount > Number(promoCodeData.maxDiscountAmount)
                ) {
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

        let touristTax: ITouristTax | null = null;
        if (touristTaxData) {
            const calculatedTaxAmount =
                touristTaxData.discountType === 'percentage'
                    ? baseAmount * (Number(touristTaxData.discountValue) / 100)
                    : Number(touristTaxData.discountValue);

            touristTax = {
                id: touristTaxData.id,
                name: touristTaxData.name || '',
                discountType: touristTaxData.discountType,
                discountValue: touristTaxData.discountValue,
                currencyCode: touristTaxData.currencyCode || 'USD',
                calculatedTaxAmount,
            };
        }

        const sharedFields = {
            ratePlanName: ratePlan.ratePlanName,
            ratePlanCode: ratePlan.ratePlanCode,
            currencyCode: charge.currencyCode,
            baseByGuestAmts: sortedBase.map((b: any) => ({
                numberOfGuests: b.numberOfGuests,
                amountBeforeTax: Number(b.amountBeforeTax),
                ageQualifyingCode: b.ageQualifyingCode || '10',
            })),
            policy: {
                depositPolicy: ratePlan.depositPolicy,
                cancellationPolicy: ratePlan.cancellationPolicy,
                guaranteePolicy: ratePlan.guaranteePolicy,
            },
            availablePromotions,
            appliedDiscounts,
            touristTax,
        };

        const availableAddonDetails: IAddonDetail[] = [];

        if (ratePlanAddons.length > 0) {
            const addonAvailabilityResults = await Promise.all(
                ratePlanAddons.map(rpa =>
                    RoomBookingRepository.getAddonAvailability(rpa.addonId, dates)
                )
            );
          
            for (let i = 0; i < ratePlanAddons.length; i++) {
                const availability = addonAvailabilityResults[i];
                if (availability.length !== dates.length) continue;

                const addon = ratePlanAddons[i].addon;
                const addonPrice = this.calculateAddonPrice(
                    addon,
                    availability,
                    numberOfNights,
                    totalGuests,
                    guests.rooms,
                    guests?.roomsArray||[]
                );

                availableAddonDetails.push({
                    id: addon.id,
                    name: addon.name,
                    code: addon.code,
                    price: addonPrice,
                    postingRhythm: addon.postingRhythm,
                    description: addon.description,
                    images: addon.images || [],
                    category: addon.category
                        ? { id: addon.category.id, name: addon.category.name, code: addon.category.code }
                        : null,
                    subCategory: addon.subCategory
                        ? { id: addon.subCategory.id, name: addon.subCategory.name, code: addon.subCategory.code }
                        : null,
                    addonVariant: addon.addonVariant
                        ? { id: addon.addonVariant.id, name: addon.addonVariant.name, code: addon.addonVariant.code }
                        : null,
                });
            }
        }

        const combos: IRoomPrice[] = [];
        if(ratePlan.roomOnlyVisible) {
            combos.push({
                ...sharedFields,
                comboLabel: `Room Only`,
                addons: [],
                totalAmount: baseAmount - totalAutoDiscount,
            });
        }

        for (const addon of availableAddonDetails) {
            combos.push({
                ...sharedFields,
                comboLabel: `${addon.name}`,
                addons: [addon],
                totalAmount: baseAmount - totalAutoDiscount + addon.price,
            });
        }

        return combos.sort((a, b) => a.totalAmount - b.totalAmount);
    }

    private static mapPromotion(promo: any): IPromotion {
        return {
            id: promo.id,
            promotionName: promo.promotionName,
            promotionType: promo.promotionType,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            validFrom: promo.validFrom ?? null,
            validTo: promo.validTo ?? null,
            advanceBookingDays: promo.advanceBookingDays ?? 0,
            monApplicable: promo.monApplicable,
            tueApplicable: promo.tueApplicable,
            wedApplicable: promo.wedApplicable,
            thuApplicable: promo.thuApplicable,
            friApplicable: promo.friApplicable,
            satApplicable: promo.satApplicable,
            sunApplicable: promo.sunApplicable,
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
        restrictionTypeAction: string | null,
        restrictionValue: number
    ): number {
        if (restrictionType === 'percentage') {
            const delta = baseAmount * (restrictionValue / 100);
            return restrictionTypeAction === 'increase' ? -delta : delta;
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
        numberOfRooms: number,
        roomsArray: { adults: number; children: number; childAges: number[] }[]
    ): number {
        const singleDatePrice = Number(availabilities[0].price);
        const childAddons = addon.ChildAddons || [];

        // Helper: get price for a single child based on age
        const getChildPrice = (age: number): number => {
            const match = childAddons.find(
                (c: any) => age >= c.minAge && age <= c.maxAge
            );
            if (!match) return singleDatePrice; // no rule = full price

            if (!match.discountApplicable) return 0; // free

            if (match.discountType === 'percentage') {
                return singleDatePrice * (1 - match.discountAmount / 100);
            }
            return Math.max(0, singleDatePrice - match.discountAmount); // flat
        };

        // Helper: total price for all guests in a room
        const getRoomGuestPrice = (room: { adults: number; childAges: number[] }): number => {
            const adultPrice = singleDatePrice * room.adults;
            const childPrice = room.childAges.reduce(
                (sum, age) => sum + getChildPrice(age), 0
            );
            return adultPrice + childPrice;
        };

        switch (addon.postingRhythm) {
            case 'per_stay':
                return singleDatePrice;

            case 'per_night':
                return singleDatePrice * numberOfNights;

            case 'per_room':
                return singleDatePrice * numberOfRooms;

            case 'per_room_per_night':
                return singleDatePrice * numberOfRooms * numberOfNights;

            case 'per_person_per_stay':
                return roomsArray.reduce(
                    (sum, room) => sum + getRoomGuestPrice(room), 0
                );

            case 'per_person_per_night':
                return roomsArray.reduce(
                    (sum, room) => sum + getRoomGuestPrice(room), 0
                ) * numberOfNights;

            case 'per_person_per_room':
                return roomsArray.reduce(
                    (sum, room) => sum + getRoomGuestPrice(room) * numberOfRooms, 0
                );

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