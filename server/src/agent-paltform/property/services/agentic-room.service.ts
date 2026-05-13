import { DateTime } from 'luxon';
import {
    successResponse,
    errorResponse,
    IApiResponse,
    calculateNights,
    toUTCDate,
} from '../../../utils';
import {
    AgenticRoomRepository,
    AgenticRatePlanRepository,
    AgenticPropertyRepository,
} from '../repository';
import {
    // property
    IProperty,
    IPropertyConfigs,
    // room
    IRoom,
    IRooms,
    IRoomAmenity,
    IRoomVideo,
    // charges — using YOUR names
    ICharges,
    IBaseByGuest,
    IChargeAdditionalGuest,
    // rate plan — using YOUR names
    IRatePlan,
    IPolicy,
    // booking types — new file
    IAgentSearchPayload,
    IAgencyCommission,
    IAgencyRaw,
    IAgenticPropertyRaw,
    IRoomConfig,
    IGuestPayload,
    IRoomBookingOffset,
    IRoomRatePlanRule,
    IRoomTouristTaxData,
    ITouristTax,
    IAppliedCommission,
    IRatePlanAddon,
    IAddonWithRelations,
    IAddonAvailability,
    IAddonDetail,
    IChildAddon,
    IRoomPrice,
    IBookingRoom,
    IBasePriceResult,
    IGuestPriceResult,
    CommissionType,
    DiscountType,
} from '../types';
import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';
import { getCurrencyConverter } from '../../../currency-maping/utils';

// ─── Service ──────────────────────────────────────────────────────────────────

