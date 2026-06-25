import { IMLOS } from '../../promotions/mlos/interfaces';
import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';
import {
    errorResponse,
    IApiResponse,
    nowUTC,
    successResponse,
    toUTC,
} from '../../utils';
import {
    IPropertyLoyaltyConfig,
    ILoyaltyDiscountData,
} from '../../loyalty/types';
import { PricingRepository } from '../repository';
import {
    AddOnBrakeDown,
    CustomDlApllied,
    DailyPriceBrakeDown,
    IAddOn,
    ICharge,
    ICustomizableDeal,
    IGuestDistribution,
    IIncludedAddons,
    IRatePlanWithAddon,
    IRoomDetails,
    ISelectedAddonsR,
    ISelectedAddonsS,
    ISelectedPromotion,
    ITaxGroup,
    ITouristTax,
    PriceBrakeDown,
    PromotionBrakeDown,
    TaxBrakeDown,
} from '../types';
import { DeviceType } from '../../agent-paltform/property/types';
import { IGeoRatePlanWithoutRatePlan } from '../../promotions/geo-rate-plan/interfaces';
import { ICEbDsOftc } from '../../promotions/eb-ds-oftc/interfaces';
import { IPromoCode } from '../../ari/types/promoCode.type';
import { RoomDao } from '../../property-management/repository';
import { IRoom } from '../../property-management/types';
export class PricingService {
    private pricingRepository: PricingRepository;
    private roomRepo: RoomDao;
    constructor() {
        this.pricingRepository = new PricingRepository();
        this.roomRepo = new RoomDao();
    }
    public async getRoomRentService(
        propertyId: string,
        invTypeCode: string,
        startDate: Date | string,
        endDate: Date | string,
        ratePlanCode: string,
        rooms: number,
        adults: number,
        guestDistribution: IGuestDistribution[],
        includedAddons: string[],
        children?: number,
        childAges?: number[],
        userCountryCode?: string,
        detectedDeviceType?: string,
        promotions?: ISelectedPromotion[],
        parsedAddons?: ISelectedAddonsS[],
        promoCode?: string,
        loyalityEmail?: string,
        customizableDealParams?: CustomDlApllied
    ): Promise<IApiResponse<PriceBrakeDown>> {
        try {
            const parsedStartDate: Date =
                startDate instanceof Date ? startDate : new Date(startDate);
            const parsedEndDate: Date =
                endDate instanceof Date ? endDate : new Date(endDate);
            startDate = parsedStartDate;
            endDate = parsedEndDate;

            // ─── Phase 1: fetch ratePlan + room + addons + user promotions ───
            const [ratePlan, selectedAddons, appliedPromotions, selectedRoom,includedAddonsRes,customizableDeal] =
                await Promise.all([
                    this.pricingRepository.validateRatePlan(
                        ratePlanCode,
                        invTypeCode,
                        toUTC(startDate),
                        toUTC(endDate),
                    ),
                    this.fetchAddons(parsedAddons),
                    this.fetchAllPromotions(promotions),
                    this.roomRepo.findByRoomType(propertyId, invTypeCode),
                    this.pricingRepository.getIncludedAddons(includedAddons, toUTC(startDate), toUTC(endDate)),
                    this.fetchCustomizableDeals(customizableDealParams)
                ]);

            if (!ratePlan) {
                return errorResponse('Rate plan not found');
            }
            if (!selectedRoom) {
                return errorResponse(
                    'Room not found for the selected room type'
                );
            }

            const [
                autoAppliedMLOS,
                autoAppliedPromotions,
                promoCodeData,
                loyaltyDiscountData,
            ] = await Promise.all([
                this.pricingRepository.fetchAutoAppliedMLOS(
                    ratePlan.id,
                    toUTC(startDate),
                    toUTC(endDate)
                ),
                this.pricingRepository.getAutoAppliedPromotions(
                    ratePlan.id,
                    toUTC(startDate),
                    toUTC(endDate)
                ),
                promoCode
                    ? this.pricingRepository.findPromoCode(promoCode)
                    : Promise.resolve(null),
                loyalityEmail
                    ? this.pricingRepository.findLoyaltyDiscountData(
                        loyalityEmail,
                        propertyId
                    )
                    : Promise.resolve(null),
            ]);
            const basePrice = new BasePriceClass(
                startDate,
                endDate,
                adults,
                children ? children : 0,
                rooms,
                ratePlan.charges,
                ratePlan.taxGroup,
                guestDistribution,
                selectedRoom
            );
            let priceBrakedowns = basePrice.calculateTotalPrice();

            const addOnPrice = new AddOnPriceClass(
                selectedAddons,
                includedAddonsRes,
                priceBrakedowns,
                rooms,
                Math.ceil(
                    (endDate.getTime() - startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                ),
                adults,
                startDate,
                endDate,
                childAges,
                parsedAddons
            );
            priceBrakedowns = addOnPrice.addonBrakeDowns();

            const promotionClass = new PromotionClass(
                startDate,
                endDate,
                appliedPromotions.mlos || [],
                appliedPromotions.promotions || [],
                ratePlan.geoRatePlans,
                ratePlan.id,
                priceBrakedowns.amountBeforeTax,
                invTypeCode,
                (detectedDeviceType as DeviceType) || null,
                priceBrakedowns,
                autoAppliedMLOS,
                autoAppliedPromotions
            );
            priceBrakedowns = promotionClass.promotionPrices(userCountryCode);

            if (detectedDeviceType && promoCode) {
                const deviceDiscountClass = new PromoCodeDiscountClass(
                    priceBrakedowns,
                    promoCode,
                    selectedRoom.id,
                    ratePlan.id,
                    detectedDeviceType as DeviceType,
                    promoCodeData
                );
                priceBrakedowns = deviceDiscountClass.findPromoCodeDiscount();
            }

            if (loyalityEmail && loyaltyDiscountData) {
                const loyalityDiscountClass = new LoyalityDiscountClass(
                    priceBrakedowns,
                    loyaltyDiscountData
                );
                priceBrakedowns = loyalityDiscountClass.findLoyalityDiscount();
            }

            if (customizableDeal) {
                const customizableDealClass = new CustomizableDealClass(
                    priceBrakedowns,
                    customizableDeal
                );
                priceBrakedowns =
                    customizableDealClass.applyCustomizableDealDiscount();
            }

            priceBrakedowns = {
                ...priceBrakedowns,
                amountBeforeTax: priceBrakedowns.currentChargeableAmount,
                
            };

            const diffInDays = this.differenceReservationDays(
                startDate,
                endDate
            );
            const touristTaxClass = new TouristTaxClass(
                (selectedRoom as any).TouristTaxs || [],
                selectedRoom,
                rooms,
                priceBrakedowns,
                diffInDays
            );
            priceBrakedowns = touristTaxClass.findTouristTax();

            const taxClass = new TaxClass(ratePlan.taxGroup, priceBrakedowns);
            priceBrakedowns = taxClass.applyTax();

            return successResponse('Rate plan found', priceBrakedowns);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to calculate Room Price',
                    error?.message
                );
            }
            return errorResponse('Failed to calculate Room Price');
        }
    }
    private differenceReservationDays(startDate: Date, endDate: Date): number {
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffInMs = endDate.getTime() - startDate.getTime();
        return Math.ceil(diffInMs / msPerDay);
    }
    private async fetchAddons(parsedAddons?: ISelectedAddonsS[]) {
        try {
            if (!parsedAddons) {
                return [];
            }
            const parsedAddonsR: ISelectedAddonsR[] = parsedAddons.map(
                addon => {
                    return {
                        addOnId: addon.addOnId,
                        dates: addon.availability.map(
                            availability => availability.date
                        ),
                    };
                }
            );
            const addons =
                await this.pricingRepository.getAddons(parsedAddonsR);
            return addons;
        } catch (error) {
            throw new Error('Failed to fetch addons');
        }
    }
    private async fetchAllPromotions(
        userAppliedPromotions?: ISelectedPromotion[]
    ) {
        try {
            if (!userAppliedPromotions) {
                return { mlos: null, promotions: null };
            }
            const mlosId = userAppliedPromotions
                .filter(promotion => promotion.promotionType === 'mlos')
                .map(promotion => promotion.id);
            const promotionIds: string[] = userAppliedPromotions
                .filter(promotion => promotion.promotionType === 'normal')
                .map(promotion => promotion.id);
            const [mlos, promotions] = await Promise.all([
                this.fetchMLOS(mlosId),
                this.fetchPromotions(promotionIds),
            ]);
            return { mlos, promotions };
        } catch (error) {
            throw new Error(
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch promotions'
            );
        }
    }
    private async fetchMLOS(mlosId: string[]): Promise<IMLOS[] | null> {
        try {
            const mlos = await this.pricingRepository.getMlos(mlosId);
            return mlos;
        } catch (error) {
            throw new Error('Failed to fetch mlos');
        }
    }
    private async fetchPromotions(
        promotionIds: string[]
    ): Promise<ICEbDsOftc[] | null> {
        try {
            const promotions =
                await this.pricingRepository.getPromotions(promotionIds);
            return promotions;
        } catch (error) {
            throw new Error('Failed to fetch promotions');
        }
    }
    private async fetchCustomizableDeals(
        customizableDeal?: CustomDlApllied
    ): Promise<ICustomizableDeal | null> {
        try {
            if (!customizableDeal || !customizableDeal.isApplied) {
                return null;
            }
            if (!customizableDeal.customizableDealId) {
                throw new Error("Customizable deal is required when the deal is applied");
            }
            const customizableDeals =
                await this.pricingRepository.findCustomizableDeal(customizableDeal.customizableDealId);
            return customizableDeals;
        } catch (error) {
            throw new Error('Failed to fetch customizable deals');
        }
    }
}
class BasePriceClass {
    startDate: Date;
    endDate: Date;
    adults: number;
    children: number;
    rooms: number;
    charges: ICharge[];
    taxGroup: ITaxGroup | null;
    guestDistributions: IGuestDistribution[];
    roomDetails: IRoom;
    constructor(
        startDate: Date,
        endDate: Date,
        adults: number,
        children: number,
        rooms: number,
        charges: ICharge[],
        taxGroup: ITaxGroup | null,
        guestDistributions: IGuestDistribution[],
        roomDetails: IRoom
    ) {
        if (!charges || charges.length == 0) {
            throw new Error('Charges not found');
        }
        if (startDate > endDate) {
            throw new Error('Start date cannot be greater than end date');
        }
        if (adults <= 0) {
            throw new Error('Adults must be greater than 0');
        }
        if (rooms <= 0) {
            throw new Error('Rooms must be greater than 0');
        }
        this.startDate = startDate;
        this.endDate = endDate;
        this.adults = adults;
        this.children = children;
        this.rooms = rooms;
        this.charges = charges;
        this.taxGroup = taxGroup || null;
        this.guestDistributions = guestDistributions;
        this.roomDetails = roomDetails;
    }
    private differenceReservationDays(startDate: Date, endDate: Date): number {
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffInMs = endDate.getTime() - startDate.getTime();
        return Math.ceil(diffInMs / msPerDay);
    }
    public calculateTotalPrice(): PriceBrakeDown {
        const diffInDays = this.differenceReservationDays(
            toUTC(this.startDate),
            toUTC(this.endDate)
        );
        if (diffInDays != this.charges.length) {
            throw new Error('Charges not found for the given date range');
        }

        this.checkCTA();
        this.checkCTD();
        this.checkIsSaleStopped();
        const { totalAmount, dailyPriceBrakeDown } = this.calculateBasePrice();

        // amountBeforeTax = pure base (no tax applied yet)
        const amountBeforeTax = totalAmount;

        return {
            totalAmount,
            amountBeforeTax,
            taxedAmount: 0,
            totalAddonAmount: 0,
            totalPromotionAmount: 0,
            currentChargeableAmount: totalAmount,
            latterpayableAmount: 0,
            loyalityDiscount: 0,
            promoCodeDiscount: 0,
            customizableDealDiscount: 0,
            currencyCode: dailyPriceBrakeDown[0]?.currencyCode,
            dailyPriceBrakeDown,
            taxBrakeDown: [],
            addonBrakeDowns: [],
            promotionBrakeDown: [],
        };
    }
    private checkCTA() {
        const checkInDateCharge = this.charges.find(
            charge => charge.date.getTime() === this.startDate.getTime()
        );
        if (!checkInDateCharge) {
            throw new Error('Check-in date charge not found');
        }
        if (checkInDateCharge.isClosedToArrival) {
            throw new Error('Check-in date is closed for booking');
        }
    }
    private checkCTD() {
        const checkOutDateCharge = this.charges.find(
            charge => charge.date.getTime() === this.endDate.getTime()
        );
        if (!checkOutDateCharge) return;
        if (checkOutDateCharge.isClosedToDeparture) {
            throw new Error('Check-out date is closed for booking');
        }
    }
    private checkIsSaleStopped() {
        const isSaleStopped = this.charges.find(charge => charge.isSaleStopped);
        if (isSaleStopped) {
            throw new Error(
                `Sale is stopped for the given ${isSaleStopped.date.toDateString()} date for ${isSaleStopped.restrictionNotes}`
            );
        }
    }
    private calculateBasePrice(): {
        totalAmount: number;
        dailyPriceBrakeDown: DailyPriceBrakeDown[];
    } {
        let basePrice = 0;
        const dailyPriceBrakeDown: DailyPriceBrakeDown[] = [];

        this.charges.sort((a, b) => a.date.getTime() - b.date.getTime());
        // this.charges.pop();

        this.guestDistributions.forEach((guestDistribution, index) => {
            const { adults, children } = guestDistribution;

            const totalPersons = adults + children;
            const gap =
                this.roomDetails.maxOccupancy -
                this.roomDetails.maxNumberOfAdults +
                this.roomDetails.maxNumberOfChildren;
            if (totalPersons > this.roomDetails.maxOccupancy) {
                throw new Error(
                    `This room has a maximum occupancy of ${this.roomDetails.maxOccupancy}.`
                );
            }
            if (
                adults >
                (gap < 0
                    ? this.roomDetails.maxNumberOfAdults
                    : gap + this.roomDetails.maxNumberOfAdults)
            ) {
                throw new Error(
                    `This room can only accommodate maximum ${gap < 0 ? this.roomDetails.maxNumberOfAdults : gap} adults.`
                );
            }
            if (
                children >
                (gap < 0
                    ? this.roomDetails.maxNumberOfChildren
                    : gap + this.roomDetails.maxNumberOfChildren)
            ) {
                throw new Error(
                    `This room can only accommodate maximum ${gap < 0 ? this.roomDetails.maxNumberOfChildren : gap} children.`
                );
            }
            this.charges.forEach(charge => {
                const adultBaseAmounts = charge.baseGuestAmounts
                    .filter(b => b.ageQualifyingCode === '10')
                    .sort((a, b) => a.numberOfGuests - b.numberOfGuests);

                const childBaseAmounts = charge.baseGuestAmounts
                    .filter(b => b.ageQualifyingCode === '8')
                    .sort((a, b) => a.numberOfGuests - b.numberOfGuests);

                const additionalChargeForAdults =
                    charge.additionalGuestAmounts.find(
                        a => a.ageQualifyingCode === '10'
                    );
                const additionalChargeForChildren =
                    charge.additionalGuestAmounts.find(
                        a => a.ageQualifyingCode === '8'
                    );

                let adultBasePrice = 0;
                let additionalAdultCharges = 0;

                const exactAdultBase = adultBaseAmounts.find(
                    b => b.numberOfGuests === adults
                );
                if (exactAdultBase) {
                    adultBasePrice = Number(exactAdultBase.amountBeforeTax); // Exact match found → use it directly
                } else if (adultBaseAmounts.length > 0) {
                    const maxAdultBase =
                        adultBaseAmounts[adultBaseAmounts.length - 1]; // No exact match → use highest available base + charge for extras
                    adultBasePrice = Number(maxAdultBase.amountBeforeTax);
                    const extraAdults = adults - maxAdultBase.numberOfGuests;
                    if (extraAdults > 0 && additionalChargeForAdults) {
                        additionalAdultCharges =
                            extraAdults *
                            Number(additionalChargeForAdults.amount);
                    } else if (extraAdults > 0 && !additionalAdultCharges) {
                        throw new Error(
                            `No additional charge found for adults`
                        );
                    }
                } else {
                    throw new Error('Base Price not found for adults');
                }

                let childBasePrice = 0;
                let additionalChildCharges = 0;

                if (children > 0) {
                    const exactChildBase = childBaseAmounts.find(
                        b => b.numberOfGuests === children
                    );
                    if (exactChildBase) {
                        childBasePrice = Number(exactChildBase.amountBeforeTax); // Exact match found → use it directly
                    } else if (childBaseAmounts.length > 0) {
                        let maxChildBase =
                            childBaseAmounts[childBaseAmounts.length - 1]; // No exact match → use highest available base + charge for extras

                        childBasePrice = Number(maxChildBase.amountBeforeTax);
                        const extraChildren =
                            children - maxChildBase.numberOfGuests;
                        if (extraChildren > 0 && additionalChargeForChildren) {
                            additionalChildCharges =
                                extraChildren *
                                Number(additionalChargeForChildren.amount);
                        }
                    } else {
                        const extraChilds =
                            children - this.roomDetails.maxNumberOfChildren;
                        if (extraChilds > 0) {
                            additionalChildCharges =
                                extraChilds *
                                Number(additionalChargeForChildren?.amount);
                        }
                    }
                }

                const totalBaseCharges = adultBasePrice + childBasePrice;
                const totalAdditionalCharges =
                    additionalAdultCharges + additionalChildCharges;
                const totalDailyAmount =
                    totalBaseCharges + totalAdditionalCharges;

                basePrice += totalDailyAmount;

                dailyPriceBrakeDown.push({
                    roomNumber: `${index + 1}`,
                    guestDistribution,
                    date: charge.date.toDateString(),
                    baseChargesAmount: totalBaseCharges,
                    additionalChargesAmount: totalAdditionalCharges,
                    addOnBrakeDown: [],
                    totalAmount: totalDailyAmount,
                    currencyCode: charge.currencyCode,
                });
            });
        });

        return { totalAmount: basePrice, dailyPriceBrakeDown };
    }
}
class CustomizableDealClass {
    private customizableDeal: ICustomizableDeal;
    private priceBrakedown: PriceBrakeDown;

