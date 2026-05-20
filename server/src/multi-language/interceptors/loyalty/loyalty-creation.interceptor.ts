import { IApiResponse } from '../../../utils/return.types';
import { LoyaltySpecialConditionTranslation } from '../../models/features/loyalty/loyalty-configs.model';
import { MasterLoyaltyRegistrationFieldTranslation } from '../../models/masters/loyalty.master.model';

export class LoyaltyCreationInterceptor {
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
            console.error(`[LoyaltyCreationInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachTranslation(item: any, locale: string): Promise<any> {
        if (!item) return item;
        const result = { ...item };

        // Attach translations for fields
        if (result.LoyaltyProgramFieldConfig && Array.isArray(result.LoyaltyProgramFieldConfig)) {
            result.LoyaltyProgramFieldConfig = await Promise.all(
                result.LoyaltyProgramFieldConfig.map(async (field: any) => {
                    if (!field.masterRegistrationFieldId) return field;
                    const translatedField = { ...field };
                    const translation = await MasterLoyaltyRegistrationFieldTranslation.getTranslated(field.masterRegistrationFieldId, locale);
                    if (translation) {
                        translatedField._translations = translation;
                    }
                    return translatedField;
                })
            );
        }

        // Attach translations to special conditions
        if (result.loyaltySpecialConditions && Array.isArray(result.loyaltySpecialConditions)) {
            result.loyaltySpecialConditions = await Promise.all(
                result.loyaltySpecialConditions.map(async (cond: any) => {
                    if (!cond.id) return cond;
                    const translatedCond = { ...cond };
                    const translation = await LoyaltySpecialConditionTranslation.getTranslated(cond.id, locale);
                    if (translation) {
                        translatedCond._translations = translation;
                    }
                    return translatedCond;
                })
            );
        }

        return result;
    }
}
