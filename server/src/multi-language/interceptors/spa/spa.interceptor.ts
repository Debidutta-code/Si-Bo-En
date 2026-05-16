import { IApiResponse } from '../../../utils/return.types';
import { SpaTranslation } from '../../models/features/spa/spa.model';
import { SpaCategoryTranslation, SpaSubCategoryTranslation } from '../../models/masters/spa-type.model';

export class SpaInterceptor {
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
                    data.map((spa) => this.attachSpaTranslation(spa, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedSpa = await this.attachSpaTranslation(data, locale);
                return { ...response, data: translatedSpa };
            }
        } catch (error) {
            console.error(`[SpaInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachSpaTranslation(spa: any, locale: string): Promise<any> {
        if (!spa?.id) return spa;

        const result = { ...spa };

        // 1. Translate the main Spa entity
        const spaTranslation = await SpaTranslation.getTranslated(spa.id, locale);
        if (spaTranslation) {
            result._translations = spaTranslation;
        }

        // 2. Translate nested Category
        if (result.Category?.id) {
            const categoryTranslation = await SpaCategoryTranslation.getTranslated(result.Category.id, locale);
            if (categoryTranslation) {
                result.Category = { ...result.Category, _translations: categoryTranslation };
            }
        }

        // 3. Translate nested SubCategory
        if (result.SubCategory?.id) {
            const subCategoryTranslation = await SpaSubCategoryTranslation.getTranslated(result.SubCategory.id, locale);
            if (subCategoryTranslation) {
                result.SubCategory = { ...result.SubCategory, _translations: subCategoryTranslation };
            }
        }

        return result;
    }
}
