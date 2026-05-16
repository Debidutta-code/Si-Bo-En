import { IApiResponse } from '../../../utils/return.types';
import { LoyaltyConditionsTranslation } from '../../models/features/loyalty/loyalty-configs.model';

export class LoyaltyConditionInterceptor {
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
                    data.map((condition) => this.attachTranslation(condition, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedCondition = await this.attachTranslation(data, locale);
                return { ...response, data: translatedCondition };
            }
        } catch (error) {
            console.error(`[LoyaltyConditionInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachTranslation(condition: any, locale: string): Promise<any> {
        if (!condition?.id) return condition;

        const result = { ...condition };

        const translation = await LoyaltyConditionsTranslation.getTranslated(condition.id, locale);
        if (translation) {
            result._translations = translation;
        }

        return result;
    }
}