    constructor(
        priceBrakedown: PriceBrakeDown,
        customizableDeal: ICustomizableDeal
    ) {
        this.priceBrakedown = priceBrakedown;
        this.customizableDeal = customizableDeal;
    }

    public applyCustomizableDealDiscount(): PriceBrakeDown {
        const { discountType, discountValue } = this.customizableDeal;

        if (!discountValue || discountValue <= 0) {
            return this.priceBrakedown;
        }

        let discountAmount = 0;

        if (discountType === 'percentage') {
            discountAmount =
                (this.priceBrakedown.amountBeforeTax * discountValue) / 100;
        } else if (discountType === 'flat') {
            discountAmount = Math.min(
                discountValue,
                this.priceBrakedown.amountBeforeTax
            );
        }

        if (discountAmount <= 0) {
            return this.priceBrakedown;
        }

        return {
            ...this.priceBrakedown,
            customizableDealDiscount: discountAmount,
            currentChargeableAmount:
                this.priceBrakedown.currentChargeableAmount - discountAmount,
            totalAmount: this.priceBrakedown.totalAmount - discountAmount,
        };
    }
}
class AddOnPriceClass {
    addons: IAddOn[] | null;
    addonsWithRatePlans: IAddOn[] | null;
    priceBrakedowns: PriceBrakeDown;
    numberOfRooms: number;
    noOfDays: number;
    noOfAdults: number;
    startDate: Date;
    endDate: Date;
    parsedAddons: ISelectedAddonsS[] | null;
    childAges: number[] | null;
    constructor(
        addons: IAddOn[] | null,
        ratePlanAddons: IAddOn[] | null,
        priceBrakedowns: PriceBrakeDown,
        numberOfRooms: number,
        noOfDays: number,
        noOfAdults: number,
        startDate: Date,
        endDate: Date,
        childAges?: number[] | null,
        parsedAddons?: ISelectedAddonsS[] | null
    ) {
        this.addons = addons;
        this.addonsWithRatePlans = ratePlanAddons;
        this.priceBrakedowns = priceBrakedowns;
        this.numberOfRooms = numberOfRooms;
        this.noOfDays = noOfDays;
        this.noOfAdults = noOfAdults;
        this.startDate = startDate;
        this.endDate = endDate;
        this.childAges = childAges || null;
        this.parsedAddons = parsedAddons || null;
    }
    public addonBrakeDowns(): PriceBrakeDown {
        const userAppliedAddons = this.calculateAddOnPrice();
        const ratePlanAddons = this.calculateRatePlanAddOnPrice();
        const sumAddons = [...userAppliedAddons, ...ratePlanAddons];
        const sumAddonsAmount = sumAddons.reduce(
            (sum, addon) => sum + addon.totalAmount,
            0
        );

        return {
            ...this.priceBrakedowns,
            addonBrakeDowns: sumAddons,
            totalAddonAmount: sumAddonsAmount,
            totalAmount: this.priceBrakedowns.totalAmount + sumAddonsAmount,
            currentChargeableAmount:
                this.priceBrakedowns.currentChargeableAmount + sumAddonsAmount,
        };
    }

