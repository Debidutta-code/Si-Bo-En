import { IAddonSubCategory } from '../../../add-on/interfaces';
import { IApiResponse } from '../../../utils/return.types';
import { AddonSubCategoryTranslation } from '../../models/features/addons/sub-catrgory.model';
import { AddonVariantTranslation } from '../../models/features/addons/variant.model';
import { AddonTranslation } from '../../models/features/addons/addon.model';

export class SubCategoryInterceptor {
    public static async intercept(
        response: IApiResponse<IAddonSubCategory | IAddonSubCategory[]>,
        locale: string
    ): Promise<IApiResponse<IAddonSubCategory | IAddonSubCategory[]>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = response.data;

            if (Array.isArray(data)) {
                const translatedData = await Promise.all(
                    data.map((subCategory) => this.attachTranslation(subCategory, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedSubCategory = await this.attachTranslation(data, locale);
                return { ...response, data: translatedSubCategory };
            }
        } catch (error) {
            console.error(`[SubCategoryInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachTranslation(subCategory: any, locale: string): Promise<any> {
        if (!subCategory?.id) return subCategory;

        const result = { ...subCategory };

        // ── Main SubCategory ────────────────────────────────────────────────────
        const translation = await AddonSubCategoryTranslation.getTranslated(subCategory.id, locale);
        if (translation) {
            result._translations = translation;
        }

        // ── Nested Addons ───────────────────────────────────────────────────────
        if (subCategory.addons && Array.isArray(subCategory.addons)) {
            result.addons = await Promise.all(
                subCategory.addons.map(async (addon: any) => {
                    if (!addon?.id) return addon;
                    const addonTranslation = await AddonTranslation.getTranslated(
                        addon.id,
                        locale
                    );
                    return {
                        ...addon,
                        ...(addonTranslation && { _translations: addonTranslation }),
                    };
                })
            );
        }

        // ── Nested Variants ─────────────────────────────────────────────────────
        if (subCategory.variants && Array.isArray(subCategory.variants)) {
            result.variants = await Promise.all(
                subCategory.variants.map(async (variant: any) => {
                    if (!variant?.id) return variant;
                    const variantTranslation = await AddonVariantTranslation.getTranslated(
                        variant.id,
                        locale
                    );
                    return {
                        ...variant,
                        ...(variantTranslation && { _translations: variantTranslation }),
                    };
                })
            );
        }

        return result;
    }
}
