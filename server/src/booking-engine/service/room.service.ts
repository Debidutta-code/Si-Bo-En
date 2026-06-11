import { DateTime } from 'luxon';
import { calculateNights, toUTCDate } from '../../utils';
import { RoomBookingRepository } from '../repository';
import {
    IAddonDetail,
    IAppliedDiscount,
    IBookingSearchPayload,
    IPropertyData,
    IPropertyRatePlan,
    IPropertyRoom,
    IPromotion,
    IRoom,
    IRoomBookingOffset,
    IRoomCharge,
    IRoomChargeAdditionalGuest,
    IRoomChargeBaseByGuest,
    IRoomGeoRatePlan,
    IRoomPrice,
    IRoomPromoCode,
    IRoomPromotionData,
    IRoomRatePlanRule,
    IRoomTouristTaxData,
    ITouristTax,
    IRatePlanAddon,
    IAddonWithRelations,
    IAddonAvailability,
} from '../types';
import {
    CurrencyCode,
    DiscountType,
} from '../../tax-system/interfaces/tourist-tax.type';

export class RoomBookingService {
    public static async fetchRooms(payload: IBookingSearchPayload) {
        const {
            propertyCode,
            startDate,
            endDate,
            guests,
            deviceType,
            countryCode,
        } = payload;

        const property = await RoomBookingRepository.getPropertyByCode(
            propertyCode
        ) as IPropertyData | null;
        if (!property || !property.isAvailable) {
            return { success: false, message: 'Property not available' };
        }
        let promoCodeData: IRoomPromoCode | null = null;
        if (payload.promocode) {
            promoCodeData =
                (await RoomBookingRepository.getPromoCodeByPropertyAndCode(
                    property.id,
                    payload.promocode
                )) as IRoomPromoCode | null;

            if (!promoCodeData) {
                return { success: false, message: 'Invalid promo code' };
            }
            const now = new Date();
            if (!promoCodeData.isActive || promoCodeData.isDeleted) {
                return {
                    success: false,
                    message: 'Promo code is no longer active',
                };
            }
            if (
                promoCodeData.validFrom &&
                new Date(promoCodeData.validFrom) > now
            ) {
                return {
                    success: false,
                    message: 'Promo code is not yet valid',
                };
            }
            if (
                promoCodeData.validTo &&
                new Date(promoCodeData.validTo) < now
            ) {
                return { success: false, message: 'Promo code has expired' };
            }
            if (promoCodeData.usageLimit === 0) {
                return {
                    success: false,
                    message: 'Promo code usage limit reached',
                };
            }
        }

        const dates: Date[] = [];
        let current = toUTCDate(startDate);
        const last = toUTCDate(endDate);
        while (current < last) {
            dates.push(current);
            current = toUTCDate(
                new Date(new Date(current).setDate(current.getDate() + 1))
            );
        }

        const totalGuests = guests.adults + guests.children;
        const numberOfNights = calculateNights(startDate, endDate);
        const rooms: IRoom[] = [];

        if (property.propertyConfigs?.isB2cAvailable) {
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
            rooms.push(...roomResults.filter((r): r is IRoom => r !== null));
            rooms.sort((a, b) => {
                const aPriority = a.priority;
                const bPriority = b.priority;
                if (aPriority !== bPriority) return aPriority - bPriority;
                const aMin = Math.min(...a.roomPrice.map(rp => rp.totalAmount));
                const bMin = Math.min(...b.roomPrice.map(rp => rp.totalAmount));
                return aMin - bMin;
            });
        }
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
                    loyaltyProgramConfig: property.propertyConfigs?.isLoyaltyProgramEnabled?property.loyaltyProgramConfig:null,
                    propertyCode: property.propertyCode,
                    starRating: property.starRating,
                    bookingEngineConfig: property.bookingEngineConfig,
                    address: property.propertyAddress,
                    propertyConfigs: property.propertyConfigs
                },
                rooms,
                searchCriteria: payload,
            },
        };
    }

    private static async processRoom(
        room: IPropertyRoom,
        property: IPropertyData,
        dates: Date[],
        totalGuests: number,
        numberOfNights: number,
        guests: IBookingSearchPayload['guests'],
        payload: IBookingSearchPayload,
        countryCode?: string,
        deviceType?: string,
        promoCodeData?: IRoomPromoCode | null
    ): Promise<IRoom | null> {
        const inventory = await RoomBookingRepository.getInventoryByProperty(
            property.propertyCode,
            room.roomType,
            dates
        );
        if (inventory.length !== dates.length) return null;

        const ratePlanResults = await Promise.all(
            property.ratePlans.map((ratePlan: IPropertyRatePlan) =>
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
        const roomPrice: IRoomPrice[] = ratePlanResults
            .filter((r): r is IRoomPrice[] => r !== null)
            .flat();

        return {
            id: room.id,
            roomName: room.roomName,
            roomType: room.roomType,
            roomSize: Number(room.roomSize),
            roomUnit: room.roomUnit,
            priority: room.priority,
            roomView: room.RoomViews,
            numberOfBedrooms: room.numberOfBedrooms,
            maxOccupancy: room.maxOccupancy,
            description: room.description || '',
            images: room.image || [],
            amenities: room.roomAmenities.map(r => r.amenity),
            hasValidRate: roomPrice.length > 0,
            roomPrice: roomPrice,
            roomVideos: room.roomVideos || null,
        };
    }

    private static async processRatePlan(
        ratePlan: IPropertyRatePlan,
        room: IPropertyRoom,
        property: IPropertyData,
        dates: Date[],
        totalGuests: number,
        numberOfNights: number,
        guests: IBookingSearchPayload['guests'],
        payload: IBookingSearchPayload,
        countryCode?: string,
        deviceType?: string,
        promoCodeData?: IRoomPromoCode | null
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
            ) as Promise<IRoomCharge[]>,
            RoomBookingRepository.getRatePlanAddons(ratePlan.id),
            RoomBookingRepository.getGeoRatePlan(
                property.id,
                room.id,
                ratePlan.id,
                countryCode || 'US'
            ) as Promise<IRoomGeoRatePlan | null>,
            RoomBookingRepository.getPromotions(
                property.id,
                room.id,
                ratePlan.id,
                checkInDate,
                today,
                numberOfNights
            ) as Promise<IRoomPromotionData[]>,
            RoomBookingRepository.getRatePlanRule(
                ratePlan.id
            ) as Promise<IRoomRatePlanRule | null>,
            deviceType
                ? (RoomBookingRepository.getDeviceSpecificPromotion(
                    property.id,
                    room.id,
                    ratePlan.id,
                    checkInDate,
                    deviceType
                ) as Promise<IRoomPromotionData | null>)
                : Promise.resolve(null),
            RoomBookingRepository.getTouristTax(
                room.id
            ) as Promise<IRoomTouristTaxData | null>,
            RoomBookingRepository.getBookingOffset(
                ratePlan.id,
                toUTCDate(checkInDate)
            ) as Promise<IRoomBookingOffset | null>,
        ]);

        const chargeValidator = new ChargeValidator(charges, dates);
        if (!chargeValidator.validate()) return null;

        const restrictionChecker = new RestrictionChecker(
            geoRatePlan,
            bookingOffset,
            ratePlanRule,
            checkInDate,
            today,
            numberOfNights,
            payload
        );
        if (!restrictionChecker.validate()) return null;

        const filteredPromotions = PromotionFilter.filter(
            promotions,
            checkInDate,
            today
        );
        const roomsArray = guests.roomsArray || [];

        const anyRoomExceedsCapacity = roomsArray.some(
            r => r.adults + r.children > room.maxOccupancy
        );
        if (anyRoomExceedsCapacity) return null;

        let baseAmount = 0;
        let sortedBaseAmounts: IRoomChargeBaseByGuest[] = [];

        for (const roomConfig of roomsArray) {
            const perRoomGuests = {
                ...guests,
                adults: roomConfig.adults,
                children: roomConfig.children,
            };
            const calc = new RoomBasePriceCalculator(
                charges[0],
                perRoomGuests,
                room
            );
            const result = calc.calculate();
            if (result === null) return null;
            baseAmount += result.baseAmount * numberOfNights;
            sortedBaseAmounts = result.sortedBaseAmounts;
        }
        const discountCalc = new RoomDiscountCalculator(
            baseAmount,
            devicePromotion,
            geoRatePlan,
            filteredPromotions,
            ratePlanRule,
            promoCodeData ?? null,
            numberOfNights,
            payload,
            room.id,
            ratePlan.id,
            deviceType
        );
        const { totalAutoDiscount, appliedDiscounts, availablePromotions } =
            discountCalc.calculate();
        const numberOfRooms = roomsArray.length > 0 ? roomsArray.length : guests.rooms;

        const touristTax = RoomTouristTaxCalculator.calculate(
            touristTaxData,
            baseAmount,
            numberOfNights,
            numberOfRooms,
            room.numberOfBedrooms,
            charges[0].currencyCode
        );

        const sharedFields = {
            ratePlanId: ratePlan.id,
            ratePlanName: ratePlan.ratePlanName,
            ratePlanCode: ratePlan.ratePlanCode,
            currencyCode: charges[0].currencyCode,
            baseByGuestAmts: sortedBaseAmounts.map(b => ({
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

        const addonCalc = new RoomAddonCalculator(
            ratePlanAddons,
            dates,
            numberOfNights,
            totalGuests,
            guests.rooms,
            guests?.roomsArray || []
        );
        const availableAddonDetails = await addonCalc.calculate();

        const combos: IRoomPrice[] = [];
        if (ratePlan.roomOnlyVisible) {
            combos.push({
                ...sharedFields,
                comboLabel: {
                    id: 'room_only',
                    label: 'Room Only'
                },
                addons: [],
                totalAmount: baseAmount - totalAutoDiscount,
            });
        }

        for (const addon of availableAddonDetails) {
            combos.push({
                ...sharedFields,
                comboLabel: {
                    id: `${addon.id}`,
                    label: `${addon.name}`
                },
                addons: [addon],
                totalAmount: baseAmount - totalAutoDiscount + addon.price,
            });
        }

        return combos.sort((a, b) => a.totalAmount - b.totalAmount);
    }

    static calculateDiscount(
        baseAmount: number,
        discountType: string,
        discountValue: number
    ): number {
        if (discountType === 'percentage') {
            return baseAmount * (discountValue / 100);
        }
        return discountValue; // flat
    }

    static calculateGeoDiscount(
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

    static isDateRangeWithinPeriod(
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

    static mapPromotion(promo: IRoomPromotionData): IPromotion {
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

    public static async getCalendarPrices(propertyCode: string, startDate: string, endDate: string) {
        const start = toUTCDate(startDate);
        const end = toUTCDate(endDate);

        const property = await RoomBookingRepository.getPropertyByCode(propertyCode) as any;
        const currencyCode = property?.propertyConfigs?.baseCurrency || 'AED';

        const charges = await RoomBookingRepository.getPropertyChargesForCalendar(propertyCode, start, end);

        const minPricesByDate: Record<string, number> = {};

        (charges as any[]).forEach((charge) => {
            const dateKey = new Date(charge.date.getTime() - charge.date.getTimezoneOffset() * 60000).toISOString().split('T')[0];

            // Check day of week applicability
            const dow = charge.date.getUTCDay();
            const dowFields: Record<number, string> = {
                0: 'sunApplicable',
                1: 'monApplicable',
                2: 'tueApplicable',
                3: 'wedApplicable',
                4: 'thuApplicable',
                5: 'friApplicable',
                6: 'satApplicable',
            };
            const dayField = dowFields[dow];
            if (!charge[dayField]) return;

            const baseAmount = charge.baseGuestAmounts[0]?.amountBeforeTax;

            if (baseAmount !== undefined) {
                if (minPricesByDate[dateKey] === undefined || baseAmount < minPricesByDate[dateKey]) {
                    minPricesByDate[dateKey] = baseAmount;
                }
            }
        });

        // Fill in missing dates with 0 as requested
        const result: Record<string, number> = {};

        let current = new Date(start);
        const endKey = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        while (true) {
            const dateKey = new Date(current.getTime() - current.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            result[dateKey] = minPricesByDate[dateKey] || 0;
            if (dateKey === endKey) break;
            current.setDate(current.getDate() + 1);
        }

        return {
            success: true,
            data: result,
            currencyCode
        };
    }
}

class ChargeValidator {
    private charges: IRoomCharge[];
    private dates: Date[];

    constructor(charges: IRoomCharge[], dates: Date[]) {
        this.charges = charges;
        this.dates = dates;
    }

    validate(): boolean {
        // ✅ Stay charges = all except last (which is checkout date)
        const stayCharges = this.charges.slice(0, this.dates.length);
        const checkoutCharge = this.charges[this.dates.length]; // extra checkout date charge

        // Must have a charge for every stay night
        if (stayCharges.length !== this.dates.length) return false;

        // Validate each stay night
        for (const charge of stayCharges) {
            if (charge.isSaleStopped) return false;

            const dow = new Date(charge.date).getDay();
            const dowFields: Record<number, keyof IRoomCharge> = {
                0: 'sunApplicable',
                1: 'monApplicable',
                2: 'tueApplicable',
                3: 'wedApplicable',
                4: 'thuApplicable',
                5: 'friApplicable',
                6: 'satApplicable',
            };
            if (!charge[dowFields[dow]]) return false;
        }

        // ✅ CTA check on checkin date (first stay night)
        if (stayCharges[0]?.isClosedToArrival) return false;

        // ✅ CTD check on checkout date (the extra charge we fetched)
        if (checkoutCharge?.isClosedToDeparture) return false;

        return true;
    }
}

class RestrictionChecker {
    private geoRatePlan: IRoomGeoRatePlan | null;
    private bookingOffset: IRoomBookingOffset | null;
    private ratePlanRule: IRoomRatePlanRule | null;
    private checkInDate: Date;
    private today: Date;
    private numberOfNights: number;
    private payload: IBookingSearchPayload;

    constructor(
        geoRatePlan: IRoomGeoRatePlan | null,
        bookingOffset: IRoomBookingOffset | null,
        ratePlanRule: IRoomRatePlanRule | null,
        checkInDate: Date,
        today: Date,
        numberOfNights: number,
        payload: IBookingSearchPayload
    ) {
        this.geoRatePlan = geoRatePlan;
        this.bookingOffset = bookingOffset;
        this.ratePlanRule = ratePlanRule;
        this.checkInDate = checkInDate;
        this.today = today;
        this.numberOfNights = numberOfNights;
        this.payload = payload;
    }

    validate(): boolean {
        if (this.geoRatePlan?.restrictionType === 'restricted') return false;

        if (!this.validateBookingOffset()) return false;
        if (!this.validateRatePlanRule()) return false;

        return true;
    }

    private validateBookingOffset(): boolean {
        if (!this.bookingOffset) return true;

        const hoursUntilCheckIn = DateTime.fromJSDate(
            toUTCDate(this.checkInDate)
        ).diff(DateTime.fromJSDate(toUTCDate(this.today)), 'hours').hours;

        if (
            this.bookingOffset.minimumAdvanceBookingOffset !== null &&
            this.bookingOffset.minimumAdvanceBookingOffset !== undefined &&
            hoursUntilCheckIn < this.bookingOffset.minimumAdvanceBookingOffset
        ) {
            return false;
        }

        if (
            this.bookingOffset.maximumAdvanceBookingOffset !== null &&
            this.bookingOffset.maximumAdvanceBookingOffset !== undefined &&
            hoursUntilCheckIn > this.bookingOffset.maximumAdvanceBookingOffset
        ) {
            return false;
        }

        return true;
    }

    private validateRatePlanRule(): boolean {
        if (!this.ratePlanRule || !this.ratePlanRule.isActive) return true;

        const withinPeriod = RoomBookingService.isDateRangeWithinPeriod(
            this.payload.startDate,
            this.payload.endDate,
            this.ratePlanRule.startDate,
            this.ratePlanRule.endDate
        );

        if (withinPeriod) {
            if (
                this.ratePlanRule.minLos &&
                this.numberOfNights < this.ratePlanRule.minLos
            ) {
                return false;
            }
            if (
                this.ratePlanRule.maxLos &&
                this.numberOfNights > this.ratePlanRule.maxLos
            ) {
                return false;
            }
        }

        return true;
    }
}

class PromotionFilter {
    static filter(
        promotions: IRoomPromotionData[],
        checkInDate: Date,
        today: Date
    ): IRoomPromotionData[] {
        const daysBetweenBookingAndCheckIn = Math.floor(
            DateTime.fromJSDate(toUTCDate(checkInDate)).diff(
                DateTime.fromJSDate(toUTCDate(today)),
                'days'
            ).days
        );

        return promotions.filter(promo => {
            if (
                promo.promotionType === 'early_bird' &&
                promo.advanceBookingDays &&
                daysBetweenBookingAndCheckIn < promo.advanceBookingDays
            ) {
                return false;
            }
            return true;
        });
    }
}

class RoomBasePriceCalculator {
    private charge: IRoomCharge;
    private guests: IBookingSearchPayload['guests'];
    private room: IPropertyRoom;

    constructor(
        charge: IRoomCharge,
        guests: IBookingSearchPayload['guests'],
        room: IPropertyRoom // ← new param
    ) {
        this.charge = charge;
        this.guests = guests;
        this.room = room;
    }

    calculate(): {
        baseAmount: number;
        sortedBaseAmounts: IRoomChargeBaseByGuest[];
    } | null {
        const { adults, children } = this.guests;
        const { maxOccupancy, maxNumberOfAdults, maxNumberOfChildren } =
            this.room;

        if (adults + children > maxOccupancy) return null;

        const gap = Math.max(
            0,
            maxOccupancy - maxNumberOfAdults - maxNumberOfChildren
        );

        if (adults > maxNumberOfAdults + gap) return null;
        if (children > maxNumberOfChildren + gap) return null;

        const adultGapUsed = Math.max(0, adults - maxNumberOfAdults);
        const childGapUsed = Math.max(0, children - maxNumberOfChildren);
        if (adultGapUsed + childGapUsed > gap) return null;

        const adultBaseAmounts = this.charge.baseGuestAmounts
            .filter((b: IRoomChargeBaseByGuest) => b.ageQualifyingCode === '10')
            .sort(
                (a: IRoomChargeBaseByGuest, b: IRoomChargeBaseByGuest) =>
                    a.numberOfGuests - b.numberOfGuests
            );

        const childBaseAmounts = this.charge.baseGuestAmounts
            .filter((b: IRoomChargeBaseByGuest) => b.ageQualifyingCode === '8')
            .sort(
                (a: IRoomChargeBaseByGuest, b: IRoomChargeBaseByGuest) =>
                    a.numberOfGuests - b.numberOfGuests
            );

        const additionalAdultCharge = this.charge.additionalGuestAmounts.find(
            (a: IRoomChargeAdditionalGuest) => a.ageQualifyingCode === '10'
        );

        const additionalChildCharge = this.charge.additionalGuestAmounts.find(
            (a: IRoomChargeAdditionalGuest) => a.ageQualifyingCode === '8'
        );

        const adultResult = this.calculateAdultPrice(
            adults,
            maxNumberOfAdults,
            adultBaseAmounts,
            additionalAdultCharge
        );
        if (adultResult === null) return null;

        const childResult = this.calculateChildPrice(
            children,
            maxNumberOfChildren,
            childBaseAmounts,
            additionalChildCharge
        );
        if (childResult === null) return null;

        const baseAmount = adultResult + childResult;

        const sortedBaseAmounts = [...this.charge.baseGuestAmounts].sort(
            (a: IRoomChargeBaseByGuest, b: IRoomChargeBaseByGuest) =>
                a.numberOfGuests - b.numberOfGuests
        );

        return { baseAmount, sortedBaseAmounts };
    }

    private calculateAdultPrice(
        adults: number,
        maxAdults: number,
        adultBaseAmounts: IRoomChargeBaseByGuest[],
        additionalAdultCharge: IRoomChargeAdditionalGuest | undefined
    ): number | null {
        if (adults <= maxAdults) {
            const exact = adultBaseAmounts.find(
                b => b.numberOfGuests === adults
            );
            if (!exact) return null;
            return Number(exact.amountBeforeTax);
        }

        const maxBase = adultBaseAmounts.find(
            b => b.numberOfGuests === maxAdults
        );
        if (!maxBase) return null;
        if (!additionalAdultCharge) return null;

        const extraAdults = adults - maxAdults;
        return (
            Number(maxBase.amountBeforeTax) +
            extraAdults * Number(additionalAdultCharge.amount)
        );
    }

    private calculateChildPrice(
        children: number,
        maxChildren: number,
        childBaseAmounts: IRoomChargeBaseByGuest[],
        additionalChildCharge: IRoomChargeAdditionalGuest | undefined
    ): number | null {
        if (children === 0) return 0;

        if (children <= maxChildren && childBaseAmounts.length === 0) return 0;

        const basePrice = this.resolveChildBasePrice(
            Math.min(children, maxChildren),
            childBaseAmounts
        );
        if (basePrice === null) return null;

        if (children <= maxChildren) return basePrice;

        if (!additionalChildCharge) return null;

        const extraChildren = children - maxChildren;
        return basePrice + extraChildren * Number(additionalChildCharge.amount);
    }

    private resolveChildBasePrice(
        count: number,
        childBaseAmounts: IRoomChargeBaseByGuest[]
    ): number | null {
        if (childBaseAmounts.length === 0) return 0;

        const exact = childBaseAmounts.find(b => b.numberOfGuests === count);
        if (exact) return Number(exact.amountBeforeTax);

        const highest = childBaseAmounts[childBaseAmounts.length - 1];
        return Number(highest.amountBeforeTax);
    }
}

class RoomDiscountCalculator {
    private baseAmount: number;
    private devicePromotion: IRoomPromotionData | null;
    private geoRatePlan: IRoomGeoRatePlan | null;
    private filteredPromotions: IRoomPromotionData[];
    private ratePlanRule: IRoomRatePlanRule | null;
    private promoCodeData: IRoomPromoCode | null;
    private numberOfNights: number;
    private payload: IBookingSearchPayload;
    private roomType: string;
    private ratePlanCode: string;
    private deviceType?: string;

    constructor(
        baseAmount: number,
        devicePromotion: IRoomPromotionData | null,
        geoRatePlan: IRoomGeoRatePlan | null,
        filteredPromotions: IRoomPromotionData[],
        ratePlanRule: IRoomRatePlanRule | null,
        promoCodeData: IRoomPromoCode | null,
        numberOfNights: number,
        payload: IBookingSearchPayload,
        roomType: string,
        ratePlanCode: string,
        deviceType?: string
    ) {
        this.baseAmount = baseAmount;
        this.devicePromotion = devicePromotion;
        this.geoRatePlan = geoRatePlan;
        this.filteredPromotions = filteredPromotions;
        this.ratePlanRule = ratePlanRule;
        this.promoCodeData = promoCodeData;
        this.numberOfNights = numberOfNights;
        this.payload = payload;
        this.roomType = roomType;
        this.ratePlanCode = ratePlanCode;
        this.deviceType = deviceType;
    }

    calculate(): {
        totalAutoDiscount: number;
        appliedDiscounts: IAppliedDiscount[];
        availablePromotions: IPromotion[];
    } {
        const appliedDiscounts: IAppliedDiscount[] = [];
        const internalDiscounts: IAppliedDiscount[] = [];
        const availablePromotions: IPromotion[] = [];

        // Apply all discounts
        this.applyDevicePromotion(appliedDiscounts);
        this.applyGeoDiscount(internalDiscounts);
        this.applyPromotions(appliedDiscounts, availablePromotions);
        this.applyRatePlanRule(appliedDiscounts, availablePromotions);
        this.applyPromoCode(appliedDiscounts);

        const totalAutoDiscount = [
            ...appliedDiscounts,
            ...internalDiscounts,
        ].reduce((sum, d) => sum + d.calculatedDiscountAmount, 0);

        return { totalAutoDiscount, appliedDiscounts, availablePromotions };
    }

    private applyDevicePromotion(appliedDiscounts: IAppliedDiscount[]): void {
        if (!this.devicePromotion || !this.devicePromotion.isAutoApplied)
            return;

        const discount = RoomBookingService.calculateDiscount(
            this.baseAmount,
            this.devicePromotion.discountType,
            Number(this.devicePromotion.discountValue)
        );
        appliedDiscounts.push({
            id: this.devicePromotion.id,
            promotionName: this.devicePromotion.promotionName,
            promotionType: this.devicePromotion.promotionType,
            discountType: this.devicePromotion.discountType,
            discountValue: Number(this.devicePromotion.discountValue),
            calculatedDiscountAmount: discount,
        });
    }

    private applyGeoDiscount(internalDiscounts: IAppliedDiscount[]): void {
        if (!this.geoRatePlan) return;
        if (this.geoRatePlan.restrictionType === 'restricted') return;

        const restrictionValue = Number(this.geoRatePlan.restrictionValue ?? 0);
        const geoDiscount = RoomBookingService.calculateGeoDiscount(
            this.baseAmount,
            this.geoRatePlan.restrictionType,
            this.geoRatePlan.restrictionTypeAction,
            restrictionValue
        );

        internalDiscounts.push({
            id: this.geoRatePlan.id,
            promotionName: 'Geo rate adjustment',
            promotionType: 'geo',
            discountType:
                this.geoRatePlan.restrictionType === 'percentage'
                    ? 'percentage'
                    : 'fixed',
            discountValue: restrictionValue,
            calculatedDiscountAmount: geoDiscount,
        });
    }

    private applyPromotions(
        appliedDiscounts: IAppliedDiscount[],
        availablePromotions: IPromotion[]
    ): void {
        for (const promo of this.filteredPromotions) {
            const discount = RoomBookingService.calculateDiscount(
                this.baseAmount,
                promo.discountType,
                Number(promo.discountValue)
            );
            if (promo.isAutoApplied) {
                appliedDiscounts.push({
                    id: promo.id,
                    promotionName: promo.promotionName,
                    promotionType: promo.promotionType,
                    discountType: promo.discountType,
                    discountValue: Number(promo.discountValue),
                    calculatedDiscountAmount: discount,
                });
            } else {
                availablePromotions.push(
                    RoomBookingService.mapPromotion(promo)
                );
            }
        }
    }

    private applyRatePlanRule(
        appliedDiscounts: IAppliedDiscount[],
        availablePromotions: IPromotion[]
    ): void {
        if (
            !this.ratePlanRule ||
            !this.ratePlanRule.isActive ||
            !this.ratePlanRule.minLos ||
            this.numberOfNights < this.ratePlanRule.minLos ||
            !RoomBookingService.isDateRangeWithinPeriod(
                this.payload.startDate,
                this.payload.endDate,
                this.ratePlanRule.startDate,
                this.ratePlanRule.endDate
            ) ||
            !this.ratePlanRule.discountType ||
            !this.ratePlanRule.discountValue
        ) {
            return;
        }

        const discount = RoomBookingService.calculateDiscount(
            this.baseAmount,
            this.ratePlanRule.discountType,
            Number(this.ratePlanRule.discountValue)
        );

        if (this.ratePlanRule.isAutoApplied) {
            appliedDiscounts.push({
                id: this.ratePlanRule.id,
                promotionName: `Minimum ${this.ratePlanRule.minLos} nights stay`,
                promotionType: 'mlos',
                discountType: this.ratePlanRule.discountType,
                discountValue: Number(this.ratePlanRule.discountValue),
                calculatedDiscountAmount: discount,
            });
        } else {
            availablePromotions.push({
                id: this.ratePlanRule.id,
                promotionName: `Minimum ${this.ratePlanRule.minLos} nights stay`,
                promotionType: 'mlos',
                discountType: this.ratePlanRule.discountType,
                discountValue: this.ratePlanRule.discountValue,
                minLos: this.ratePlanRule.minLos,
                maxLos: this.ratePlanRule.maxLos || undefined,
                validFrom: this.ratePlanRule.startDate,
                validTo: this.ratePlanRule.endDate,
                advanceBookingDays: null,
            });
        }
    }

    private applyPromoCode(appliedDiscounts: IAppliedDiscount[]): void {
        if (!this.promoCodeData) return;

        const roomApplicable =
            this.promoCodeData.applicableRoomTypes.includes('all') ||
            this.promoCodeData.applicableRoomTypes.includes(this.roomType);

        const ratePlanApplicable =
            this.promoCodeData.applicableRatePlans.includes('all') ||
            this.promoCodeData.applicableRatePlans.includes(this.ratePlanCode);

        const deviceApplicable =
            !this.deviceType ||
            (this.deviceType === 'mobile' &&
                this.promoCodeData.isApplicableForMobileApp) ||
            (this.deviceType === 'tablet' &&
                this.promoCodeData.isApplicableForTablet) ||
            (this.deviceType === 'desktop' &&
                this.promoCodeData.isApplicableForDesktop);

        const now = new Date();
        const dateValid =
            (!this.promoCodeData.validFrom ||
                new Date(this.promoCodeData.validFrom) <= now) &&
            (!this.promoCodeData.validTo ||
                new Date(this.promoCodeData.validTo) >= now);

        const minAmountValid =
            !this.promoCodeData.minBookingAmount ||
            this.baseAmount >= Number(this.promoCodeData.minBookingAmount);

        if (
            roomApplicable &&
            ratePlanApplicable &&
            deviceApplicable &&
            dateValid &&
            minAmountValid
        ) {
            let promoDiscount = RoomBookingService.calculateDiscount(
                this.baseAmount,
                this.promoCodeData.discountType,
                Number(this.promoCodeData.discountValue)
            );

            if (
                this.promoCodeData.maxDiscountAmount &&
                promoDiscount > Number(this.promoCodeData.maxDiscountAmount)
            ) {
                promoDiscount = Number(this.promoCodeData.maxDiscountAmount);
            }

            appliedDiscounts.push({
                id: this.promoCodeData.id,
                promotionName: this.promoCodeData.name,
                promotionType: 'promocode',
                discountType: this.promoCodeData.discountType,
                discountValue: Number(this.promoCodeData.discountValue),
                calculatedDiscountAmount: promoDiscount,
            });
        }
    }
}

class RoomTouristTaxCalculator {
    static calculate(
        touristTaxData: IRoomTouristTaxData | null,
        baseAmount: number,
        numberOfNights: number,
        numberOfRooms: number,
        numberOfBedrooms: number,
        currencyCode:string
    ): ITouristTax | null {
        if (!touristTaxData) return null;
        const isPercentage = touristTaxData.discountType === 'percentage';

        const calculatedTaxAmount =
            touristTaxData.discountType === 'percentage'
                ? baseAmount * (Number(touristTaxData.discountValue) / 100)*
                numberOfNights *
                numberOfRooms *
                numberOfBedrooms
                : Number(touristTaxData.discountValue) *
                numberOfNights *
                numberOfRooms *
                numberOfBedrooms;

       return {
            id: touristTaxData.id,
            name: touristTaxData.name || '',
            discountType: touristTaxData.discountType as DiscountType,
            discountValue: touristTaxData.discountValue,
            currencyCode: (isPercentage
                ? currencyCode
                : touristTaxData.currencyCode || 'USD'
            ) as CurrencyCode,
            calculatedTaxAmount,
        };
    }
}

class RoomAddonCalculator {
    private ratePlanAddons: IRatePlanAddon[];
    private dates: Date[];
    private numberOfNights: number;
    private totalGuests: number;
    private numberOfRooms: number;
    private roomsArray: {
        adults: number;
        children: number;
        childAges: number[];
    }[];

    constructor(
        ratePlanAddons: IRatePlanAddon[],
        dates: Date[],
        numberOfNights: number,
        totalGuests: number,
        numberOfRooms: number,
        roomsArray: { adults: number; children: number; childAges: number[] }[]
    ) {
        this.ratePlanAddons = ratePlanAddons;
        this.dates = dates;
        this.numberOfNights = numberOfNights;
        this.totalGuests = totalGuests;
        this.numberOfRooms = numberOfRooms;
        this.roomsArray = roomsArray;
    }

    async calculate(): Promise<IAddonDetail[]> {
        const availableAddonDetails: IAddonDetail[] = [];

        if (this.ratePlanAddons.length === 0) return availableAddonDetails;

        const addonAvailabilityResults = await Promise.all(
            this.ratePlanAddons.map(rpa =>
                RoomBookingRepository.getAddonAvailability(
                    rpa.addonId,
                    this.dates
                )
            )
        );

        for (let i = 0; i < this.ratePlanAddons.length; i++) {
            const availability = addonAvailabilityResults[i];
            if (availability.length !== this.dates.length) continue;

            const addon = this.ratePlanAddons[i].addon;
            const addonPrice = this.calculateAddonPrice(addon, availability);

            availableAddonDetails.push({
                id: addon.id,
                name: addon.name,
                code: addon.code,
                price: addonPrice,
                postingRhythm: addon.postingRhythm,
                description: addon.description,
                images: addon.images || [],
                category: addon.category
                    ? {
                        id: addon.category.id,
                        name: addon.category.name,
                        code: addon.category.code,
                    }
                    : null,
                subCategory: addon.subCategory
                    ? {
                        id: addon.subCategory.id,
                        name: addon.subCategory.name,
                        code: addon.subCategory.code,
                    }
                    : null,
                addonVariant: addon.addonVariant
                    ? {
                        id: addon.addonVariant.id,
                        name: addon.addonVariant.name,
                        code: addon.addonVariant.code,
                    }
                    : null,
            });
        }

        return availableAddonDetails;
    }

    private calculateAddonPrice(
        addon: IAddonWithRelations,
        availabilities: IAddonAvailability[]
    ): number {
        const singleDatePrice = Number(availabilities[0].price);
        const childAddons = addon.ChildAddons || [];

        const getChildPrice = (age: number): number => {
            const match = childAddons.find(
                c => age >= c.minAge && age <= c.maxAge
            );
            if (!match) return singleDatePrice;
            if (
                !match.discountApplicable ||
                !match.discountType ||
                !match.discountAmount
            )
                return 0;
            if (match.discountType === 'percentage') {
                return singleDatePrice * (1 - match.discountAmount / 100);
            }
            return Math.max(0, singleDatePrice - match.discountAmount);
        };

        const getRoomGuestPrice = (room: {
            adults: number;
            childAges: number[];
        }): number => {
            const adultPrice = singleDatePrice * room.adults;
            const childPrice = room.childAges.reduce(
                (sum, age) => sum + getChildPrice(age),
                0
            );
            return adultPrice + childPrice;
        };

        switch (addon.postingRhythm) {
            case 'per_stay':
                return singleDatePrice;
            case 'per_night':
                return singleDatePrice * this.numberOfNights;
            case 'per_room':
                return singleDatePrice * this.numberOfRooms;
            case 'per_room_per_night':
                return (
                    singleDatePrice * this.numberOfRooms * this.numberOfNights
                );
            case 'per_person_per_stay':
                return this.roomsArray.reduce(
                    (sum, room) => sum + getRoomGuestPrice(room),
                    0
                );
            case 'per_person_per_night':
                return (
                    this.roomsArray.reduce(
                        (sum, room) => sum + getRoomGuestPrice(room),
                        0
                    ) * this.numberOfNights
                );
            case 'per_person_per_room':
                return this.roomsArray.reduce(
                    (sum, room) =>
                        sum + getRoomGuestPrice(room) * this.numberOfRooms,
                    0
                );
            default:
                return 0;
        }
    }
}
