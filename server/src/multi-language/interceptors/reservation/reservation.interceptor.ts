import { IApiResponse } from '../../../utils/return.types';
import { PromotionTranslation } from '../../models/features/promotions/promotion.model';
import { TouristTaxTranslation } from '../../models/features/tax-system/tourist-tax.model';
import { AddonTranslation } from '../../models/features/addons/addon.model';
import { PropertyTranslation } from '../../models/property/property.model';
import { SpaTranslation } from '../../models/features/spa/spa.model';
import { TaxRuleTranslation } from '../../models/features/tax-system/tax-system.model';

export class ReservationInterceptor {
    public static async intercept(
        response: IApiResponse<any | any[]>,
        locale: string
    ): Promise<IApiResponse<any | any[]>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = response.data;
            if (Array.isArray(data)) {
                const translatedData = await Promise.all(
                    data.map((item) => this.attachTranslation(item, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedData = await this.attachTranslation(data, locale);
                return { ...response, data: translatedData };
            }
        } catch (error) {
            console.error(`[ReservationInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachTranslation(reservation: any, locale: string): Promise<any> {
        if (!reservation) return reservation;
        const result = { ...reservation };

        // Handle Property Translation
        if (result.property && result.property.id) {
            const propertyTranslation = await PropertyTranslation.getTranslated(result.property.id, locale);
            if (propertyTranslation) {
                result.property = {
                    ...result.property,
                    _translations: propertyTranslation
                };
            }
        }

        if (!result.PricingBrakeDown) {
            return result;
        }

        const pricing = { ...result.PricingBrakeDown };

        // Handle Addons
        if (pricing.AddonBrakeDowns && Array.isArray(pricing.AddonBrakeDowns)) {
            pricing.AddonBrakeDowns = await Promise.all(
                pricing.AddonBrakeDowns.map(async (addon: any) => {
                    const translatedAddon = { ...addon };
                    if (addon.addonId) {
                        const translation = await AddonTranslation.getTranslated(addon.addonId, locale);
                        if (translation) {
                            translatedAddon._translations = translation;
                        }
                    }
                    return translatedAddon;
                })
            );
        }

        // Handle Taxes
        if (pricing.taxBrakeDown && Array.isArray(pricing.taxBrakeDown)) {
            pricing.taxBrakeDown = await Promise.all(
                pricing.taxBrakeDown.map(async (tax: any) => {
                    const translatedTax = { ...tax };
                    // If we have an ID for the tax rule (added recently during pricing interceptor changes)
                    if (tax.id) {
                        const translation = await TaxRuleTranslation.getTranslated(tax.id, locale);
                        if (translation) {
                            translatedTax._translations = translation;
                        }
                    }
                    return translatedTax;
                })
            );
        }

        // Handle Promotions & PayLater
        if (pricing.promotionBrakeDown && Array.isArray(pricing.promotionBrakeDown)) {
            pricing.promotionBrakeDown = await Promise.all(
                pricing.promotionBrakeDown.map(async (promo: any) => {
                    const translatedPromo = { ...promo };
                    if (promo.id) {
                        if (promo.restrictionType === 'payLater') {
                            const translation = await TouristTaxTranslation.getTranslated(promo.id, locale);
                            if (translation) {
                                translatedPromo._translations = translation;
                            }
                        } else {
                            const translation = await PromotionTranslation.getTranslated(promo.id, locale);
                            if (translation) {
                                translatedPromo._translations = translation;
                            }
                        }
                    }
                    return translatedPromo;
                })
            );
        }

        // Handle SpaPricingBrakeDowns
        if (pricing.SpaPricingBrakeDowns && Array.isArray(pricing.SpaPricingBrakeDowns)) {
            pricing.SpaPricingBrakeDowns = await Promise.all(
                pricing.SpaPricingBrakeDowns.map(async (spaPricing: any) => {
                    const translatedSpaPricing = { ...spaPricing };
                    if (spaPricing.spaId) {
                        const translation = await SpaTranslation.getTranslated(spaPricing.spaId, locale);
                        if (translation) {
                            translatedSpaPricing._translations = translation;
                        }
                    } else if (spaPricing.id) {
                        // Fallback in case the item drops spaId but has an item id (depending on payload variant)
                        const translation = await SpaTranslation.getTranslated(spaPricing.id, locale);
                         if (translation) {
                            translatedSpaPricing._translations = translation;
                        }
                    }
                    return translatedSpaPricing;
                })
            );
        }

        result.PricingBrakeDown = pricing;
        return result;
    }
}
