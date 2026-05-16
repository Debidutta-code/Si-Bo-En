import { IApiResponse } from '../../../utils/return.types';
import { RatePlanTranslation } from '../../models/ari/rate-plan.model';
import { PolicyTranslation } from '../../models/ari/policy.model';

export class RatePlanInterceptor {
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
                    data.map((ratePlan) => this.attachRatePlanTranslation(ratePlan, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedRatePlan = await this.attachRatePlanTranslation(data, locale);
                return { ...response, data: translatedRatePlan };
            }
        } catch (error) {
            console.error(`[RatePlanInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachRatePlanTranslation(ratePlan: any, locale: string): Promise<any> {
        if (!ratePlan?.id) return ratePlan;

        const result = { ...ratePlan };

        const ratePlanTranslation = await RatePlanTranslation.getTranslated(ratePlan.id, locale);
        if (ratePlanTranslation) {
            result._translations = ratePlanTranslation;
        }

        if (result.depositPolicy?.id) {
            const policyTranslation = await PolicyTranslation.getTranslated(result.depositPolicy.id, locale);
            if (policyTranslation) {
                result.depositPolicy = { ...result.depositPolicy, _translations: policyTranslation };
            }
        }

        if (result.cancellationPolicy?.id) {
            const policyTranslation = await PolicyTranslation.getTranslated(result.cancellationPolicy.id, locale);
            if (policyTranslation) {
                result.cancellationPolicy = { ...result.cancellationPolicy, _translations: policyTranslation };
            }
        }

        if (result.guaranteePolicy?.id) {
            const policyTranslation = await PolicyTranslation.getTranslated(result.guaranteePolicy.id, locale);
            if (policyTranslation) {
                result.guaranteePolicy = { ...result.guaranteePolicy, _translations: policyTranslation };
            }
        }

        return result;
    }
}
