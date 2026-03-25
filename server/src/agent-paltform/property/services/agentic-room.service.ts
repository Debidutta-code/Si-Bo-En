import { DateTime } from 'luxon';
import { successResponse, errorResponse, IApiResponse, calculateNights, toUTCDate } from "../../../utils";
import {
    AgenticRoomRepository,
    AgenticRatePlanRepository,
    AgenticPropertyRepository
} from "../repository";
import { IRatePlan, IPolicy } from "../types";
import {
    IRoomCharge,
    IRoomChargeBaseByGuest,
    IRoomChargeAdditionalGuest,
    IRoomGeoRatePlan,
    IRoomRatePlanRule,
    IRoomBookingOffset,
    IRoomTouristTaxData,
    IRoomPrice,
    IRoom,
    IAppliedDiscount,
    ITouristTax,
    IBaseByGuestAmount,
} from '../../../booking-engine/types';
import { DiscountType, CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';

export interface IAgentSearchPayload {
    startDate: string;
    endDate: string;
    guests: {
        adults: number;
        children: number;
        rooms: number;
        roomsArray?: { adults: number; children: number; childAges: number[] }[];
    };
}

export class AgenticRoomService {
    private agenticRoomRepository: AgenticRoomRepository;
    private agenticRatePlanRepository: AgenticRatePlanRepository;
    private agenticPropertyRepository: AgenticPropertyRepository;

    constructor() {
        this.agenticRoomRepository = new AgenticRoomRepository();
        this.agenticRatePlanRepository = new AgenticRatePlanRepository();
        this.agenticPropertyRepository = new AgenticPropertyRepository();
    }

    public async getRoomDetails(
        agencyId: string,
        propertyId: string,
        startDate: string,
        endDate: string,
        guests: IAgentSearchPayload['guests'],
        countryCode: string
    ): Promise<IApiResponse> {
        try {
            const agenticProperty = await this.agenticPropertyRepository.getAgenticPropertyById(agencyId, propertyId);
            if (!agenticProperty) {
                return errorResponse("Agentic Property not found", "Property does not exist or deleted");
            }

            const property = agenticProperty.Property;

            const [roomDetails, ratePlans] = await Promise.all([
                this.agenticRoomRepository.agenticRooms(agenticProperty.id),
                this.agenticRatePlanRepository.getRatePlans(propertyId)
            ]);

            // Build date array
            const dates: Date[] = [];
            let current = toUTCDate(startDate);
            const last = toUTCDate(endDate);
            while (current < last) {
                dates.push(current);
                current = toUTCDate(new Date(new Date(current).setDate(current.getDate() + 1)));
            }

            const totalGuests = guests.adults + guests.children;
            const numberOfNights = calculateNights(startDate, endDate);
            const roomsArray = guests.roomsArray || [];

            // Process each room
            const roomResults = await Promise.all(
                roomDetails.map(agenticRoom =>
                    this.processRoom(
                        agenticRoom,
                        property,
                        ratePlans,
                        dates,
                        totalGuests,
                        numberOfNights,
                        guests,
                        roomsArray,
                        startDate,
                        endDate,
                        countryCode
                    )
                )
            );

            const rooms: IRoom[] = roomResults.filter((r): r is IRoom => r !== null);

            return successResponse("Rooms fetched successfully", {
                propertyDetails: {
                    id: property.id,
                    propertyName: property.propertyName,
                    propertyCode: property.propertyCode,
                },
                rooms,
                searchCriteria: {
                    startDate,
                    endDate,
                    guests,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve room details", error.message);
            }
            return errorResponse("Failed to retrieve room details");
        }
    }

    private async processRoom(
        agenticRoom: any,
        property: any,
        ratePlans: IRatePlan[],
        dates: Date[],
        totalGuests: number,
        numberOfNights: number,
        guests: IAgentSearchPayload['guests'],
        roomsArray: { adults: number; children: number; childAges: number[] }[],
        startDate: string,
        endDate: string,
        countryCode: string
    ): Promise<IRoom | null> {
        const room = agenticRoom.room;

        // Check inventory availability
        const inventory = await this.agenticRoomRepository.getInventoryByProperty(
            property.propertyCode,
            room.roomType,
            dates
        );
        if (inventory.length !== dates.length) return null;

        // Process each rate plan
        const ratePlanResults = await Promise.all(
            ratePlans.map((ratePlan: IRatePlan) =>
                this.processRatePlan(
                    ratePlan,
                    room,
                    property,
                    dates,
                    totalGuests,
                    numberOfNights,
                    guests,
                    roomsArray,
                    startDate,
                    endDate,
                    countryCode
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
            roomView: room.roomView,
            maxOccupancy: room.maxOccupancy,
            description: room.description || '',
            images: room.image || [],
            amenities: room.roomAmenities.map((r: any) => r.amenity),
            hasValidRate: roomPrice.length > 0,
            roomPrice,
            roomVideos: room.roomVideos || null,
        };
    }

    private async processRatePlan(
        ratePlan: IRatePlan,
        room: any,
        property: any,
        dates: Date[],
        totalGuests: number,
        numberOfNights: number,
        guests: IAgentSearchPayload['guests'],
        roomsArray: { adults: number; children: number; childAges: number[] }[],
        startDate: string,
        endDate: string,
        countryCode: string
    ): Promise<IRoomPrice[] | null> {
        const today = new Date();
        const checkInDate = dates[0];

        const [
            charges,
            geoRatePlan,
            ratePlanRule,
            touristTaxData,
            bookingOffset,
        ] = await Promise.all([
            this.agenticRoomRepository.getCharges(
                property.propertyCode,
                room.roomType,
                ratePlan.ratePlanCode,
                dates
            ) as Promise<IRoomCharge[]>,
            this.agenticRoomRepository.getGeoRatePlan(
                property.id,
                room.id,
                ratePlan.id,
                countryCode || 'US'
            ) as Promise<IRoomGeoRatePlan | null>,
            this.agenticRoomRepository.getRatePlanRule(ratePlan.id) as Promise<IRoomRatePlanRule | null>,
            this.agenticRoomRepository.getTouristTax(ratePlan.id) as Promise<IRoomTouristTaxData | null>,
            this.agenticRoomRepository.getBookingOffset(ratePlan.id, toUTCDate(checkInDate)) as Promise<IRoomBookingOffset | null>,
        ]);

        // Validate charges
        if (!this.validateCharges(charges, dates)) return null;

        // Validate restrictions
        if (!this.validateRestrictions(geoRatePlan, bookingOffset, ratePlanRule, checkInDate, today, numberOfNights, startDate, endDate)) return null;

        // Check room capacity
        const anyRoomExceedsCapacity = roomsArray.some(
            r => (r.adults + r.children) > room.maxOccupancy
        );
        if (anyRoomExceedsCapacity) return null;

        // Calculate base amount
        let baseAmount = 0;
        let sortedBaseAmounts: IRoomChargeBaseByGuest[] = [];

        for (const roomConfig of roomsArray) {
            const perRoomGuests = {
                ...guests,
                adults: roomConfig.adults,
                children: roomConfig.children,
            };
            const result = this.calculateBasePrice(charges[0], perRoomGuests);
            if (result === null) return null;
            baseAmount += result.baseAmount * numberOfNights;
            sortedBaseAmounts = result.sortedBaseAmounts;
        }

        // Apply geo discount silently
        const { totalGeoDiscount } = this.calculateGeoDiscount(baseAmount, geoRatePlan);

        // Apply rate plan rule discount
        const { ruleDiscount, appliedDiscounts } = this.calculateRatePlanRuleDiscount(
            baseAmount,
            ratePlanRule,
            numberOfNights,
            startDate,
            endDate
        );

        const totalDiscount = totalGeoDiscount + ruleDiscount;

        // Calculate tourist tax
        const touristTax = this.calculateTouristTax(touristTaxData, baseAmount);

        const sharedFields = {
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
            availablePromotions: [],
            appliedDiscounts,
            touristTax,
        };

        const combos: IRoomPrice[] = [];

        // Room Only combo (always show for agents since no addons)
        combos.push({
            ...sharedFields,
            comboLabel: 'Room Only',
            addons: [],
            totalAmount: baseAmount - totalDiscount,
        });

        return combos.sort((a, b) => a.totalAmount - b.totalAmount);
    }

    // ─── Charge Validation ─────────────────────────────────────────────

    private validateCharges(charges: IRoomCharge[], dates: Date[]): boolean {
        if (charges.length !== dates.length) return false;

        for (const charge of charges) {
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

        const checkInCharge = charges[0];
        if (checkInCharge?.isClosedToArrival) return false;

        const checkOutCharge = charges[charges.length - 1];
        if (checkOutCharge?.isClosedToDeparture) return false;

        return true;
    }

    // ─── Restriction Validation ────────────────────────────────────────

    private validateRestrictions(
        geoRatePlan: IRoomGeoRatePlan | null,
        bookingOffset: IRoomBookingOffset | null,
        ratePlanRule: IRoomRatePlanRule | null,
        checkInDate: Date,
        today: Date,
        numberOfNights: number,
        startDate: string,
        endDate: string
    ): boolean {
        // Geo restriction
        if (geoRatePlan?.restrictionType === 'restricted') return false;

        // Booking offset
        if (bookingOffset) {
            const hoursUntilCheckIn = DateTime.fromJSDate(toUTCDate(checkInDate))
                .diff(DateTime.fromJSDate(toUTCDate(today)), 'hours')
                .hours;

            if (
                bookingOffset.minimumAdvanceBookingOffset !== null &&
                bookingOffset.minimumAdvanceBookingOffset !== undefined &&
                hoursUntilCheckIn < bookingOffset.minimumAdvanceBookingOffset
            ) {
                return false;
            }

            if (
                bookingOffset.maximumAdvanceBookingOffset !== null &&
                bookingOffset.maximumAdvanceBookingOffset !== undefined &&
                hoursUntilCheckIn > bookingOffset.maximumAdvanceBookingOffset
            ) {
                return false;
            }
        }

        // Rate plan rule LOS
        if (ratePlanRule && ratePlanRule.isActive) {
            const withinPeriod = this.isDateRangeWithinPeriod(
                startDate,
                endDate,
                ratePlanRule.startDate,
                ratePlanRule.endDate
            );

            if (withinPeriod) {
                if (ratePlanRule.minLos && numberOfNights < ratePlanRule.minLos) return false;
                if (ratePlanRule.maxLos && numberOfNights > ratePlanRule.maxLos) return false;
            }
        }

        return true;
    }

    // ─── Base Price Calculation ─────────────────────────────────────────

    private calculateBasePrice(
        charge: IRoomCharge,
        guests: { adults: number; children: number }
    ): { baseAmount: number; sortedBaseAmounts: IRoomChargeBaseByGuest[] } | null {
        const adultBaseAmounts = charge.baseGuestAmounts
            .filter((b: IRoomChargeBaseByGuest) => b.ageQualifyingCode === '10')
            .sort((a: IRoomChargeBaseByGuest, b: IRoomChargeBaseByGuest) => a.numberOfGuests - b.numberOfGuests);

        const childBaseAmounts = charge.baseGuestAmounts
            .filter((b: IRoomChargeBaseByGuest) => b.ageQualifyingCode === '8')
            .sort((a: IRoomChargeBaseByGuest, b: IRoomChargeBaseByGuest) => a.numberOfGuests - b.numberOfGuests);

        const additionalAdultCharge = charge.additionalGuestAmounts
            .find((a: IRoomChargeAdditionalGuest) => a.ageQualifyingCode === '10');

        const additionalChildCharge = charge.additionalGuestAmounts
            .find((a: IRoomChargeAdditionalGuest) => a.ageQualifyingCode === '8');

        // Adult price
        const adultResult = this.calculateGuestTypePrice(guests.adults, adultBaseAmounts, additionalAdultCharge);
        if (adultResult === null) return null;

        // Child price
        const childResult = guests.children > 0
            ? this.calculateGuestTypePrice(guests.children, childBaseAmounts, additionalChildCharge)
            : { basePrice: 0, additionalCharges: 0 };
        if (childResult === null) return null;

        const baseAmount =
            adultResult.basePrice + childResult.basePrice +
            adultResult.additionalCharges + childResult.additionalCharges;

        const sortedBaseAmounts = [...charge.baseGuestAmounts].sort(
            (a: IRoomChargeBaseByGuest, b: IRoomChargeBaseByGuest) => a.numberOfGuests - b.numberOfGuests
        );

        return { baseAmount, sortedBaseAmounts };
    }

    private calculateGuestTypePrice(
        guestCount: number,
        baseAmounts: IRoomChargeBaseByGuest[],
        additionalCharge: IRoomChargeAdditionalGuest | undefined
    ): { basePrice: number; additionalCharges: number } | null {
        let basePrice = 0;
        let additionalCharges = 0;

        const exactBase = baseAmounts.find(b => b.numberOfGuests === guestCount);
        if (exactBase) {
            basePrice = Number(exactBase.amountBeforeTax);
        } else if (baseAmounts.length > 0) {
            const maxBase = baseAmounts[baseAmounts.length - 1];
            basePrice = Number(maxBase.amountBeforeTax);
            const extraGuests = guestCount - maxBase.numberOfGuests;
            if (extraGuests > 0) {
                if (!additionalCharge) return null;
                additionalCharges = extraGuests * Number(additionalCharge.amount);
            }
        } else {
            if (additionalCharge) {
                additionalCharges = guestCount * Number(additionalCharge.amount);
            } else {
                return null;
            }
        }

        return { basePrice, additionalCharges };
    }

    // ─── Geo Discount ──────────────────────────────────────────────────

    private calculateGeoDiscount(
        baseAmount: number,
        geoRatePlan: IRoomGeoRatePlan | null
    ): { totalGeoDiscount: number } {
        if (!geoRatePlan || geoRatePlan.restrictionType === 'restricted') {
            return { totalGeoDiscount: 0 };
        }

        const restrictionValue = Number(geoRatePlan.restrictionValue ?? 0);

        let geoDiscount = 0;
        if (geoRatePlan.restrictionType === 'percentage') {
            const delta = baseAmount * (restrictionValue / 100);
            geoDiscount = geoRatePlan.restrictionTypeAction === 'increase' ? -delta : delta;
        } else if (geoRatePlan.restrictionType === 'fixed') {
            geoDiscount = geoRatePlan.restrictionTypeAction === 'increase'
                ? -restrictionValue
                : restrictionValue;
        }

        return { totalGeoDiscount: geoDiscount };
    }

    // ─── Rate Plan Rule Discount ───────────────────────────────────────

    private calculateRatePlanRuleDiscount(
        baseAmount: number,
        ratePlanRule: IRoomRatePlanRule | null,
        numberOfNights: number,
        startDate: string,
        endDate: string
    ): { ruleDiscount: number; appliedDiscounts: IAppliedDiscount[] } {
        const appliedDiscounts: IAppliedDiscount[] = [];

        if (
            !ratePlanRule ||
            !ratePlanRule.isActive ||
            !ratePlanRule.minLos ||
            numberOfNights < ratePlanRule.minLos ||
            !this.isDateRangeWithinPeriod(startDate, endDate, ratePlanRule.startDate, ratePlanRule.endDate) ||
            !ratePlanRule.discountType ||
            !ratePlanRule.discountValue
        ) {
            return { ruleDiscount: 0, appliedDiscounts };
        }

        const discount = this.calculateDiscount(
            baseAmount,
            ratePlanRule.discountType,
            Number(ratePlanRule.discountValue)
        );

        if (ratePlanRule.isAutoApplied) {
            appliedDiscounts.push({
                id: ratePlanRule.id,
                promotionName: `Minimum ${ratePlanRule.minLos} nights stay`,
                promotionType: 'mlos',
                discountType: ratePlanRule.discountType,
                discountValue: Number(ratePlanRule.discountValue),
                calculatedDiscountAmount: discount,
            });
            return { ruleDiscount: discount, appliedDiscounts };
        }

        return { ruleDiscount: 0, appliedDiscounts };
    }

    // ─── Tourist Tax ───────────────────────────────────────────────────

    private calculateTouristTax(
        touristTaxData: IRoomTouristTaxData | null,
        baseAmount: number
    ): ITouristTax | null {
        if (!touristTaxData) return null;

        const calculatedTaxAmount =
            touristTaxData.discountType === 'percentage'
                ? baseAmount * (Number(touristTaxData.discountValue) / 100)
                : Number(touristTaxData.discountValue);

        return {
            id: touristTaxData.id,
            name: touristTaxData.name || '',
            discountType: touristTaxData.discountType as DiscountType,
            discountValue: touristTaxData.discountValue,
            currencyCode: (touristTaxData.currencyCode || 'USD') as CurrencyCode,
            calculatedTaxAmount,
        };
    }

    // ─── Utility Helpers ───────────────────────────────────────────────

    private calculateDiscount(
        baseAmount: number,
        discountType: string,
        discountValue: number
    ): number {
        if (discountType === 'percentage') {
            return baseAmount * (discountValue / 100);
        }
        return discountValue; // flat
    }

    private isDateRangeWithinPeriod(
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
