import { IApiResponse } from '../../../utils/return.types';
import { MasterPropertyTypeTranslation } from '../../models/property/property-masters.model';

export class MasterPropertyTypeInterceptor {
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
                const translatedItem = await this.attachTranslation(data, locale);
                return { ...response, data: translatedItem };
            }
        } catch (error) {
            console.error(`[MasterPropertyTypeInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachTranslation(item: any, locale: string): Promise<any> {
        if (!item?.id) return item;

        const result = { ...item };

        const translation = await MasterPropertyTypeTranslation.getTranslated(item.id, locale);
        if (translation) {
            result._translations = translation;
        }

        return result;
    }
}
