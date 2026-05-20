import { IApiResponse } from '../../../utils/return.types';
import { MasterLoyaltyRegistrationFieldTranslation } from '../../models/masters/loyalty.master.model';

export class LoyaltyFieldInterceptor {
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
                    data.map((field) => this.attachTranslation(field, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedField = await this.attachTranslation(data, locale);
                return { ...response, data: translatedField };
            }
        } catch (error) {
            console.error(`[LoyaltyFieldInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachTranslation(field: any, locale: string): Promise<any> {
        // If masterRegistrationFieldId isn't present, we cannot query translation
        // (If the api returns just "id" which maps to LoyaltyProgramFieldConfig, we need to locate masterRegistrationFieldId)
        if (!field) return field;

        const masterFieldId = field.masterRegistrationFieldId;
        if (!masterFieldId) return field;

        const result = { ...field };

        const translation = await MasterLoyaltyRegistrationFieldTranslation.getTranslated(masterFieldId, locale);

        if (translation) {
            result._translations = translation;
        }

        return result;
    }
}