    private calculateAddOnPrice(): AddOnBrakeDown[] {
        if (!this.addons || this.addons.length === 0) {
            return [];
        }
        const addonBrakeDown: AddOnBrakeDown[] = [];

        this.addons.forEach(addon => {
            const availableEntries = addon.availability.filter(avail => {
                const availDate = new Date(avail.date);
                return (
                    availDate >= this.startDate &&
                    availDate < this.endDate &&
                    avail.isAvailable
                );
            });

            if (availableEntries.length === 0) return;

            // produce one breakdown entry per available date using per-date quantity
            const userSelectedAddon = this.parsedAddons?.find(
                pa => pa.addOnId === addon.id
            );

            availableEntries.forEach(avail => {
                const dateStr = new Date(avail.date).toDateString();
                const amount = Number(avail.price);
                // if user provided parsedAddons, use its per-date quantity, otherwise default to 1
                const quantityForDate = userSelectedAddon
                    ? userSelectedAddon.availability.find(
                        a =>
                            new Date(a.date).toISOString() ===
                            new Date(avail.date).toISOString()
                    )?.quantity || 1
                    : 1;
                const totalAmount = amount * quantityForDate;

                addonBrakeDown.push({
                    addonId: addon.id,
                    name: addon.name,
                    amount,
                    quantity: quantityForDate,
                    totalAmount,
                    currencyCode: addon.availability[0]
                        .currencyCode as CurrencyCode,
                    date: dateStr,
                    type: 'selected',
                });
            });

            // calculate child addon prices if childAges exist
            // if (this.childAges && this.childAges.length > 0) {
            //     const childAddonBreakdowns = this.calculateChildAddonPrice(
            //         addon,
            //         this.childAges,
            //         'selected'
            //     );
            //     addonBrakeDown.push(...childAddonBreakdowns);
            // }
        });

        return addonBrakeDown;
    }
    private calculateRatePlanAddOnPrice(): AddOnBrakeDown[] {
        if (
            !this.addonsWithRatePlans ||
            this.addonsWithRatePlans.length === 0
        ) {
            return [];
        }
        const addonBrakeDown: AddOnBrakeDown[] = [];

        this.addonsWithRatePlans.forEach(addon => {
            if (addon.availability.length === 0) return;

            addon.availability.forEach((avail, index) => {
                const amount = Number(avail.price);
                let quantityForDate = 1;
                switch (addon.postingRhythm) {
                    case 'per_night':
                        quantityForDate = 1;
                        break;
                    case 'per_stay':
                        quantityForDate = index === 0 ? 1 : 0;
                        break;
                    case 'per_person_per_night':
                        quantityForDate = this.noOfAdults;
                        break;
                    case 'per_person_per_stay':
                        quantityForDate = index === 0 ? this.noOfAdults : 0;
                        break;
                    case 'per_room':
                        quantityForDate = index === 0 ? this.numberOfRooms : 0;
                        break;
                    case 'per_room_per_night':
                        quantityForDate = this.numberOfRooms;
                        break;
                    case 'per_person_per_room':
                        quantityForDate = index === 0 ? this.noOfAdults : 0;
                        break;
                    default:
                        quantityForDate = 1;
                }

                if (quantityForDate === 0) return;

                const totalAmount = amount * quantityForDate;
                addonBrakeDown.push({
                    addonId: addon.id,
                    name: addon.name,
                    amount,
                    quantity: quantityForDate,
                    totalAmount,
                    type: 'included',
                    currencyCode: addon.availability[0]
                        .currencyCode as CurrencyCode,
                    date: new Date(avail.date).toDateString(),
                });
            });

            // calculate child addon prices if childAges exist
            if (this.childAges && this.childAges.length > 0) {
                const childAddonBreakdowns = this.calculateChildAddonPrice(
                    addon,
                    this.childAges,
                    'included'
                );
                addonBrakeDown.push(...childAddonBreakdowns);
            }
        });

        return addonBrakeDown;
    }
    private calculateChildAddonPrice(
        addon: IAddOn,
        childAges: number[],
        type: 'selected' | 'included'
    ): AddOnBrakeDown[] {
        if (childAges.length === 0) return [];

        const availableEntries = addon.availability.filter(avail => {
            const availDate = new Date(avail.date);
            return (
                availDate >= this.startDate &&
                availDate < this.endDate &&
                avail.isAvailable
            );
        });

        if (availableEntries.length === 0) return [];

        // produce per-date child addon entries
        const addonBrakeDown: AddOnBrakeDown[] = [];

        availableEntries.forEach((avail, index) => {
            const amount = Number(avail.price);
            // determine quantity per date based on posting rhythm
            let quantityForDate = 1;
            switch (addon.postingRhythm) {
                case 'per_night':
                    quantityForDate = 1;
                    break;
                case 'per_stay':
                    quantityForDate = 1;
                    break;
                case 'per_person_per_night':
                    quantityForDate = 1; // will be multiplied per child below
                    break;
                case 'per_person_per_stay':
                    quantityForDate = 1; // will be multiplied per child below
                    break;
                case 'per_room':
                    quantityForDate = 1;
                    break;
                case 'per_room_per_night':
                    quantityForDate = 1;
                    break;
                case 'per_person_per_room':
                    quantityForDate = 1;
                    break;
                default:
                    quantityForDate = 1;
            }

            childAges.forEach(age => {
                const childAddon = addon.ChildAddons?.find(
                    ca => age >= ca.minAge && age <= ca.maxAge
                );

                let childPrice = amount;

                if (childAddon) {
                    if (!childAddon.discountApplicable) {
                        childPrice = amount;
                    } else if (
                        childAddon.discountApplicable &&
                        childAddon.discountType &&
                        childAddon.discountAmount !== null
                    ) {
                        if (childAddon.discountType === 'percentage') {
                            const discount =
                                (amount * childAddon.discountAmount) / 100;
                            childPrice = amount - discount;
                        } else if (childAddon.discountType === 'flat') {
                            childPrice = Math.max(
                                amount - childAddon.discountAmount,
                                0
                            );
                        }
                    }
                }
                const totalAmount = childPrice * quantityForDate;

                addonBrakeDown.push({
                    addonId: addon.id,
                    name: `${addon.name} (Child age ${age})`,
                    amount: childPrice,
                    quantity: quantityForDate,
                    totalAmount,
                    currencyCode: addon.availability[0]
                        .currencyCode as CurrencyCode,
                    date: new Date(avail.date).toDateString(),
                    type: type,
                });
            });
        });

        return addonBrakeDown;
    }
}

