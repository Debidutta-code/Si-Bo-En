import { IApiResponse } from '../../../utils/return.types';
import { PolicyTranslation } from '../../models/ari/policy.model';

export class PolicyInterceptor {
    public static async intercept(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        // If response failed, has no data, or locale is English — return as-is
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = response.data;

            if (data?.allPolicies && Array.isArray(data.allPolicies)) {
                const translatedPolicies = await Promise.all(
                    data.allPolicies.map((policy: any) => this.attachPolicyTranslation(policy, locale))
                );
                return { ...response, data: { ...data, allPolicies: translatedPolicies } };
            } else if (Array.isArray(data)) {
                const translatedData = await Promise.all(
                    data.map((policy: any) => this.attachPolicyTranslation(policy, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedPolicy = await this.attachPolicyTranslation(data, locale);
                return { ...response, data: translatedPolicy };
            }

        } catch (error) {
            console.error(`[PolicyInterceptor Error]:`, error);
            return response; // Graceful fallback — primary data is always safe
        }
    }

    private static async attachPolicyTranslation(policy: any, locale: string): Promise<any> {
        if (!policy?.id) return policy;

        const result = { ...policy }; // Clone — never mutate the original

        // ── Main Policy ──────────────────────────────────────────────────────────
        const policyTranslation = await PolicyTranslation.getTranslated(policy.id, locale);
        if (policyTranslation) {
            result._translations = policyTranslation;
        }

        return result;
    }
}
