import { IMLOS } from '../../promotions/mlos/interfaces';
import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';
import {
    errorResponse,
    IApiResponse,
    nowUTC,
    successResponse,
    toUTC,
} from '../../utils';
import { PricingRepository } from '../repository';
import {
    AddOnBrakeDown,
    DailyPriceBrakeDown,
    IAddOn,
    ICharge,
    IIncludedAddons,
    IRatePlanWithAddon,
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
import {
    IGeoRatePlanWithoutRatePlan,
} from '../../promotions/geo-rate-plan/interfaces';
import { ICEbDsOftc } from '../../promotions/eb-ds-oftc/interfaces';
import { IPromoCode } from '../../ari/types/promoCode.type';
export class PricingService {
    private pricingRepository: PricingRepository;
    constructor() {
        this.pricingRepository = new PricingRepository();
    }
    public async getRoomRentService(
        propertyId: string,
        invTypeCode: string,
        startDate: Date | string,
        endDate: Date | string,
        ratePlanCode: string,
        rooms: number,
        adults: number,
        children?: number,
        guestEmail?: string,
        userCountryCode?: string,
        detectedDeviceType?: string,
        promotions?: ISelectedPromotion[],
        parsedAddons?: ISelectedAddonsS[],
        promoCode?: string,
        includedAddons?: string[]
    ): Promise<IApiResponse<PriceBrakeDown>> {
        try {

            const parsedStartDate: Date = startDate instanceof Date ? startDate : new Date(startDate);
            const parsedEndDate: Date = endDate instanceof Date ? endDate : new Date(endDate);
            startDate = parsedStartDate;
            endDate = parsedEndDate;
            const [ratePlan, selectedAddons, appliedPromotions] =
                await Promise.all([
                    this.pricingRepository.validateRatePlan(
                        ratePlanCode,
                        invTypeCode,
                        toUTC(startDate),
                        toUTC(endDate),
                        includedAddons??[]
                    ),
                    this.fetchAddons(parsedAddons),
                    this.fetchAllPromotions(promotions),
                ]);
            if (!ratePlan) {
                return errorResponse('Rate plan not found');
            }
            const basePrice = new BasePriceClass(
                startDate,
                endDate,
                adults,
                children ? children : 0,
                rooms,
                ratePlan.charges,
                ratePlan.taxGroup
            );
            let priceBrakedowns = basePrice.calculateTotalPrice();
            const addOnPrice = new AddOnPriceClass(
                selectedAddons,
                ratePlan.Addons,
                priceBrakedowns,
                rooms,
                Math.ceil(
                    (endDate.getTime() - startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                ),
                adults + (children ? children : 0),
                startDate,
                endDate,
                parsedAddons
            );
            priceBrakedowns = addOnPrice.addonBrakeDowns();
            // console.log("priceBrakedowns addons price", priceBrakedowns);

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
                priceBrakedowns
            );
            priceBrakedowns =
                await promotionClass.promotionPrices(userCountryCode);
            // console.log("priceBrakedowns promotions price", priceBrakedowns);

            const touristTaxClass = new TouristTaxClass(
                ratePlan.TouristTaxs,
                priceBrakedowns
            );
            priceBrakedowns = touristTaxClass.findTouristTax();
            // console.log("priceBrakedowns tourist tax price", priceBrakedowns);
            if (guestEmail) {
                const loyalityDiscountClass = new LoyalityDiscountClass(
                    guestEmail,
                    propertyId,
                    priceBrakedowns
                );
                priceBrakedowns =
                    await loyalityDiscountClass.findLoyalityDiscount();
                // console.log("priceBrakedowns loyality discount price", priceBrakedowns);
            }
            if (detectedDeviceType && promoCode) {
                const deviceDiscountClass = new PromoCodeDiscountClass(
                    priceBrakedowns,
                    promoCode,
                    invTypeCode,
                    ratePlanCode,
                    detectedDeviceType as DeviceType
                );
                priceBrakedowns = await deviceDiscountClass.findPromoCodeDiscount()
                // console.log("priceBrakedowns device discount price", priceBrakedowns);
            }
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
}
class BasePriceClass {
    startDate: Date;
    endDate: Date;
    adults: number;
    children: number;
    rooms: number;
    charges: ICharge[];
    taxGroup: ITaxGroup | null;
    constructor(
        startDate: Date,
        endDate: Date,
        adults: number,
        children: number,
        rooms: number,
        charges: ICharge[],
        taxGroup: ITaxGroup | null
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
    }
    private differenceReservationDays(startDate: Date, endDate: Date): number {
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffInMs = endDate.getTime() - startDate.getTime();
        return Math.ceil(diffInMs / msPerDay);
    }
    public calculateTotalPrice(): PriceBrakeDown {
        const diffInDays = this.differenceReservationDays(
            this.startDate,
            this.endDate
        );
        if (diffInDays + 1 != this.charges.length) {
            throw new Error('Charges not found for the given date range');
        }

        this.checkCTA();
        this.checkCTD();
        this.checkIsSaleStopped();
        let { dailyPriceBrakeDown } = this.calculateBasePrice();
        dailyPriceBrakeDown = this.addTax(dailyPriceBrakeDown);

        // Compute global totals from daily breakdowns
        let totalAmount = 0;
        let amountBeforeTax = 0;
        let taxedAmount = 0;
        const globalTaxMap = new Map<
            string,
            {
                taxedAmount: number;
                currencyCode: (typeof dailyPriceBrakeDown)[0]['currencyCode'];
            }
        >();

        dailyPriceBrakeDown.forEach(day => {
            totalAmount += day.totalAmount;
            amountBeforeTax +=
                day.baseChargesAmount + day.additionalChargesAmount;
            taxedAmount += day.totalDailyTaxedAmount;

            day.taxBrakeDown.forEach(tax => {
                const existing = globalTaxMap.get(tax.name);
                if (existing) {
                    existing.taxedAmount += tax.taxedAmount;
                } else {
                    globalTaxMap.set(tax.name, {
                        taxedAmount: tax.taxedAmount,
                        currencyCode: tax.currencyCode,
                    });
                }
            });
        });

        const taxBrakeDown: TaxBrakeDown[] = Array.from(
            globalTaxMap.entries()
        ).map(([name, data]) => ({
            name,
            taxedAmount: data.taxedAmount,
            currencyCode: data.currencyCode,
        }));

        return {
            totalAmount,
            amountBeforeTax,
            taxedAmount,
            totalAddonAmount: 0,
            totalPromotionAmount: 0,
            currentChargeableAmount: totalAmount,
            latterpayableAmount: 0,
            loyalityDiscount: 0,
            promoCodeDiscount: 0,
            currencyCode: dailyPriceBrakeDown[0]?.currencyCode,
            dailyPriceBrakeDown,
            taxBrakeDown,
            addonBrakeDown: [],
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
        if (!checkOutDateCharge) {
            throw new Error('Check-out date charge not found');
        }
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
        const totalPersons = this.adults + this.children;
        this.charges.sort((a, b) => a.date.getTime() - b.date.getTime());
        this.charges.pop();
        this.charges.forEach(charge => {
            if (totalPersons > charge.baseGuestAmounts.length) {
                if (this.adults > charge.baseGuestAmounts.length) {
                    charge.baseGuestAmounts.sort(
                        (a, b) => b.numberOfGuests - a.numberOfGuests
                    );
                    const maxAdultCharges =
                        charge.baseGuestAmounts[
                        charge.baseGuestAmounts.length - 1
                        ];
                    const remainningAdults =
                        this.adults - maxAdultCharges.numberOfGuests;
                    let totalChargesForRemainningAdults = 0;
                    if (remainningAdults > 0) {
                        const chargesForRemainingAdults =
                            charge.additionalGuestAmounts.find(
                                additionalGuestAmount =>
                                    additionalGuestAmount.ageQualifyingCode ===
                                    '10'
                            );
                        if (!chargesForRemainingAdults) {
                            totalChargesForRemainningAdults = 0;
                        } else {
                            totalChargesForRemainningAdults =
                                remainningAdults *
                                Number(chargesForRemainingAdults.amount);
                        }
                    }
                    let totalChargesForChildren = 0;
                    if (this.children > 0) {
                        const chargesForChildren =
                            charge.additionalGuestAmounts.find(
                                additionalGuestAmount =>
                                    additionalGuestAmount.ageQualifyingCode ===
                                    '8'
                            );
                        if (!chargesForChildren) {
                            totalChargesForChildren = 0;
                        } else {
                            totalChargesForChildren =
                                this.children *
                                Number(chargesForChildren.amount);
                        }
                    }
                    const totalChargesForBaseGuest = Number(
                        maxAdultCharges.amountBeforeTax
                    );
                    const totalCharges =
                        totalChargesForBaseGuest +
                        totalChargesForRemainningAdults +
                        totalChargesForChildren;
                    basePrice += totalCharges;
                    dailyPriceBrakeDown.push({
                        date: charge.date.toDateString(),
                        baseChargesAmount: totalChargesForBaseGuest,
                        additionalChargesAmount:
                            totalChargesForRemainningAdults +
                            totalChargesForChildren,
                        taxBrakeDown: [],
                        addOnBrakeDown: [],
                        totalAmount: totalCharges,
                        currencyCode: charge.currencyCode,
                        totalDailyTaxedAmount: 0,
                    });
                } else {
                    const baseGuestAmount = charge.baseGuestAmounts.find(
                        baseGuestAmount =>
                            baseGuestAmount.numberOfGuests === this.adults
                    );
                    if (!baseGuestAmount) {
                        throw new Error(
                            `Base amount not found for the given date ${charge.date.toDateString()} for ${this.adults} persons`
                        );
                    }
                    basePrice += Number(baseGuestAmount.amountBeforeTax);
                    dailyPriceBrakeDown.push({
                        date: charge.date.toDateString(),
                        baseChargesAmount: Number(
                            baseGuestAmount.amountBeforeTax
                        ),
                        additionalChargesAmount: 0,
                        taxBrakeDown: [],
                        addOnBrakeDown: [],
                        totalAmount: Number(baseGuestAmount.amountBeforeTax),
                        currencyCode: charge.currencyCode,
                        totalDailyTaxedAmount: 0,
                    });
                }
            } else {
                const baseGuestAmount = charge.baseGuestAmounts.find(
                    baseGuestAmount =>
                        baseGuestAmount.numberOfGuests === totalPersons
                );
                if (!baseGuestAmount) {
                    throw new Error(
                        `Base amount not found for the given date ${charge.date.toDateString()} for ${totalPersons} persons`
                    );
                }
                basePrice += Number(baseGuestAmount.amountBeforeTax);
                dailyPriceBrakeDown.push({
                    date: charge.date.toDateString(),
                    baseChargesAmount: Number(baseGuestAmount.amountBeforeTax),
                    additionalChargesAmount: 0,
                    taxBrakeDown: [],
                    addOnBrakeDown: [],
                    totalAmount: Number(baseGuestAmount.amountBeforeTax),
                    currencyCode: charge.currencyCode,
                    totalDailyTaxedAmount: 0,
                });
            }
        });
        return { totalAmount: basePrice, dailyPriceBrakeDown };
    }
    private addTax(
        dailyPriceBrakeDown: DailyPriceBrakeDown[]
    ): DailyPriceBrakeDown[] {
        if (!this.taxGroup) {
            return dailyPriceBrakeDown;
        }
        const sortedTaxRules = this.taxGroup.taxGroupRules.sort(
            (a, b) => a.taxRule.priority - b.taxRule.priority
        );
        const dailyPriceBrakeDownWithTax: DailyPriceBrakeDown[] = [];

        dailyPriceBrakeDown.forEach(day => {
            const dailyTaxBrakeDown: TaxBrakeDown[] = [];
            let runningTotal = day.totalAmount;

            sortedTaxRules.forEach(rule => {
                let taxForThisRule = 0;
                if (rule.taxRule.type === 'fixed') {
                    taxForThisRule = Number(rule.taxRule.value);
                } else {
                    taxForThisRule =
                        (Number(rule.taxRule.value) * runningTotal) / 100;
                }
                if (rule.taxRule.applicableOn == 'total_amount') {
                    runningTotal += taxForThisRule;
                } else {
                    runningTotal = runningTotal + taxForThisRule * this.rooms;
                }

                dailyTaxBrakeDown.push({
                    name: rule.taxRule.name,
                    taxedAmount:
                        rule.taxRule.applicableOn == 'total_amount'
                            ? taxForThisRule
                            : taxForThisRule * this.rooms,
                    currencyCode: day.currencyCode,
                });
            });

            dailyPriceBrakeDownWithTax.push({
                date: day.date,
                baseChargesAmount: day.baseChargesAmount,
                additionalChargesAmount: day.additionalChargesAmount,
                taxBrakeDown: dailyTaxBrakeDown,
                addOnBrakeDown: day.addOnBrakeDown,
                totalAmount: runningTotal,
                currencyCode: day.currencyCode,
                totalDailyTaxedAmount: runningTotal - day.totalAmount,
            });
        });

        return dailyPriceBrakeDownWithTax;
    }
}

class AddOnPriceClass {
    addons: IAddOn[] | null;
    addonsWithRatePlans: IRatePlanWithAddon[] | null;
    priceBrakedowns: PriceBrakeDown;
    numberOfRooms: number;
    noOfDays: number;
    noOfPersons: number;
    startDate: Date;
    endDate: Date;
    parsedAddons: ISelectedAddonsS[] | null;
    constructor(
        addons: IAddOn[] | null,
        ratePlanAddons: IRatePlanWithAddon[] | null,
        priceBrakedowns: PriceBrakeDown,
        numberOfRooms: number,
        noOfDays: number,
        noOfPersons: number,
        startDate: Date,
        endDate: Date,
        parsedAddons?: ISelectedAddonsS[] | null
    ) {
        this.addons = addons;
        this.addonsWithRatePlans = ratePlanAddons;
        this.priceBrakedowns = priceBrakedowns;
        this.numberOfRooms = numberOfRooms;
        this.noOfDays = noOfDays;
        this.noOfPersons = noOfPersons;
        this.startDate = startDate;
        this.endDate = endDate;
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
            addonBrakeDown: sumAddons,
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

            // sum up per-date prices
            const perDateTotal = availableEntries.reduce(
                (sum, avail) => sum + Number(avail.price),
                0
            );

            const userSelectedAddon = this.parsedAddons?.find(
                pa => pa.addOnId === addon.id
            );
            const quantity = userSelectedAddon
                ? userSelectedAddon.availability.reduce(
                    (sum, a) => sum + (a.quantity || 1),
                    0
                )
                : 1;

            const avgPrice = perDateTotal / availableEntries.length;
            const totalAmount = avgPrice * quantity;

            addonBrakeDown.push({
                addonId: addon.id,
                name: addon.name,
                amount: avgPrice,
                quantity,
                totalAmount,
                currencyCode: addon.availability[0]
                    .currencyCode as CurrencyCode,
                date: new Date(availableEntries[0].date).toDateString(),
            });
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
            const availableEntries = addon.addon.availability.filter(avail => {
                const availDate = new Date(avail.date);
                return (
                    availDate >= this.startDate &&
                    availDate < this.endDate &&
                    avail.isAvailable
                );
            });

            if (availableEntries.length === 0) return;

            // sum up per-date prices
            const perDateTotal = availableEntries.reduce(
                (sum, avail) => sum + Number(avail.price),
                0
            );

            let quantity = 1;
            switch (addon.addon.postingRhythm) {
                case 'per_night':
                    quantity = availableEntries.length;
                    break;
                case 'per_stay':
                    quantity = 1;
                    break;
                case 'per_person_per_night':
                    quantity = this.noOfPersons * availableEntries.length;
                    break;
                case 'per_person_per_stay':
                    quantity = this.noOfPersons;
                    break;
                case 'per_room':
                    quantity = this.numberOfRooms;
                    break;
                case 'per_room_per_night':
                    quantity = this.numberOfRooms * availableEntries.length;
                    break;
                case 'per_person_per_room':
                    quantity = this.noOfPersons * this.numberOfRooms;
                    break;
                default:
                    quantity = 1;
            }

            const avgPrice = perDateTotal / availableEntries.length;
            const totalAmount = avgPrice * quantity;

            addonBrakeDown.push({
                addonId: addon.addon.id,
                name: addon.addon.name,
                amount: avgPrice,
                quantity,
                totalAmount,
                currencyCode: addon.addon.availability[0]
                    .currencyCode as CurrencyCode,
                date: new Date(availableEntries[0].date).toDateString(),
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
        priceBrakeDown: PriceBrakeDown
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
    }
    public async promotionPrices(country?: string): Promise<PriceBrakeDown> {
        const { autoAppliedMLOS, autoAppliedPromotions } =
            await this.fetchAllAutoAppliedPromotions();
        const autoAppliedMlosBrakeDown =
            this.calculateAutoAppliedMLOSPrices(autoAppliedMLOS);
        const autoAppliedPromotionBrakeDown =
            this.calculateAutoAppliedPromotionPrices(autoAppliedPromotions);
        const mlsoBrakeDown = this.calculateAutoAppliedMLOSPrices(this.mlos);
        const promotionBrakeDown = this.calculateAutoAppliedPromotionPrices(
            this.promotions
        );
        const geoPriceBrakedown = this.calculateGeoLocation(country);

        const totalPromotionalBrakeDown = [
            ...autoAppliedMlosBrakeDown,
            ...autoAppliedPromotionBrakeDown,
            ...mlsoBrakeDown,
            ...promotionBrakeDown,
            ...geoPriceBrakedown,
        ];
        const totalPromotionaalDiscountedAmount =
            totalPromotionalBrakeDown.reduce((sum, promo) => {
                if (promo.restrictionType === 'decrease') {
                    return sum + promo.discountAmount; // debug here for promotion decrease
                } else {
                    return sum - promo.discountAmount;
                }
            }, 0);
        console.log(
            'totalPromotionaalDiscountedAmount',
            totalPromotionaalDiscountedAmount
        );
        return {
            ...this.priceBrakeDown,
            totalPromotionAmount: totalPromotionaalDiscountedAmount,
            totalAmount:
                this.priceBrakeDown.totalAmount -
                totalPromotionaalDiscountedAmount,
            currentChargeableAmount:this.priceBrakeDown.currentChargeableAmount -
                totalPromotionaalDiscountedAmount,
            promotionBrakeDown: totalPromotionalBrakeDown,
        };
    }
    private differenceReservationDays(startDate: Date, endDate: Date): number {
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffInMs = endDate.getTime() - startDate.getTime();
        return Math.ceil(diffInMs / msPerDay);
    }
    private async fetchAllAutoAppliedPromotions() {
        const [autoAppliedMLOS, autoAppliedPromotions] = await Promise.all([
            this.pricingRepository.fetchAutoAppliedMLOS(
                this.ratePlanId,
                this.startDate,
                this.endDate
            ),
            this.pricingRepository.getAutoAppliedPromotions(
                this.ratePlanId,
                this.startDate,
                this.endDate
            ),
        ]);
        return { autoAppliedMLOS, autoAppliedPromotions };
    }
    private calculateAutoAppliedMLOSPrices(mlos: IMLOS[]) {
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
                        name: 'MLOS',
                        currencyCode: mlos.currencyCode,
                        discountAmount:
                            (this.baseAmount * Number(mlos.discountValue)) /
                            100,
                        discountType: 'percentage',
                        discountValue: Number(mlos.discountValue),
                        restrictionType: 'decrease',
                    });
                } else if (mlos.discountType == 'flat') {
                    mlosBrakeDown.push({
                        name: 'MLOS',
                        currencyCode: mlos.currencyCode,
                        discountAmount: Number(mlos.discountValue),
                        discountValue: Number(mlos.discountValue),
                        discountType: 'flat',
                        restrictionType: 'decrease',
                    });
                }
            }
        });
        return mlosBrakeDown;
    }
    private calculateAutoAppliedPromotionPrices(
        autoAppliedPromotions: ICEbDsOftc[]
    ): PromotionBrakeDown[] {
        const promotionBrakeDown: PromotionBrakeDown[] = [];
        autoAppliedPromotions.forEach(promotion => {
            if (promotion.promotionType === 'early_bird') {
                const earlyBirdPromotionBrakeDown =
                    this.calculateEarlyBirdPromotionPrices(promotion);
                if (!earlyBirdPromotionBrakeDown) {
                    return;
                }
                promotionBrakeDown.push(earlyBirdPromotionBrakeDown);
            } else if (promotion.promotionType === 'offer_for_tonight') {
                const offerForTonightPromotionBrakeDown =
                    this.calculateOfferForTonightPromotionPrices(promotion);
                if (!offerForTonightPromotionBrakeDown) {
                    return;
                }
                promotionBrakeDown.push(offerForTonightPromotionBrakeDown);
            } else if (promotion.promotionType === 'device_specific') {
                const deviceBasedPromotionBrakeDown =
                    this.calculateDeviceBasedPromotionPrices(promotion);
                if (!deviceBasedPromotionBrakeDown) {
                    return;
                }
                promotionBrakeDown.push(deviceBasedPromotionBrakeDown);
            }
        });
        return promotionBrakeDown;
    }
    private calculateDeviceBasedPromotionPrices(
        promotion: ICEbDsOftc
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
                    name: 'Device Specific',
                    currencyCode: promotion.currencyCode,
                    discountAmount:
                        (this.baseAmount * Number(promotion.discountValue)) /
                        100,
                    discountType: 'percentage',
                    discountValue: Number(promotion.discountValue),
                    restrictionType: 'decrease',
                };
            } else if (promotion.discountType == 'flat') {
                return {
                    name: 'Device Specific',
                    currencyCode: promotion.currencyCode,
                    discountAmount: Number(promotion.discountValue),
                    discountType: 'flat',
                    discountValue: Number(promotion.discountValue),
                    restrictionType: 'decrease',
                };
            }
        }
        return null;
    }
    private calculateEarlyBirdPromotionPrices(
        promotion: ICEbDsOftc
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
                    name: 'Early Bird',
                    currencyCode: promotion.currencyCode,
                    discountAmount:
                        (this.baseAmount * Number(promotion.discountValue)) /
                        100,
                    discountType: 'percentage',
                    discountValue: Number(promotion.discountValue),
                    restrictionType: 'decrease',
                };
            } else if (promotion.discountType == 'flat') {
                return {
                    name: 'Early Bird',
                    currencyCode: promotion.currencyCode,
                    discountAmount: Number(promotion.discountValue),
                    discountType: 'flat',
                    discountValue: Number(promotion.discountValue),
                    restrictionType: 'decrease',
                };
            }
        }
        return null;
    }
    private calculateOfferForTonightPromotionPrices(
        promotion: ICEbDsOftc
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
            this.startDate.getTime() - todayDate.getTime() > 0;
        if (isOfferForTonightApplicable) {
            if (promotion.discountType == 'percentage') {
                return {
                    name: 'Offer For Tonight',
                    currencyCode: promotion.currencyCode,
                    discountAmount:
                        (this.baseAmount * Number(promotion.discountValue)) /
                        100,
                    discountType: 'percentage',
                    discountValue: Number(promotion.discountValue),
                    restrictionType: 'decrease',
                };
            } else if (promotion.discountType == 'flat') {
                return {
                    name: 'Offer For Tonight',
                    currencyCode: promotion.currencyCode,
                    discountAmount: Number(promotion.discountValue),
                    discountType: 'flat',
                    discountValue: Number(promotion.discountValue),
                    restrictionType: 'decrease',
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
        let promotionBrakehown: PromotionBrakeDown[] = [];
        if (!country) {
            return [];
        }
        this.geoRatePlans.map(geo => {
            if (geo.roomType && geo.roomType !== this.roomType) {
                return null;
            }
            if (geo.countryCode.includes(country)) {
                if (geo.restrictionType === "restricted") {
                    throw new Error(
                        `This room is restricted for this country  `
                    );
                } else if (geo.restrictionType == 'fixed') {
                    promotionBrakehown.push({
                        currencyCode: geo.currencyCode,
                        discountAmount: Number(geo.restrictionValue),
                        discountType: 'flat',
                        discountValue: Number(geo.restrictionValue),
                        name: 'Geo Restriction',
                        restrictionType: "decrease",
                    });
                } else if (geo.restrictionType === 'percentage') {
                    promotionBrakehown.push({
                        currencyCode: geo.currencyCode,
                        discountAmount:
                            (this.baseAmount * Number(geo.restrictionValue)) /
                            100,
                        discountType: 'flat',
                        discountValue: Number(geo.restrictionValue),
                        name: 'Geo Restriction',
                        restrictionType: "decrease",
                    });
                }
            }
        });
        return promotionBrakehown;
    }
}

class TouristTaxClass {
    touristTax: ITouristTax[];
    priceBrakedown: PriceBrakeDown;
    constructor(touristTax: ITouristTax[], priceBrakeDown: PriceBrakeDown) {
        this.touristTax = touristTax;
        this.priceBrakedown = priceBrakeDown;
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
            totalAmount: this.priceBrakedown.totalAmount + totalTouristCharges,
            promotionBrakeDown: [
                ...this.priceBrakedown.promotionBrakeDown,
                ...touristTaxes,
            ],
        };
    }
    private calculateTouristTaxvalue(
        touristTax: ITouristTax
    ): PromotionBrakeDown {
        if (touristTax.discountType === 'percentage') {
            return {
                name: touristTax.name ? touristTax.name : 'Tourist Tax',
                discountType: touristTax.discountType,
                discountValue: Number(touristTax.discountValue),
                currencyCode: touristTax.currencyCode,
                discountAmount:
                    (this.priceBrakedown.amountBeforeTax *
                        Number(touristTax.discountValue)) /
                    100,
                restrictionType: 'payLater',
            };
        } else {
            return {
                name: touristTax.name ? touristTax.name : 'Tourist Tax',
                discountType: touristTax.discountType,
                discountValue: Number(touristTax.discountValue),
                currencyCode: touristTax.currencyCode,
                discountAmount: Number(touristTax.discountValue),
                restrictionType: 'payLater',
            };
        }
    }
}
class LoyalityDiscountClass {
    guestEmail: string;
    propertyId: string;
    priceBrakedown: PriceBrakeDown;
    private pricingRepository: PricingRepository;

    constructor(
        guestEmail: string,
        propertyId: string,
        priceBrakedown: PriceBrakeDown
    ) {
        this.pricingRepository = new PricingRepository();
        this.guestEmail = guestEmail;
        this.propertyId = propertyId;
        this.priceBrakedown = priceBrakedown;
    }
    public async findLoyalityDiscount(): Promise<PriceBrakeDown> {
        const checkIfguestIsMember =
            await this.pricingRepository.findLoyalityGuest(
                this.guestEmail,
                this.propertyId
            );
        if (!checkIfguestIsMember) {
            return this.priceBrakedown;
        }
        const checkIfPropertyLoyalityIsActive =
            await this.pricingRepository.findPropertyLoyalityConfig(
                this.propertyId
            );
        if (!checkIfPropertyLoyalityIsActive) {
            return this.priceBrakedown;
        }
        const loyality = await this.pricingRepository.findLoyalityConfig(
            checkIfPropertyLoyalityIsActive
        );
        if (!loyality) {
            return this.priceBrakedown;
        }
        if (loyality.loyaltyDiscountType === 'percentage') {
            const loyaltyDiscount =
                (this.priceBrakedown.amountBeforeTax * loyality.discountValue) /
                100;
            return {
                ...this.priceBrakedown,
                loyalityDiscount: loyaltyDiscount,
                totalAmount: this.priceBrakedown.totalAmount - loyaltyDiscount,
            };
        } else {
            return {
                ...this.priceBrakedown,
                loyalityDiscount: loyality.discountValue,
                totalAmount:
                    this.priceBrakedown.totalAmount - loyality.discountValue,
            };
        }
    }
}
class PromoCodeDiscountClass {
    priceBrakedown: PriceBrakeDown;
    promoCode: string;
    roomType: string;
    ratePlan: string;
    deviceType: DeviceType;
    private pricingRepository: PricingRepository;

    constructor(
        priceBrakedown: PriceBrakeDown,
        promoCode: string,
        roomType: string,
        ratePlan: string,
        deviceType: DeviceType
    ) {
        this.priceBrakedown = priceBrakedown;
        this.promoCode = promoCode;
        this.pricingRepository = new PricingRepository();
        this.roomType = roomType;
        this.ratePlan = ratePlan;
        this.deviceType = deviceType;
    }
    public async findPromoCodeDiscount(): Promise<PriceBrakeDown> {
        const checkIfPromoCodeIsValid =
            await this.pricingRepository.findPromoCode(this.promoCode);
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
