import { IApiResponse } from '../../../utils/return.types';
import { ICTaxRule } from '../../../tax-system/interfaces';
import { TaxRuleTranslation, TaxGroupTranslation } from '../../models/features/tax-system/tax-system.model';

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

        if (Array.isArray(result.taxGroupRules) && result.taxGroupRules.length > 0) {
            result.taxGroupRules = await Promise.all(
                result.taxGroupRules.map(async (groupRule: any) => {
                    const grResult = { ...groupRule };
                    if (grResult.taxGroup && grResult.taxGroup.id) {
                        const taxGroupTranslation = await TaxGroupTranslation.getTranslated(
                            grResult.taxGroup.id,
                            locale
                        );
                        if (taxGroupTranslation) {
                            grResult.taxGroup = {
                                ...grResult.taxGroup,
                                _translations: taxGroupTranslation
                            };
                        }
                    }
                    return grResult;
                })
            );
        }

        return result;
    }
}
