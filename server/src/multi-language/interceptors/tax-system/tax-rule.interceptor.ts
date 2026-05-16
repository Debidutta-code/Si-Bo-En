import { IApiResponse } from '../../../utils/return.types';
import { ICTaxRule } from '../../../tax-system/interfaces';
import { TaxRuleTranslation } from '../../models/features/tax-system/tax-system.model';

export class TaxRuleInterceptor {
    public static async intercept(
        response: IApiResponse<ICTaxRule | ICTaxRule[]>,
        locale: string
    ): Promise<IApiResponse<ICTaxRule | ICTaxRule[]>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = response.data;

            if (Array.isArray(data)) {
                const translatedData = await Promise.all(
                    data.map((rule) => this.attachTaxRuleTranslation(rule, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedRule = await this.attachTaxRuleTranslation(data, locale);
                return { ...response, data: translatedRule };
            }
        } catch (error) {
            console.error(`[TaxRuleInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachTaxRuleTranslation(rule: any, locale: string): Promise<any> {
        if (!rule?.id) return rule;

        const result = { ...rule };

        const ruleTranslation = await TaxRuleTranslation.getTranslated(rule.id, locale);
        if (ruleTranslation) {
            result._translations = ruleTranslation;
        }

        return result;
    }
}
