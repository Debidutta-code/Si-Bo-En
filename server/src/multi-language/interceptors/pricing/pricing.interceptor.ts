import { IApiResponse } from '../../../utils/return.types';
import { TaxRuleTranslation } from '../../models/features/tax-system/tax-system.model';
import { TouristTaxTranslation } from '../../models/features/tax-system/tourist-tax.model';
import { PromotionTranslation } from '../../models/features/promotions/promotion.model';
import { AddonTranslation } from '../../models/features/addons/addon.model';

export class PricingInterceptor {
    public static async interceptPricing(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const result = { ...response.data };

            if (Array.isArray(result.taxBrakeDown)) {
                result.taxBrakeDown = await Promise.all(
                    result.taxBrakeDown.map(async (tax: any) => {
                        if (tax.id) {
                            const translation = await TaxRuleTranslation.getTranslated(tax.id, locale);
                            if (translation) {
                                return { ...tax, _translations: translation };
                            }
                        }
                        return tax;
                    })
                );
            }

            if (Array.isArray(result.promotionBrakeDown)) {
                result.promotionBrakeDown = await Promise.all(
                    result.promotionBrakeDown.map(async (promo: any) => {
                        if (promo.id) {
                            if (promo.restrictionType === 'payLater') {
                                // Tourist tax
                                const translation = await TouristTaxTranslation.getTranslated(promo.id, locale);
                                if (translation) {
                                    return { ...promo, _translations: translation };
                                }
                            } else {
                                // Normal promotion
                                const translation = await PromotionTranslation.getTranslated(promo.id, locale);
                                if (translation) {
                                    return { ...promo, _translations: translation };
                                }
                            }
                        }
                        return promo;
                    })
                );
            }

            if (Array.isArray(result.addonBrakeDowns)) {
                result.addonBrakeDowns = await Promise.all(
                    result.addonBrakeDowns.map(async (addon: any) => {
                        if (addon.addonId) {
                            const translation = await AddonTranslation.getTranslated(addon.addonId, locale);
                            if (translation) {
                                return { ...addon, _translations: translation };
                            }
                        }
                        return addon;
                    })
                );
            }

            return { ...response, data: result };
        } catch (error) {
            console.error(`[PricingInterceptor Error]:`, error);
            return response;
        }
    }
}
