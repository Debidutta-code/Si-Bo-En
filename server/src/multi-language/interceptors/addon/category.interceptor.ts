import { IAddOnCategory } from '../../../add-on/interfaces';
import { IApiResponse } from '../../../utils/return.types';
import { AddonCategoryTranslation } from '../../models/features/addons/category.model';
import { AddonSubCategoryTranslation } from '../../models/features/addons/sub-catrgory.model';

export class CategoryInterceptor {
    public static async intercept(
        response: IApiResponse<IAddOnCategory | IAddOnCategory[]>,
        locale: string
    ): Promise<IApiResponse<IAddOnCategory | IAddOnCategory[]>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = response.data;

            if (Array.isArray(data)) {
                const translatedData = await Promise.all(
                    data.map((category) => this.attachTranslation(category, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedCategory = await this.attachTranslation(data, locale);
                return { ...response, data: translatedCategory };
            }
        } catch (error) {
            console.error(`[CategoryInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachTranslation(category: any, locale: string): Promise<any> {
        if (!category?.id) return category;

        const result = { ...category };

        // ── Main Category ───────────────────────────────────────────────────────
        const translation = await AddonCategoryTranslation.getTranslated(category.id, locale);
        if (translation) {
            result._translations = translation;
        }

        // ── Nested SubCategories ────────────────────────────────────────────────
        if (category.subcategories && Array.isArray(category.subcategories)) {
            result.subcategories = await Promise.all(
                category.subcategories.map(async (subCategory: any) => {
                    if (!subCategory?.id) return subCategory;
                    const subCategoryTranslation = await AddonSubCategoryTranslation.getTranslated(
                        subCategory.id,
                        locale
                    );
                    return {
                        ...subCategory,
                        ...(subCategoryTranslation && { _translations: subCategoryTranslation }),
                    };
                })
            );
        }

        return result;
    }
}