class PromotionClass {
    pricingRepository: PricingRepository;
    startDate: Date;
    endDate: Date;
    mlos: IMLOS[];
    promotions: ICEbDsOftc[];
    geoRatePlans: IGeoRatePlanWithoutRatePlan[];
    ratePlanId: string;
    roomType: string;
    baseAmount: number;
    detectedDeviceType: DeviceType | null;
    priceBrakeDown: PriceBrakeDown;
    autoAppliedMLOSData: IMLOS[];
    autoAppliedPromotionsData: ICEbDsOftc[];
    constructor(
        startDate: Date,
        endDate: Date,
        mlos: IMLOS[],
        promotions: ICEbDsOftc[],
        geoRatePlans: IGeoRatePlanWithoutRatePlan[],
        ratePlanId: string,
        baseAmount: number,
        roomType: string,
        detectedDeviceType: DeviceType | null,
        priceBrakeDown: PriceBrakeDown,
        autoAppliedMLOS: IMLOS[],
        autoAppliedPromotions: ICEbDsOftc[]
    ) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.mlos = mlos;
        this.promotions = promotions;
        this.ratePlanId = ratePlanId;
        this.pricingRepository = new PricingRepository();
        this.baseAmount = baseAmount;
        this.roomType = roomType;
        this.detectedDeviceType = detectedDeviceType;
        this.priceBrakeDown = priceBrakeDown;
        this.geoRatePlans = geoRatePlans;
        this.autoAppliedMLOSData = autoAppliedMLOS;
        this.autoAppliedPromotionsData = autoAppliedPromotions;
    }
    public promotionPrices(country?: string): PriceBrakeDown {
        const autoAppliedMlosBrakeDown = this.calculateAutoAppliedMLOSPrices(
            this.autoAppliedMLOSData,
            'auto_applied'
        );
        const autoAppliedPromotionBrakeDown =
            this.calculateAutoAppliedPromotionPrices(
                this.autoAppliedPromotionsData,
                'auto_applied'
            );
        const mlsoBrakeDown = this.calculateAutoAppliedMLOSPrices(
            this.mlos,
            'user_applied'
        );
        const promotionBrakeDown = this.calculateAutoAppliedPromotionPrices(
            this.promotions,
            'user_applied'
        );

        const geoPriceBrakedown = this.calculateGeoLocation(country);

        const visiblePromotionalBrakeDown = [
            ...autoAppliedMlosBrakeDown,
            ...autoAppliedPromotionBrakeDown,
            ...mlsoBrakeDown,
            ...promotionBrakeDown,
        ];

        const visibleDiscountAmount = visiblePromotionalBrakeDown.reduce(
            (sum, promo) => {
                return promo.restrictionType === 'decrease'
                    ? sum + promo.discountAmount
                    : sum - promo.discountAmount;
            },
            0
        );

        const geoDiscountAmount = geoPriceBrakedown.reduce((sum, promo) => {
            return promo.restrictionType === 'decrease'
                ? sum + promo.discountAmount
                : sum - promo.discountAmount;
        }, 0);

        const totalDiscountedAmount = visibleDiscountAmount + geoDiscountAmount;
        const updatedDailyPriceBrakeDown = (this.priceBrakeDown.dailyPriceBrakeDown ?? []).map(day => {
            if (geoDiscountAmount === 0) return day;
            const dayWeight = day.totalAmount / this.priceBrakeDown.amountBeforeTax;
            const dayGeoDiscount = geoDiscountAmount * dayWeight;
            const restrictionType = geoPriceBrakedown[0]?.restrictionType; // 'increase' or 'decrease'
            return {
                ...day,
                totalAmount: restrictionType === 'increase'
                    ? day.totalAmount + dayGeoDiscount
                    : day.totalAmount - dayGeoDiscount,
            };
        });
        return {
            ...this.priceBrakeDown,
            dailyPriceBrakeDown: updatedDailyPriceBrakeDown, // ✅
            totalPromotionAmount: visibleDiscountAmount,
            amountBeforeTax:
                this.priceBrakeDown.amountBeforeTax - geoDiscountAmount,
            totalAmount:
                this.priceBrakeDown.totalAmount - totalDiscountedAmount,
            currentChargeableAmount:
                this.priceBrakeDown.currentChargeableAmount -
                totalDiscountedAmount,
            promotionBrakeDown: visiblePromotionalBrakeDown,
        };
    }
    private differenceReservationDays(startDate: Date, endDate: Date): number {
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffInMs = endDate.getTime() - startDate.getTime();
        return Math.ceil(diffInMs / msPerDay);
    }
    private calculateAutoAppliedMLOSPrices(
        mlos: IMLOS[],
        type: 'user_applied' | 'auto_applied'
    ) {
        const differenceReservationDays = this.differenceReservationDays(
            this.startDate,
            this.endDate
        );
        if (mlos.length == 0) {
            return [];
        }
        const mlosBrakeDown: PromotionBrakeDown[] = [];
        mlos.forEach(mlos => {
            if (
                mlos.minLos <= differenceReservationDays &&
                (mlos.maxLos == null ||
                    mlos.maxLos >= differenceReservationDays)
            ) {
                if (mlos.discountType == 'percentage') {
                    mlosBrakeDown.push({
                        id: mlos.id,
                        promotionType: 'mlos',
                        name: 'MLOS',
                        currencyCode: mlos.currencyCode,
                        discountAmount:
                            (this.baseAmount * Number(mlos.discountValue)) /
                            100,
                        discountType: 'percentage',
                        discountValue: Number(mlos.discountValue),
                        restrictionType: 'decrease',
                        type,
                    });
                } else if (mlos.discountType == 'flat') {
                    mlosBrakeDown.push({
                        id: mlos.id,
                        promotionType: 'mlos',
                        name: 'MLOS',
                        currencyCode: mlos.currencyCode,
                        discountAmount: Number(mlos.discountValue),
                        discountValue: Number(mlos.discountValue),
                        discountType: 'flat',
                        restrictionType: 'decrease',
                        type,
                    });
                }
            }
        });
        return mlosBrakeDown;
    }
    private calculateAutoAppliedPromotionPrices(
        autoAppliedPromotions: ICEbDsOftc[],
        type: 'user_applied' | 'auto_applied'
    ): PromotionBrakeDown[] {
        const promotionBrakeDown: PromotionBrakeDown[] = [];
        autoAppliedPromotions.forEach(promotion => {
            if (promotion.promotionType === 'early_bird') {
                const earlyBirdPromotionBrakeDown =
                    this.calculateEarlyBirdPromotionPrices(promotion, type);
                if (!earlyBirdPromotionBrakeDown) {
                    return;
                }
                promotionBrakeDown.push(earlyBirdPromotionBrakeDown);
            } else if (promotion.promotionType === 'offer_for_tonight') {
                const offerForTonightPromotionBrakeDown =
                    this.calculateOfferForTonightPromotionPrices(
                        promotion,
                        type
                    );
                if (!offerForTonightPromotionBrakeDown) {
                    return;
                }
                promotionBrakeDown.push(offerForTonightPromotionBrakeDown);
            } else if (promotion.promotionType === 'device_specific') {
                const deviceBasedPromotionBrakeDown =
                    this.calculateDeviceBasedPromotionPrices(promotion, type);
                if (!deviceBasedPromotionBrakeDown) {
                    return;
                }
                promotionBrakeDown.push(deviceBasedPromotionBrakeDown);
            }
        });
        return promotionBrakeDown;
    }
    private calculateDeviceBasedPromotionPrices(
        promotion: ICEbDsOftc,
        type: 'user_applied' | 'auto_applied'
    ): PromotionBrakeDown | null {
        if (!this.detectedDeviceType) {
            return null;
        }
        if (promotion.roomType && promotion.roomType !== this.roomType) {
            return null;
        }
        const checkPromotionDayApplicability =
            this.checkIfPromotionActiveForDay(promotion, this.startDate);
        if (!checkPromotionDayApplicability) {
            return null;
        }
        if (promotion.deviceType.includes(this.detectedDeviceType)) {
            if (promotion.discountType == 'percentage') {
                return {
                    id: (promotion as any).id,
                    promotionType: 'device_specific',
                    name: 'Device Specific',
                    currencyCode: promotion.currencyCode,
                    discountAmount:
                        (this.baseAmount * Number(promotion.discountValue)) /
                        100,
                    discountType: 'percentage',
                    discountValue: Number(promotion.discountValue),
                    restrictionType: 'decrease',
                    type,
                };
            } else if (promotion.discountType == 'flat') {
                return {
                    id: (promotion as any).id,
                    promotionType: 'device_specific',
                    name: 'Device Specific',
                    currencyCode: promotion.currencyCode,
                    discountAmount: Number(promotion.discountValue),
                    discountType: 'flat',
                    discountValue: Number(promotion.discountValue),
                    restrictionType: 'decrease',
                    type,
                };
            }
        }
        return null;
    }
    private calculateEarlyBirdPromotionPrices(
        promotion: ICEbDsOftc,
        type: 'user_applied' | 'auto_applied'
    ): PromotionBrakeDown | null {
        if (!promotion.advanceBookingDays) {
            return null;
        }
        if (promotion.roomType && promotion.roomType !== this.roomType) {
            return null;
        }
        const checkPromotionDayApplicability =
            this.checkIfPromotionActiveForDay(promotion, this.startDate);
        if (!checkPromotionDayApplicability) {
            return null;
        }
        const todayDate = nowUTC();
        const advanceBookingDays = Math.ceil(
            (this.startDate.getTime() - todayDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (advanceBookingDays >= promotion.advanceBookingDays) {
            if (promotion.discountType == 'percentage') {
                return {
                    id: (promotion as any).id,
                    promotionType: 'early_bird',
                    name: 'Early Bird',
                    currencyCode: promotion.currencyCode,
                    discountAmount:
                        (this.baseAmount * Number(promotion.discountValue)) /
                        100,
                    discountType: 'percentage',
                    discountValue: Number(promotion.discountValue),
                    restrictionType: 'decrease',
                    type,
                };
            } else if (promotion.discountType == 'flat') {
                return {
                    id: (promotion as any).id,
                    promotionType: 'early_bird',
                    name: 'Early Bird',
                    currencyCode: promotion.currencyCode,
                    discountAmount: Number(promotion.discountValue),
                    discountType: 'flat',
                    discountValue: Number(promotion.discountValue),
                    restrictionType: 'decrease',
                    type,
                };
            }
        }
        return null;
    }
    private calculateOfferForTonightPromotionPrices(
        promotion: ICEbDsOftc,
        type: 'user_applied' | 'auto_applied'
    ): PromotionBrakeDown | null {
        const checkPromotionDayApplicability =
            this.checkIfPromotionActiveForDay(promotion, this.startDate);
        if (!checkPromotionDayApplicability) {
            return null;
        }
        if (promotion.roomType && promotion.roomType !== this.roomType) {
            return null;
        }
        const todayDate = nowUTC();
        const isOfferForTonightApplicable =
            this.startDate.getTime() - todayDate.getTime() <=
            1000 * 60 * 60 * 24 &&
            this.startDate.getTime() - todayDate.getTime() <= 0;
        if (isOfferForTonightApplicable) {
            if (promotion.discountType == 'percentage') {
                return {
                    id: (promotion as any).id,
                    promotionType: 'offer_for_tonight',
                    name: 'Offer For Tonight',
                    currencyCode: promotion.currencyCode,
                    discountAmount:
                        (this.baseAmount * Number(promotion.discountValue)) /
                        100,
                    discountType: 'percentage',
                    discountValue: Number(promotion.discountValue),
                    restrictionType: 'decrease',
                    type,
                };
            } else if (promotion.discountType == 'flat') {
                return {
                    id: (promotion as any).id,
                    promotionType: 'offer_for_tonight',
                    name: 'Offer For Tonight',
                    currencyCode: promotion.currencyCode,
                    discountAmount: Number(promotion.discountValue),
                    discountType: 'flat',
                    discountValue: Number(promotion.discountValue),
                    restrictionType: 'decrease',
                    type,
                };
            }
        }
        return null;
    }
    private checkIfPromotionActiveForDay(
        promotion: ICEbDsOftc,
        date: Date
    ): boolean {
        const day = date.getDay();
        switch (day) {
            case 0:
                return promotion.sunApplicable || false;
            case 1:
                return promotion.monApplicable || false;
            case 2:
                return promotion.tueApplicable || false;
            case 3:
                return promotion.wedApplicable || false;
            case 4:
                return promotion.thuApplicable || false;
            case 5:
                return promotion.friApplicable || false;
            case 6:
                return promotion.satApplicable || false;
        }
        return false;
    }
    private calculateGeoLocation(country?: string): PromotionBrakeDown[] {
        const promotionBrakeDown: PromotionBrakeDown[] = [];
        if (!country) return [];

        this.geoRatePlans.forEach(geo => {
            if (!geo.isActive) return;
            if (geo.roomType && geo.roomType !== this.roomType) return;
            if (!geo.countryCode.includes(country)) return;

            if (geo.restrictionType === 'restricted') {
                throw new Error(`This room is restricted for this country`);
            }

            const restrictionType =
                geo.restrictionTypeAction === 'increase'
                    ? 'increase'
                    : 'decrease';

            if (geo.restrictionType === 'fixed') {
                promotionBrakeDown.push({
                    id: geo.id,
                    promotionType: 'normal',
                    currencyCode: geo.currencyCode,
                    discountAmount: Number(geo.restrictionValue),
                    discountType: 'flat',
                    discountValue: Number(geo.restrictionValue),
                    name: 'Geo Restriction',
                    restrictionType,
                    type: 'auto_applied',
                });
            } else if (geo.restrictionType === 'percentage') {
                promotionBrakeDown.push({
                    id: geo.id,
                    promotionType: 'normal',
                    currencyCode: geo.currencyCode,
                    discountAmount:
                        (this.baseAmount * Number(geo.restrictionValue)) / 100,
                    discountType: 'percentage',
                    discountValue: Number(geo.restrictionValue),
                    name: 'Geo Restriction',
                    restrictionType,
                    type: 'auto_applied',
                });
            }
        });

        return promotionBrakeDown;
    }
}

class TouristTaxClass {
    touristTax: ITouristTax[];
    room: IRoom;
    noOfRooms: number;
    priceBrakedown: PriceBrakeDown;
    noOfDays: number;
    noOfBedrooms: number;
    constructor(
        touristTax: ITouristTax[] | ITouristTax,
        room: IRoom,
        noOfRooms: number,
        priceBrakeDown: PriceBrakeDown,
        noOfDays: number
    ) {
        this.touristTax = Array.isArray(touristTax)
            ? touristTax
            : touristTax
                ? [touristTax]
                : [];
        this.room = room;
        this.noOfRooms = noOfRooms;
        this.priceBrakedown = priceBrakeDown;
        this.noOfDays = noOfDays;
        this.noOfBedrooms = room.numberOfBedrooms;
    }
    public findTouristTax(): PriceBrakeDown {
        let touristTaxes: PromotionBrakeDown[] = [];
        this.touristTax.map(tax => {
            touristTaxes.push(this.calculateTouristTaxvalue(tax));
        });
        const totalTouristCharges = touristTaxes.reduce(
            (sum, tax) => sum + tax.discountAmount,
            0
        );
        return {
            ...this.priceBrakedown,
            latterpayableAmount: totalTouristCharges,
            totalAmount:
                this.priceBrakedown.currentChargeableAmount +
                totalTouristCharges,
            promotionBrakeDown: [
                ...(this.priceBrakedown.promotionBrakeDown || []),
                ...touristTaxes,
            ],
        };
    }
    private calculateTouristTaxvalue(
        touristTax: ITouristTax
    ): PromotionBrakeDown {
        if (touristTax.discountType === 'percentage') {
            const baseRoomCharge =
                this.priceBrakedown.dailyPriceBrakeDown?.reduce(
                    (sum: any, day: any) =>
                        sum +
                        day.baseChargesAmount +
                        day.additionalChargesAmount,
                    0
                );
            return {
                id: touristTax.id,
                promotionType: 'normal',
                name: touristTax.name ? touristTax.name : 'Tourist Tax',
                discountType: touristTax.discountType,
                discountValue: Number(touristTax.discountValue),
                currencyCode: touristTax.currencyCode,
                discountAmount:
                    ((baseRoomCharge * Number(touristTax.discountValue)) /
                        100) *
                    this.noOfBedrooms,
                restrictionType: 'payLater',
                type: 'auto_applied',
            };
        } else {
            return {
                id: touristTax.id,
                promotionType: 'normal',
                name: touristTax.name ? touristTax.name : 'Tourist Tax',
                discountType: touristTax.discountType,
                discountValue: Number(touristTax.discountValue),
                currencyCode: touristTax.currencyCode,
                discountAmount:
                    Number(touristTax.discountValue) *
                    this.noOfDays *
                    this.noOfRooms *
                    this.noOfBedrooms, // ← fully calculated
                restrictionType: 'payLater',
                type: 'auto_applied',
            };
        }
    }
}
class PromoCodeDiscountClass {
    priceBrakedown: PriceBrakeDown;
    promoCode: string;
    roomTypeId: string;
    ratePlanId: string;
    deviceType: DeviceType;
    private promoCodeData: IPromoCode | null;

    constructor(
        priceBrakedown: PriceBrakeDown,
        promoCode: string,
        roomTypeId: string,
        ratePlanId: string,
        deviceType: DeviceType,
        promoCodeData: IPromoCode | null
    ) {
        this.priceBrakedown = priceBrakedown;
        this.promoCode = promoCode;
        this.promoCodeData = promoCodeData;
        this.roomTypeId = roomTypeId;
        this.ratePlanId = ratePlanId;
        this.deviceType = deviceType;
    }
    public findPromoCodeDiscount(): PriceBrakeDown {
        const checkIfPromoCodeIsValid = this.promoCodeData;
        if (!checkIfPromoCodeIsValid) {
            return this.priceBrakedown;
        }
        if (
            !this.checkIfPromoCodeIsAppliedToDevice(
                this.deviceType,
                checkIfPromoCodeIsValid
            )
        ) {
            return this.priceBrakedown;
        }
        if (
            checkIfPromoCodeIsValid.minBookingAmount && //chck for minimum booking amount
            checkIfPromoCodeIsValid.minBookingAmount >
            this.priceBrakedown.amountBeforeTax
        ) {
            return this.priceBrakedown;
        }
        if (
            checkIfPromoCodeIsValid.applicableRoomTypes &&
            !(
                checkIfPromoCodeIsValid.applicableRoomTypes.includes(
                    this.roomTypeId
                ) || checkIfPromoCodeIsValid.applicableRoomTypes.includes('all')
            )
        ) {
            return this.priceBrakedown;
        }
        if (
            checkIfPromoCodeIsValid.applicableRatePlans &&
            !(
                checkIfPromoCodeIsValid.applicableRatePlans.includes(
                    this.ratePlanId
                ) || checkIfPromoCodeIsValid.applicableRatePlans.includes('all')
            )
        ) {
            return this.priceBrakedown;
        }
        if (checkIfPromoCodeIsValid.discountType === 'percentage') {
            let promoCodeDiscountAmount =
                (this.priceBrakedown.amountBeforeTax *
                    checkIfPromoCodeIsValid.discountValue) /
                100;
            if (
                checkIfPromoCodeIsValid.maxDiscountAmount &&
                promoCodeDiscountAmount >
                checkIfPromoCodeIsValid.maxDiscountAmount
            ) {
                promoCodeDiscountAmount =
                    checkIfPromoCodeIsValid.maxDiscountAmount;
            }
            return {
                ...this.priceBrakedown,
                promoCodeDiscount: promoCodeDiscountAmount,
                currentChargeableAmount:
                    this.priceBrakedown.currentChargeableAmount -
                    promoCodeDiscountAmount,
                totalAmount:
                    this.priceBrakedown.totalAmount - promoCodeDiscountAmount,
            };
        } else {
            let promoCodeDiscountAmount = checkIfPromoCodeIsValid.discountValue;
            if (
                checkIfPromoCodeIsValid.maxDiscountAmount &&
                promoCodeDiscountAmount >
                checkIfPromoCodeIsValid.maxDiscountAmount
            ) {
                promoCodeDiscountAmount =
                    checkIfPromoCodeIsValid.maxDiscountAmount;
            }
            return {
                ...this.priceBrakedown,
                promoCodeDiscount: promoCodeDiscountAmount,
                currentChargeableAmount:
                    this.priceBrakedown.currentChargeableAmount -
                    promoCodeDiscountAmount,
                totalAmount:
                    this.priceBrakedown.totalAmount - promoCodeDiscountAmount,
            };
        }
    }
    private checkIfPromoCodeIsAppliedToDevice(
        deviceType: DeviceType,
        promoCode: IPromoCode
    ): boolean {
        if (deviceType === 'desktop') {
            return promoCode.isApplicableForDesktop;
        } else if (deviceType === 'mobile') {
            return promoCode.isApplicableForMobileApp;
        } else if (deviceType === 'tablet') {
            return promoCode.isApplicableForTablet;
        }
        return false;
    }
}
class LoyalityDiscountClass {
    priceBrakedown: PriceBrakeDown;
    private loyaltyData: ILoyaltyDiscountData;

    constructor(
        priceBrakedown: PriceBrakeDown,
        loyaltyData: ILoyaltyDiscountData
    ) {
        this.priceBrakedown = priceBrakedown;
        this.loyaltyData = loyaltyData;
    }
    public findLoyalityDiscount(): PriceBrakeDown {
        const { guestLevel, loyalityLevels, fallback } = this.loyaltyData;
        let loyaltyDiscount = 0;

        // Try to find a matching LoyalityLevel for this guest's level
        const matchedLevel =
            guestLevel !== null
                ? loyalityLevels.find(
                    (l: { level: number }) => l.level === guestLevel
                )
                : null;

        if (matchedLevel) {
            // Level-based: percentage of amountBeforeTax
            loyaltyDiscount =
                (this.priceBrakedown.amountBeforeTax *
                    matchedLevel.discountPercentage) /
                100;
        } else if (fallback) {
            // Fallback to CreationLoyaltyConfig global discount
            loyaltyDiscount =
                fallback.type === 'percentage'
                    ? (this.priceBrakedown.amountBeforeTax * fallback.value) /
                    100
                    : fallback.value;
        }

        if (loyaltyDiscount === 0) {
            return this.priceBrakedown;
        }

        return {
            ...this.priceBrakedown,
            loyalityDiscount: loyaltyDiscount,
            currentChargeableAmount:
                this.priceBrakedown.currentChargeableAmount - loyaltyDiscount,
            totalAmount: this.priceBrakedown.totalAmount - loyaltyDiscount,
        };
    }
}

class TaxClass {
    taxGroup: ITaxGroup | null;
    priceBrakeDown: PriceBrakeDown;
    constructor(taxGroup: ITaxGroup | null, priceBrakeDown: PriceBrakeDown) {
        this.taxGroup = taxGroup || null;
        this.priceBrakeDown = priceBrakeDown;
    }
    public applyTax(): PriceBrakeDown {
        if (!this.taxGroup) {
            return {
                ...this.priceBrakeDown,
                taxedAmount: 0,
                taxBrakeDown: [],
                currentChargeableAmount: this.priceBrakeDown.amountBeforeTax,
                totalAmount:
                    this.priceBrakeDown.amountBeforeTax +
                    this.priceBrakeDown.latterpayableAmount,
            };
        }

        const base = Number(this.priceBrakeDown.amountBeforeTax) || 0;

        // ✅ STEP 1: group by priority
        const grouped: Record<number, any[]> = {};

        this.taxGroup.taxGroupRules.forEach(rule => {
            const p = rule.taxRule.priority;
            if (!grouped[p]) grouped[p] = [];
            grouped[p].push(rule);
        });

        // ✅ STEP 2: sort priorities
        const priorities = Object.keys(grouped)
            .map(Number)
            .sort((a, b) => a - b);

        let runningTotal = base;
        const taxBrakeDown: TaxBrakeDown[] = [];

        // ✅ STEP 3: apply group-wise
        priorities.forEach(priority => {
            const rules = grouped[priority];
            let groupTaxTotal = 0;

            rules.forEach(rule => {
                let taxForThisRule = 0;

                if (rule.taxRule.type === 'fixed') {
                    taxForThisRule = Number(rule.taxRule.value);
                } else {
                    // ✅ SAME BASE for same priority
                    taxForThisRule =
                        (Number(rule.taxRule.value) * runningTotal) / 100;
                }

                groupTaxTotal += taxForThisRule;

                taxBrakeDown.push({
                    id: rule.taxRule.id,
                    name: rule.taxRule.name,
                    taxedAmount: taxForThisRule,
                    currencyCode: this.priceBrakeDown.currencyCode,
                });
            });

            // ✅ update AFTER whole group
            runningTotal += groupTaxTotal;
        });

        const taxedAmount = runningTotal - base;

        return {
            ...this.priceBrakeDown,
            taxedAmount,
            taxBrakeDown,
            currentChargeableAmount: runningTotal,
            totalAmount: runningTotal + this.priceBrakeDown.latterpayableAmount,
        };
    }
}

