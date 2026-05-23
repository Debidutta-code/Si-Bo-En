import { IApiResponse } from '../../../utils/return.types';
import { PropertyTranslation } from '../../models/property/property.model';

export class PropertyLoyalityProgramInterceptor {
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
            console.error(`[PropertyLoyalityProgramInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachTranslation(item: any, locale: string): Promise<any> {
        if (!item || !item.propertyId) return item;
        const result = { ...item };

        const translation = await PropertyTranslation.getTranslated(item.propertyId, locale);
        if (translation) {
            result._translations = translation;
        }

        return result;
    }
}
