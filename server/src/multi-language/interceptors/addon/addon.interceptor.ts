import { IAddon } from '../../../add-on/interfaces';
import { IApiResponse } from '../../../utils/return.types';
import { AddonTranslation } from '../../models/features/addons/addon.model';
import { AddonCategoryTranslation } from '../../models/features/addons/category.model';
import { AddonSubCategoryTranslation } from '../../models/features/addons/sub-catrgory.model';
import { AddonVariantTranslation } from '../../models/features/addons/variant.model';

export class AddonInterceptor {

    public static async intercept(
        response: IApiResponse<any>, // Update type from IAddon[] to any
        locale: string
    ): Promise<IApiResponse<any>> { // Update type from IAddon[] to any
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            let data = response.data;

            // 1. Intercept available addons API format (addon date-wise array)
            if (Array.isArray(data)) {
                const translatedData = await Promise.all(
                    data.map(async (item: any) => {
                        // Check if it's an addon datewise array which has addon object nested
                        if (item.addon && item.addon.id) {
                            const translatedAddon = await this.applyAddonTranslation(item.addon, locale);
                            return { ...item, addon: translatedAddon };
                        } else {
                            // Or it's a plain addon array
                            return await this.applyAddonTranslation(item, locale);
                        }
                    })
                );
                return { ...response, data: translatedData };
            }
            
            // 2. Handle Single Addon Object
            else {
                const translatedAddon = await this.applyAddonTranslation(data, locale);
                return { ...response, data: translatedAddon };
            }
        } catch (error) {
            console.error(`[AddonInterceptor Error]:`, error);
            return response;
        }
    }

    private static async applyAddonTranslation(addon: any, locale: string): Promise<any> {
        if (!addon || !addon.id) return addon;

        const result = { ...addon };

        // ── Main Addon ──────────────────────────────────────────────────────────
        const addonTranslation = await AddonTranslation.getTranslated(addon.id, locale);
        if (addonTranslation) {
            result._translations = addonTranslation;
        }

        // ── Nested Category ─────────────────────────────────────────────────────
        if (addon.category && addon.categoryId) {
            const categoryTranslation = await AddonCategoryTranslation.getTranslated(addon.categoryId, locale);
            result.category = {
                ...addon.category,
                ...(categoryTranslation && { _translations: categoryTranslation }),
            };
        }

        // ── Nested SubCategory ──────────────────────────────────────────────────
        if (addon.subCategory && addon.subcategoryId) {
            const subCategoryTranslation = await AddonSubCategoryTranslation.getTranslated(addon.subcategoryId, locale);
            result.subCategory = {
                ...addon.subCategory,
                ...(subCategoryTranslation && { _translations: subCategoryTranslation }),
            };
        }

        // ── Nested Variant ──────────────────────────────────────────────────────
        if (addon.addonVariant && addon.variantId) {
            const variantTranslation = await AddonVariantTranslation.getTranslated(addon.variantId, locale);
            result.addonVariant = {
                ...addon.addonVariant,
                ...(variantTranslation && { _translations: variantTranslation }),
            };
        }

        return result;
    }
}
