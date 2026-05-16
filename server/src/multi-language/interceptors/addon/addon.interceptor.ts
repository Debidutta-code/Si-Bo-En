import { IAddon } from '../../../add-on/interfaces';
import { IApiResponse } from '../../../utils/return.types';
import { AddonTranslation } from '../../models/features/addons/addon.model';
import { AddonCategoryTranslation } from '../../models/features/addons/category.model';
import { AddonSubCategoryTranslation } from '../../models/features/addons/sub-catrgory.model';
import { AddonVariantTranslation } from '../../models/features/addons/variant.model';

export class AddonInterceptor {

    public static async intercept(
        response: IApiResponse<IAddon[]>,
        locale: string
    ): Promise<IApiResponse<IAddon[]>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = response.data;

            // 2. Handle Array of Addons
            if (Array.isArray(data)) {
                const translatedData = await Promise.all(
                    data.map(async (addon) => {
                        return await this.applyAddonTranslation(addon, locale);
                    })
                );
                return { ...response, data: translatedData };
            }
            
            // 3. Handle Single Addon Object
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