export class AgenticRoomService {
    private readonly agenticRoomRepository: AgenticRoomRepository;
    private readonly agenticRatePlanRepository: AgenticRatePlanRepository;
    private readonly agenticPropertyRepository: AgenticPropertyRepository;

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
        guests: IGuestPayload,
        countryCode: string
    ): Promise<IApiResponse> {
        try {
            const [agenticProperty, agency] = await Promise.all([
                this.agenticPropertyRepository.getAgenticPropertyById(
                    agencyId,
                    propertyId
                ),
                this.agenticPropertyRepository.getAgencyById(agencyId),
            ]);

            if (!agenticProperty) {
                return errorResponse(
                    'Agentic Property not found',
                    'Property does not exist or deleted'
                );
            }
            if (!agency) {
                return errorResponse(
                    'Agency not found',
                    'Agency does not exist or deleted'
                );
            }

            const raw = (agenticProperty as IAgenticPropertyRaw).Property;

            // ── B2B guard ─────────────────────────────────────────────────────
            if (!raw.propertyConfigs?.isB2bAvailable) {
                return errorResponse(
                    'Property not available',
                    'This property is not enabled for B2B bookings'
                );
            }

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

            const agencyRaw = agency as IAgencyRaw;
            const agencyCommission: IAgencyCommission = {
                commissionType: agencyRaw.commissionType as CommissionType,
                commissionValue: agencyRaw.commissionValue,
                commissionCurrency: agencyRaw.commissionCurrency ?? null,
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
                current = toUTCDate(
                    new Date(new Date(current).setDate(current.getDate() + 1))
                );
            }

            const numberOfNights = calculateNights(startDate, endDate);
            const roomsArray: IRoomConfig[] = guests.roomsArray ?? [];

            const roomResults = await Promise.all(
                (roomDetails as IRooms[]).map((agenticRoom: IRooms) =>
                    this.processRoom(
                        agenticRoom,
                        property,
                        ratePlans as IRatePlan[],
                        dates,
                        numberOfNights,
                        guests,
                        roomsArray,
                        startDate,
                        endDate,
                        agencyCommission
                    )
                )
            );

            const rooms: IBookingRoom[] = roomResults.filter(
                (r): r is IBookingRoom => r !== null
            );

            return successResponse('Rooms fetched successfully', {
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
                return errorResponse(
                    'Failed to retrieve room details',
                    error.message
                );
            }
            return errorResponse('Failed to retrieve room details');
        }
    }

    // ─── Room Processing ──────────────────────────────────────────────────────

    private async processRoom(
        agenticRoom: IRooms,
        property: IProperty,
        ratePlans: IRatePlan[],
        dates: Date[],
        numberOfNights: number,
        guests: IGuestPayload,
        roomsArray: IRoomConfig[],
        startDate: string,
        endDate: string,
        agencyCommission: IAgencyCommission
    ): Promise<IBookingRoom | null> {
        const room: IRoom = agenticRoom.room;

        const inventory =
            await this.agenticRoomRepository.getInventoryByProperty(
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
                    agencyCommission
                )
            )
        );

        const roomPrice: IRoomPrice[] = ratePlanResults
            .filter((r): r is IRoomPrice[] => r !== null)
            .flat();

        // Use YOUR IRoomAmenity shape (no id/amenityType/isActive)
        const amenities: IRoomAmenity[] = room.roomAmenities.map(
            (r: IRoomAmenity) => ({
                amenity: {
                    amenityName: r.amenity.amenityName,
                    description: r.amenity.description,
                    icon: r.amenity.icon,
                },
            })
        );

        // Use YOUR IRoomVideo shape (no id field)
        const roomVideos: IRoomVideo | null = room.roomVideos
            ? {
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

    // ─── Rate Plan Processing ─────────────────────────────────────────────────

    private async processRatePlan(
        ratePlan: IRatePlan,
        room: IRoom,
        property: IProperty,
        dates: Date[],
        numberOfNights: number,
        guests: IGuestPayload,
        roomsArray: IRoomConfig[],
        startDate: string,
        endDate: string,
        agencyCommission: IAgencyCommission
    ): Promise<IRoomPrice[] | null> {
        const today = new Date();
        const checkInDate = dates[0];

        const [
            charges,
            ratePlanRule,
            touristTaxData,
            bookingOffset,
            ratePlanAddons,
        ] = await Promise.all([
            this.agenticRoomRepository.getCharges(
                property.propertyCode,
                room.roomType,
                ratePlan.ratePlanCode,
                dates
            ) as Promise<ICharges[]>,
            this.agenticRoomRepository.getRatePlanRule(
                ratePlan.id
            ) as Promise<IRoomRatePlanRule | null>,
            this.agenticRoomRepository.getTouristTax(
                room.id
            ) as Promise<IRoomTouristTaxData | null>,
            this.agenticRoomRepository.getBookingOffset(
                ratePlan.id,
                toUTCDate(checkInDate)
            ) as Promise<IRoomBookingOffset | null>,
            this.agenticRoomRepository.getRatePlanAddons(
                ratePlan.id
            ) as Promise<IRatePlanAddon[]>,
        ]);

        // ── Charge validation: stop-sell, CTA, CTD, day-of-week ──────────────
        if (!this.validateCharges(charges, dates)) return null;

        // ── Booking offset + mLOS/maxLOS ──────────────────────────────────────
        if (
            !this.validateRestrictions(
                bookingOffset,
                ratePlanRule,
                checkInDate,
                today,
                numberOfNights,
                startDate,
                endDate
            )
        )
            return null;

        // ── Occupancy guard ───────────────────────────────────────────────────
        if (!this.validateOccupancy(room, guests, roomsArray)) return null;

        // ── Base price ────────────────────────────────────────────────────────
        let baseAmount = 0;
        let sortedBaseAmounts: IBaseByGuest[] = [];

        const effectiveRoomsArray =
            roomsArray.length > 0
                ? roomsArray
                : [
                    {
                        adults: guests.adults,
                        children: guests.children,
                        childAges: [],
                    },
                ];

        for (const roomConfig of effectiveRoomsArray) {
            const result = this.calculateBasePrice(charges[0], roomConfig);
            if (result === null) return null;
            baseAmount += result.baseAmount * numberOfNights;
            sortedBaseAmounts = result.sortedBaseAmounts;
        }

        // ── Commission ────────────────────────────────────────────────────────
        const { calculatedCommissionAmount, appliedCommission } =
            await this.calculateCommission(
                baseAmount,
                agencyCommission,
                property.id,
                property.propertyConfigs
            );

        const totalRoomAmount = baseAmount + calculatedCommissionAmount;

        // ── Tourist tax (informational — paid at hotel) ───────────────────────
        const touristTax = this.calculateTouristTax(
            touristTaxData,
            baseAmount,
            numberOfNights,
            effectiveRoomsArray.length,
            room.numberOfBedrooms
        );

        // ── Addons ────────────────────────────────────────────────────────────
        const addonCalc = new AgenticAddonCalculator(
            ratePlanAddons,
            dates,
            numberOfNights,
            guests.rooms,
            roomsArray,
            this.agenticRoomRepository
        );
        const availableAddons = await addonCalc.calculate();

        // ── Build combos ──────────────────────────────────────────────────────
        const sharedFields = {
            ratePlanName: ratePlan.ratePlanName,
            ratePlanCode: ratePlan.ratePlanCode,
            currencyCode: charges[0].currencyCode,
            baseByGuestAmts: sortedBaseAmounts.map((b: IBaseByGuest) => ({
                numberOfGuests: b.numberOfGuests,
                amountBeforeTax: Number(b.amountBeforeTax),
                ageQualifyingCode: b.ageQualifyingCode ?? '10',
            })),
            policy: {
                depositPolicy: ratePlan.depositPolicy,
                cancellationPolicy: ratePlan.cancellationPolicy,
                guaranteePolicy: ratePlan.guaranteePolicy,
            },
            baseAmount,
            appliedCommission,
            touristTax,
        };

        const combos: IRoomPrice[] = [];

        // Room Only
        combos.push({
            ...sharedFields,
            comboLabel: 'Room Only',
            addons: [],
            totalAmount: Number(totalRoomAmount.toFixed(2)),
        });

        // Room + addon combos
        for (const addon of availableAddons) {
            combos.push({
                ...sharedFields,
                comboLabel: addon.name,
                addons: [addon],
                totalAmount: Number((totalRoomAmount + addon.price).toFixed(2)),
            });
        }

        return combos.sort((a, b) => a.totalAmount - b.totalAmount);
    }

    // ─── Charge Validation ────────────────────────────────────────────────────

    private validateCharges(charges: ICharges[], dates: Date[]): boolean {
        if (charges.length !== dates.length) return false;

        const dowFields: Record<number, keyof ICharges> = {
            0: 'sunApplicable',
            1: 'monApplicable',
            2: 'tueApplicable',
            3: 'wedApplicable',
            4: 'thuApplicable',
            5: 'friApplicable',
            6: 'satApplicable',
        };

        for (const charge of charges) {
            if (charge.isSaleStopped) return false;
            const dow = new Date(charge.date).getDay();
            if (!charge[dowFields[dow]]) return false;
        }

        if (charges[0]?.isClosedToArrival) return false;
        if (charges[charges.length - 1]?.isClosedToDeparture) return false;

        return true;
    }

    // ─── Restriction Validation ───────────────────────────────────────────────

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
            const hoursUntilCheckIn = DateTime.fromJSDate(
                toUTCDate(checkInDate)
            ).diff(DateTime.fromJSDate(toUTCDate(today)), 'hours').hours;

            if (
                bookingOffset.minimumAdvanceBookingOffset !== null &&
                hoursUntilCheckIn < bookingOffset.minimumAdvanceBookingOffset
            )
                return false;

            if (
                bookingOffset.maximumAdvanceBookingOffset !== null &&
                hoursUntilCheckIn > bookingOffset.maximumAdvanceBookingOffset
            )
                return false;
        }

        if (ratePlanRule?.isActive) {
            const withinPeriod = this.isDateRangeWithinPeriod(
                startDate,
                endDate,
                ratePlanRule.startDate,
                ratePlanRule.endDate
            );
            if (withinPeriod) {
                if (
                    ratePlanRule.minLos !== null &&
                    numberOfNights < ratePlanRule.minLos
                )
                    return false;
                if (
                    ratePlanRule.maxLos !== null &&
                    numberOfNights > ratePlanRule.maxLos
                )
                    return false;
            }
        }

        return true;
    }

    // ─── Occupancy Validation ─────────────────────────────────────────────────

    private validateOccupancy(
        room: IRoom,
        guests: IGuestPayload,
        roomsArray: IRoomConfig[]
    ): boolean {
        const gap = Math.max(
            0,
            room.maxOccupancy -
            room.maxNumberOfAdults -
            room.maxNumberOfChildren
        );

        if (roomsArray.length > 0) {
            return !roomsArray.some((r: IRoomConfig) => {
                if (r.adults + r.children > room.maxOccupancy) return true;
                const extraAdults = Math.max(
                    0,
                    r.adults - room.maxNumberOfAdults
                );
                const extraChildren = Math.max(
                    0,
                    r.children - room.maxNumberOfChildren
                );
                return extraAdults + extraChildren > gap;
            });
        }

        if (guests.adults + guests.children > room.maxOccupancy) return false;
        const extraAdults = Math.max(0, guests.adults - room.maxNumberOfAdults);
        const extraChildren = Math.max(
            0,
            guests.children - room.maxNumberOfChildren
        );
        return extraAdults + extraChildren <= gap;
    }

    // ─── Base Price ───────────────────────────────────────────────────────────

    private calculateBasePrice(
        charge: ICharges,
        guests: { adults: number; children: number }
    ): IBasePriceResult | null {
        const adultBaseAmounts = charge.baseGuestAmounts
            .filter((b: IBaseByGuest) => b.ageQualifyingCode === '10')
            .sort(
                (a: IBaseByGuest, b: IBaseByGuest) =>
                    a.numberOfGuests - b.numberOfGuests
            );

        const childBaseAmounts = charge.baseGuestAmounts
            .filter((b: IBaseByGuest) => b.ageQualifyingCode === '8')
            .sort(
                (a: IBaseByGuest, b: IBaseByGuest) =>
                    a.numberOfGuests - b.numberOfGuests
            );

        const additionalAdultCharge = charge.additionalGuestAmounts.find(
            (a: IChargeAdditionalGuest) => a.ageQualifyingCode === '10'
        );

        const additionalChildCharge = charge.additionalGuestAmounts.find(
            (a: IChargeAdditionalGuest) => a.ageQualifyingCode === '8'
        );

        const adultResult = this.calculateGuestTypePrice(
            guests.adults,
            adultBaseAmounts,
            additionalAdultCharge
        );
        if (adultResult === null) return null;

        const childResult: IGuestPriceResult =
            guests.children > 0
                ? (this.calculateGuestTypePrice(
                    guests.children,
                    childBaseAmounts,
                    additionalChildCharge
                ) ?? { basePrice: 0, additionalCharges: 0 })
                : { basePrice: 0, additionalCharges: 0 };

        const baseAmount =
            adultResult.basePrice +
            adultResult.additionalCharges +
            childResult.basePrice +
            childResult.additionalCharges;

        const sortedBaseAmounts = [...charge.baseGuestAmounts].sort(
            (a: IBaseByGuest, b: IBaseByGuest) =>
                a.numberOfGuests - b.numberOfGuests
        );

        return { baseAmount, sortedBaseAmounts };
    }

    private calculateGuestTypePrice(
        guestCount: number,
        baseAmounts: IBaseByGuest[],
        additionalCharge: IChargeAdditionalGuest | undefined
    ): IGuestPriceResult | null {
        const exactBase = baseAmounts.find(
            (b: IBaseByGuest) => b.numberOfGuests === guestCount
        );
        if (exactBase) {
            return {
                basePrice: Number(exactBase.amountBeforeTax),
                additionalCharges: 0,
            };
        }

        if (baseAmounts.length > 0) {
            const maxBase = baseAmounts[baseAmounts.length - 1];
            const basePrice = Number(maxBase.amountBeforeTax);
            const extraGuests = guestCount - maxBase.numberOfGuests;
            if (extraGuests > 0) {
                if (!additionalCharge) return null;
                return {
                    basePrice,
                    additionalCharges:
                        extraGuests * Number(additionalCharge.amount),
                };
            }
            return { basePrice, additionalCharges: 0 };
        }

        if (additionalCharge) {
            return {
                basePrice: 0,
                additionalCharges: guestCount * Number(additionalCharge.amount),
            };
        }

        return null;
    }

    // ─── Commission ───────────────────────────────────────────────────────────

    private async calculateCommission(
        baseAmount: number,
        commission: IAgencyCommission,
        propertyId: string,
        propertyConfigs: IPropertyConfigs | null
    ): Promise<{
        calculatedCommissionAmount: number;
        appliedCommission: IAppliedCommission;
    }> {
        let calculatedCommissionAmount = 0;

        if (commission.commissionType === 'percentage') {
            calculatedCommissionAmount = Number(
                (baseAmount * (commission.commissionValue / 100)).toFixed(2)
            );
        } else if (commission.commissionType === 'fixed') {
            const propertyCurrency = (propertyConfigs?.baseCurrency ??
                'USD') as CurrencyCode;
            const commissionCurrency =
                commission.commissionCurrency as CurrencyCode | null;

            if (
                !commissionCurrency ||
                commissionCurrency === propertyCurrency
            ) {
                calculatedCommissionAmount = Number(
                    commission.commissionValue.toFixed(2)
                );
            } else {
                const converter = await getCurrencyConverter(
                    propertyId,
                    commissionCurrency
                );
                calculatedCommissionAmount = Number(
                    converter.convert(commission.commissionValue).toFixed(2)
                );
            }
        }

        const appliedCommission: IAppliedCommission = {
            commissionType: commission.commissionType,
            commissionValue: commission.commissionValue,
            commissionCurrency: commission.commissionCurrency,
            calculatedCommissionAmount,
        };

        return { calculatedCommissionAmount, appliedCommission };
    }

    private calculateTouristTax(
        touristTaxData: IRoomTouristTaxData | null,
        baseAmount: number,
        numberOfNights: number,
        numberOfRooms: number,
        numberOfBedrooms: number
    ): ITouristTax | null {
        if (!touristTaxData) return null;
        // console.log(
        //     'data',
        //     touristTaxData,
        //     baseAmount,
        //     numberOfNights,
        //     numberOfRooms,
        // numberOfBedrooms
        // );
        const calculatedTaxAmount =
            touristTaxData.discountType === 'percentage'
                ? Number(
                    (
                        baseAmount *
                        (Number(touristTaxData.discountValue) / 100)
                    ).toFixed(2)
                )
                : Number(
                    (
                        Number(touristTaxData.discountValue) *
                        numberOfNights *
                        numberOfRooms *
                        numberOfBedrooms
                    ).toFixed(2)
                );

        return {
            id: touristTaxData.id,
            name: touristTaxData.name ?? '',
            discountType: touristTaxData.discountType as DiscountType,
            discountValue: touristTaxData.discountValue,
            currencyCode: (touristTaxData.currencyCode ??
                'USD') as CurrencyCode,
            calculatedTaxAmount,
        };
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

// ─── Addon Calculator ─────────────────────────────────────────────────────────

class AgenticAddonCalculator {
    private readonly ratePlanAddons: IRatePlanAddon[];
    private readonly dates: Date[];
    private readonly numberOfNights: number;
    private readonly numberOfRooms: number;
    private readonly roomsArray: IRoomConfig[];
    private readonly repository: AgenticRoomRepository;

    constructor(
        ratePlanAddons: IRatePlanAddon[],
        dates: Date[],
        numberOfNights: number,
        numberOfRooms: number,
        roomsArray: IRoomConfig[],
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
            this.ratePlanAddons.map((rpa: IRatePlanAddon) =>
                this.repository.getAddonAvailability(rpa.addonId, this.dates)
            )
        );

        const availableAddons: IAddonDetail[] = [];

        for (let i = 0; i < this.ratePlanAddons.length; i++) {
            const availability = availabilityResults[i] as IAddonAvailability[];
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

        return availableAddons;
    }

    private calculateAddonPrice(
        addon: IAddonWithRelations,
        availabilities: IAddonAvailability[]
    ): number {
        const singleDatePrice = Number(availabilities[0].price);
        const childAddons: IChildAddon[] = addon.ChildAddons ?? [];

        const getChildPrice = (age: number): number => {
            const match = childAddons.find(
                (c: IChildAddon) => age >= c.minAge && age <= c.maxAge
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

        const getRoomGuestPrice = (room: IRoomConfig): number =>
            singleDatePrice * room.adults +
            room.childAges.reduce(
                (sum: number, age: number) => sum + getChildPrice(age),
                0
            );

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
                    (sum: number, room: IRoomConfig) =>
                        sum + getRoomGuestPrice(room),
                    0
                );
            case 'per_person_per_night':
                return (
                    this.roomsArray.reduce(
                        (sum: number, room: IRoomConfig) =>
                            sum + getRoomGuestPrice(room),
                        0
                    ) * this.numberOfNights
                );
            case 'per_person_per_room':
                return this.roomsArray.reduce(
                    (sum: number, room: IRoomConfig) =>
                        sum + getRoomGuestPrice(room) * this.numberOfRooms,
                    0
                );
            default:
                return 0;
        }
    }
}
