import { DateTime } from 'luxon';
import {
    successResponse,
    errorResponse,
    IApiResponse,
    calculateNights,
    toUTCDate
} from "../../../utils";
import {
    AgenticRoomRepository,
    AgenticRatePlanRepository,
    AgenticPropertyRepository
} from "../repository";
import { IRatePlan, IProperty, IPropertyConfigs } from "../types";
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
    ITouristTax,
    IRoomAmenityDetail,
    IRatePlanAddon,
    IAddonWithRelations,
    IAddonAvailability,
    IAddonDetail,
    IChildAddon,
} from '../../../booking-engine/types';
import { IRoom as IAgenticRoom, IRooms } from '../types';
import { DiscountType, CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';
import { getCurrencyConverter } from '../../../currency-maping/utils';

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

export interface IAgencyCommission {
    commissionType: 'percentage' | 'fixed';
    commissionValue: number;
    commissionCurrency: string | null;
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
            const [agenticProperty, agency] = await Promise.all([
                this.agenticPropertyRepository.getAgenticPropertyById(agencyId, propertyId),
                this.agenticPropertyRepository.getAgencyById(agencyId),
            ]);

            if (!agenticProperty) {
                return errorResponse("Agentic Property not found", "Property does not exist or deleted");
            }
            if (!agency) {
                return errorResponse("Agency not found", "Agency does not exist or deleted");
            }

            const raw = agenticProperty.Property;

            const property: IProperty = {
                id: raw.id,
                propertyName: raw.propertyName,
                propertyEmail: raw.propertyEmail,
                propertyContact: raw.propertyContact,
                propertyCode: raw.propertyCode,
                description: raw.description ?? '',
                image: raw.image ?? [],
                propertyAddress: raw.propertyAddress ?? null,
                propertyAmenities: raw.propertyAmenities ?? [],
                propertyCategory: raw.propertyCategory ?? null,
                propertyType: raw.propertyType ?? null,
                propertyVideos: raw.propertyVideos ?? null,
                propertyConfigs: raw.propertyConfigs ?? null,
            };

            const agencyCommission: IAgencyCommission = {
                commissionType: agency.commissionType as 'percentage' | 'fixed',
                commissionValue: agency.commissionValue,
                commissionCurrency: agency.commissionCurrency ?? null,
            };

            const [roomDetails, ratePlans] = await Promise.all([
                this.agenticRoomRepository.agenticRooms(agenticProperty.id),
                this.agenticRatePlanRepository.getRatePlans(propertyId),
            ]);

            const dates: Date[] = [];
            let current = toUTCDate(startDate);
            const last = toUTCDate(endDate);
            while (current < last) {
                dates.push(current);
                current = toUTCDate(new Date(new Date(current).setDate(current.getDate() + 1)));
            }

            const numberOfNights = calculateNights(startDate, endDate);
            const roomsArray = guests.roomsArray ?? [];

            const roomResults = await Promise.all(
                roomDetails.map((agenticRoom: IRooms) =>
                    this.processRoom(
                        agenticRoom,
                        property,
                        ratePlans,
                        dates,
                        numberOfNights,
                        guests,
                        roomsArray,
                        startDate,
                        endDate,
                        countryCode,
                        agencyCommission
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
                searchCriteria: { startDate, endDate, guests },
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve room details", error.message);
            }
            return errorResponse("Failed to retrieve room details");
        }
    }

    private async processRoom(
        agenticRoom: IRooms,
        property: IProperty,
        ratePlans: IRatePlan[],
        dates: Date[],
        numberOfNights: number,
        guests: IAgentSearchPayload['guests'],
        roomsArray: { adults: number; children: number; childAges: number[] }[],
        startDate: string,
        endDate: string,
        countryCode: string,
        agencyCommission: IAgencyCommission
    ): Promise<IRoom | null> {
        const room: IAgenticRoom = agenticRoom.room;

        const inventory = await this.agenticRoomRepository.getInventoryByProperty(
            property.propertyCode,
            room.roomType,
            dates
        );
        if (inventory.length !== dates.length) return null;

        const ratePlanResults = await Promise.all(
            ratePlans.map((ratePlan: IRatePlan) =>
                this.processRatePlan(
                    ratePlan,
                    room,
                    property,
                    dates,
                    numberOfNights,
                    guests,
                    roomsArray,
                    startDate,
                    endDate,
                    countryCode,
                    agencyCommission
                )
            )
        );

        const roomPrice: IRoomPrice[] = ratePlanResults
            .filter((r): r is IRoomPrice[] => r !== null)
            .flat();

        const amenities: IRoomAmenityDetail[] = room.roomAmenities.map((r) => ({
            id: '',
            amenityName: r.amenity.amenityName,
            amenityType: '',
            description: r.amenity.description,
            icon: r.amenity.icon,
            isActive: true,
        }));

        const roomVideos = room.roomVideos
            ? {
                id: '',
                roomId: room.roomVideos.roomId,
                url: room.roomVideos.url,
                thumbnail: room.roomVideos.thumbnail,
            }
            : null;

        return {
            id: room.id,
            roomName: room.roomName,
            roomType: room.roomType,
            roomSize: Number(room.roomSize),
            roomUnit: room.roomUnit,
            roomView: room.roomView,
            maxOccupancy: room.maxOccupancy,
            description: room.description ?? '',
            images: room.image ?? [],
            amenities,
            hasValidRate: roomPrice.length > 0,
            roomPrice,
            roomVideos,
        };
    }

    private async processRatePlan(
        ratePlan: IRatePlan,
        room: IAgenticRoom,
        property: IProperty,
        dates: Date[],
        numberOfNights: number,
        guests: IAgentSearchPayload['guests'],
        roomsArray: { adults: number; children: number; childAges: number[] }[],
        startDate: string,
        endDate: string,
        countryCode: string,
        agencyCommission: IAgencyCommission
    ): Promise<IRoomPrice[] | null> {
        const today = new Date();
        const checkInDate = dates[0];

        // ✅ ratePlanAddons added to parallel fetch
        const [charges, ratePlanRule, touristTaxData, bookingOffset, ratePlanAddons] = await Promise.all([
            this.agenticRoomRepository.getCharges(
                property.propertyCode,
                room.roomType,
                ratePlan.ratePlanCode,
                dates
            ) as Promise<IRoomCharge[]>,
            this.agenticRoomRepository.getRatePlanRule(ratePlan.id) as Promise<IRoomRatePlanRule | null>,
            this.agenticRoomRepository.getTouristTax(room.id) as Promise<IRoomTouristTaxData | null>,
            this.agenticRoomRepository.getBookingOffset(
                ratePlan.id,
                toUTCDate(checkInDate)
            ) as Promise<IRoomBookingOffset | null>,
            this.agenticRoomRepository.getRatePlanAddons(ratePlan.id) as Promise<IRatePlanAddon[]>,
        ]);

        if (!this.validateCharges(charges, dates)) return null;

        if (!this.validateRestrictions(
            bookingOffset, ratePlanRule,
            checkInDate, today, numberOfNights, startDate, endDate
        )) return null;

        if (roomsArray.length > 0) {
            const anyExceeds = roomsArray.some(r =>
                r.adults > room.maxNumberOfAdults ||
                r.children > room.maxNumberOfChildren ||
                (r.adults + r.children) > room.maxOccupancy
            );
            if (anyExceeds) return null;
        } else {
            if (
                guests.adults > room.maxNumberOfAdults ||
                guests.children > room.maxNumberOfChildren ||
                (guests.adults + guests.children) > room.maxOccupancy
            ) return null;
        }

        let baseAmount = 0;
        let sortedBaseAmounts: IRoomChargeBaseByGuest[] = [];

        for (const roomConfig of roomsArray) {
            const result = this.calculateBasePrice(charges[0], {
                adults: roomConfig.adults,
                children: roomConfig.children,
            });
            if (result === null) return null;
            baseAmount += result.baseAmount * numberOfNights;
            sortedBaseAmounts = result.sortedBaseAmounts;
        }

        // const { totalGeoDiscount } = this.calculateGeoDiscount(baseAmount, geoRatePlan);

        const commissionAmount = await this.calculateCommission(
            baseAmount,
            agencyCommission,
            property.id,
            property.propertyConfigs
        );

        const totalAmount = baseAmount + commissionAmount;

        const touristTax = this.calculateTouristTax(touristTaxData, baseAmount);

        // ✅ Calculate available addons
        const addonCalc = new AgenticAddonCalculator(
            ratePlanAddons,
            dates,
            numberOfNights,
            guests.rooms,
            roomsArray,
            this.agenticRoomRepository
        );
        const availableAddons = await addonCalc.calculate();

        const sharedFields = {
            ratePlanName: ratePlan.ratePlanName,
            ratePlanCode: ratePlan.ratePlanCode,
            currencyCode: charges[0].currencyCode,
            baseByGuestAmts: sortedBaseAmounts.map(b => ({
                numberOfGuests: b.numberOfGuests,
                amountBeforeTax: Number(b.amountBeforeTax),
                ageQualifyingCode: b.ageQualifyingCode ?? '10',
            })),
            policy: {
                depositPolicy: ratePlan.depositPolicy,
                cancellationPolicy: ratePlan.cancellationPolicy,
                guaranteePolicy: ratePlan.guaranteePolicy,
            },
            availablePromotions: [],
            appliedDiscounts: [],
            touristTax,
        };

        const combos: IRoomPrice[] = [];

        // ✅ Room Only combo
        combos.push({
            ...sharedFields,
            comboLabel: 'Room Only',
            addons: [],
            totalAmount,
        });

        // ✅ One combo per addon — commission already baked into totalAmount
        for (const addon of availableAddons) {
            combos.push({
                ...sharedFields,
                comboLabel: addon.name,
                addons: [addon],
                totalAmount: totalAmount + addon.price,
            });
        }

        return combos.sort((a, b) => a.totalAmount - b.totalAmount);
    }

    // ─── Commission ────────────────────────────────────────────────────

    private async calculateCommission(
        baseAmount: number,
        commission: IAgencyCommission,
        propertyId: string,
        propertyConfigs: IPropertyConfigs | null
    ): Promise<number> {
        if (commission.commissionType === 'percentage') {
            return baseAmount * (commission.commissionValue / 100);
        }

        if (commission.commissionType === 'fixed') {
            const propertyCurrency = (propertyConfigs?.baseCurrency ?? 'USD') as CurrencyCode;
            const commissionCurrency = commission.commissionCurrency as CurrencyCode | null;

            if (!commissionCurrency || commissionCurrency === propertyCurrency) {
                return commission.commissionValue;
            }

            const converter = await getCurrencyConverter(propertyId, commissionCurrency);
            return converter.convert(commission.commissionValue);
        }

        return 0;
    }

    // ─── Charge Validation ─────────────────────────────────────────────

    private validateCharges(charges: IRoomCharge[], dates: Date[]): boolean {
        if (charges.length !== dates.length) return false;

        for (const charge of charges) {
            if (charge.isSaleStopped) return false;
            const dow = new Date(charge.date).getDay();
            const dowFields: Record<number, keyof IRoomCharge> = {
                0: 'sunApplicable', 1: 'monApplicable', 2: 'tueApplicable',
                3: 'wedApplicable', 4: 'thuApplicable', 5: 'friApplicable', 6: 'satApplicable',
            };
            if (!charge[dowFields[dow]]) return false;
        }

        if (charges[0]?.isClosedToArrival) return false;
        if (charges[charges.length - 1]?.isClosedToDeparture) return false;

        return true;
    }

    // ─── Restriction Validation ────────────────────────────────────────

    private validateRestrictions(
        bookingOffset: IRoomBookingOffset | null,
        ratePlanRule: IRoomRatePlanRule | null,
        checkInDate: Date,
        today: Date,
        numberOfNights: number,
        startDate: string,
        endDate: string
    ): boolean {
        if (bookingOffset) {
            const hoursUntilCheckIn = DateTime.fromJSDate(toUTCDate(checkInDate))
                .diff(DateTime.fromJSDate(toUTCDate(today)), 'hours').hours;

            if (
                bookingOffset.minimumAdvanceBookingOffset != null &&
                hoursUntilCheckIn < bookingOffset.minimumAdvanceBookingOffset
            ) return false;

            if (
                bookingOffset.maximumAdvanceBookingOffset != null &&
                hoursUntilCheckIn > bookingOffset.maximumAdvanceBookingOffset
            ) return false;
        }

        if (ratePlanRule?.isActive) {
            const withinPeriod = this.isDateRangeWithinPeriod(
                startDate, endDate, ratePlanRule.startDate, ratePlanRule.endDate
            );
            if (withinPeriod) {
                if (ratePlanRule.minLos && numberOfNights < ratePlanRule.minLos) return false;
                if (ratePlanRule.maxLos && numberOfNights > ratePlanRule.maxLos) return false;
            }
        }

        return true;
    }

    // ─── Base Price ────────────────────────────────────────────────────

    private calculateBasePrice(
        charge: IRoomCharge,
        guests: { adults: number; children: number }
    ): { baseAmount: number; sortedBaseAmounts: IRoomChargeBaseByGuest[] } | null {
        const adultBaseAmounts = charge.baseGuestAmounts
            .filter((b: IRoomChargeBaseByGuest) => b.ageQualifyingCode === '10')
            .sort((a, b) => a.numberOfGuests - b.numberOfGuests);

        const childBaseAmounts = charge.baseGuestAmounts
            .filter((b: IRoomChargeBaseByGuest) => b.ageQualifyingCode === '8')
            .sort((a, b) => a.numberOfGuests - b.numberOfGuests);

        const additionalAdultCharge = charge.additionalGuestAmounts
            .find((a: IRoomChargeAdditionalGuest) => a.ageQualifyingCode === '10');

        const additionalChildCharge = charge.additionalGuestAmounts
            .find((a: IRoomChargeAdditionalGuest) => a.ageQualifyingCode === '8');

        const adultResult = this.calculateGuestTypePrice(
            guests.adults, adultBaseAmounts, additionalAdultCharge
        );
        if (adultResult === null) return null;

        const childResult = guests.children > 0
            ? this.calculateGuestTypePrice(guests.children, childBaseAmounts, additionalChildCharge)
            : { basePrice: 0, additionalCharges: 0 };
        if (childResult === null) return null;

        const baseAmount =
            adultResult.basePrice + childResult.basePrice +
            adultResult.additionalCharges + childResult.additionalCharges;

        const sortedBaseAmounts = [...charge.baseGuestAmounts]
            .sort((a, b) => a.numberOfGuests - b.numberOfGuests);

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

    // private calculateGeoDiscount(
    //     baseAmount: number,
    //     geoRatePlan: IRoomGeoRatePlan | null
    // ): { totalGeoDiscount: number } {
    //     if (!geoRatePlan || geoRatePlan.restrictionType === 'restricted') {
    //         return { totalGeoDiscount: 0 };
    //     }

    //     const restrictionValue = Number(geoRatePlan.restrictionValue ?? 0);
    //     let geoDiscount = 0;

    //     if (geoRatePlan.restrictionType === 'percentage') {
    //         const delta = baseAmount * (restrictionValue / 100);
    //         geoDiscount = geoRatePlan.restrictionTypeAction === 'increase' ? -delta : delta;
    //     } else if (geoRatePlan.restrictionType === 'fixed') {
    //         geoDiscount = geoRatePlan.restrictionTypeAction === 'increase'
    //             ? -restrictionValue
    //             : restrictionValue;
    //     }

    //     return { totalGeoDiscount: geoDiscount };
    // }

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
            name: touristTaxData.name ?? '',
            discountType: touristTaxData.discountType as DiscountType,
            discountValue: touristTaxData.discountValue,
            currencyCode: (touristTaxData.currencyCode ?? 'USD') as CurrencyCode,
            calculatedTaxAmount,
        };
    }

    // ─── Utilities ─────────────────────────────────────────────────────

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

// ─── Addon Calculator ──────────────────────────────────────────────────────────

class AgenticAddonCalculator {
    private ratePlanAddons: IRatePlanAddon[];
    private dates: Date[];
    private numberOfNights: number;
    private numberOfRooms: number;
    private roomsArray: { adults: number; children: number; childAges: number[] }[];
    private repository: AgenticRoomRepository;

    constructor(
        ratePlanAddons: IRatePlanAddon[],
        dates: Date[],
        numberOfNights: number,
        numberOfRooms: number,
        roomsArray: { adults: number; children: number; childAges: number[] }[],
        repository: AgenticRoomRepository
    ) {
        this.ratePlanAddons = ratePlanAddons;
        this.dates = dates;
        this.numberOfNights = numberOfNights;
        this.numberOfRooms = numberOfRooms;
        this.roomsArray = roomsArray;
        this.repository = repository;
    }

    async calculate(): Promise<IAddonDetail[]> {
        if (this.ratePlanAddons.length === 0) return [];

        const availabilityResults = await Promise.all(
            this.ratePlanAddons.map(rpa =>
                this.repository.getAddonAvailability(rpa.addonId, this.dates)
            )
        );

        const availableAddons: IAddonDetail[] = [];

        for (let i = 0; i < this.ratePlanAddons.length; i++) {
            const availability = availabilityResults[i];
            // ✅ Skip if not available for all dates in the stay
            if (availability.length !== this.dates.length) continue;

            const addon: IAddonWithRelations = this.ratePlanAddons[i].addon;
            const price = this.calculateAddonPrice(addon, availability);

            availableAddons.push({
                id: addon.id,
                name: addon.name,
                code: addon.code,
                price,
                postingRhythm: addon.postingRhythm,
                description: addon.description,
                images: addon.images ?? [],
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

        return availableAddons;
    }

    private calculateAddonPrice(
        addon: IAddonWithRelations,
        availabilities: IAddonAvailability[]
    ): number {
        const singleDatePrice = Number(availabilities[0].price);
        const childAddons: IChildAddon[] = addon.ChildAddons ?? [];

        const getChildPrice = (age: number): number => {
            const match = childAddons.find(c => age >= c.minAge && age <= c.maxAge);
            if (!match) return singleDatePrice;
            if (!match.discountApplicable || !match.discountType || !match.discountAmount) return 0;
            if (match.discountType === 'percentage') {
                return singleDatePrice * (1 - match.discountAmount / 100);
            }
            return Math.max(0, singleDatePrice - match.discountAmount);
        };

        const getRoomGuestPrice = (room: { adults: number; childAges: number[] }): number => {
            return (singleDatePrice * room.adults) +
                room.childAges.reduce((sum, age) => sum + getChildPrice(age), 0);
        };

        switch (addon.postingRhythm) {
            case 'per_stay':
                return singleDatePrice;
            case 'per_night':
                return singleDatePrice * this.numberOfNights;
            case 'per_room':
                return singleDatePrice * this.numberOfRooms;
            case 'per_room_per_night':
                return singleDatePrice * this.numberOfRooms * this.numberOfNights;
            case 'per_person_per_stay':
                return this.roomsArray.reduce((sum, room) => sum + getRoomGuestPrice(room), 0);
            case 'per_person_per_night':
                return this.roomsArray.reduce((sum, room) => sum + getRoomGuestPrice(room), 0) * this.numberOfNights;
            case 'per_person_per_room':
                return this.roomsArray.reduce(
                    (sum, room) => sum + getRoomGuestPrice(room) * this.numberOfRooms, 0
                );
            default:
                return 0;
        }
    }
}