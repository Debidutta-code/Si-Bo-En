import { IApiResponse } from '../../../utils/return.types';
import { ICTaxGroup } from '../../../tax-system/interfaces';
import { TaxGroupTranslation, TaxRuleTranslation } from '../../models/features/tax-system/tax-system.model';

export class TaxGroupInterceptor {
    public static async intercept(
        response: IApiResponse<ICTaxGroup | ICTaxGroup[]>,
        locale: string
    ): Promise<IApiResponse<ICTaxGroup | ICTaxGroup[]>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = response.data;

            if (Array.isArray(data)) {
                const translatedData = await Promise.all(
                    data.map((group) => this.attachTaxGroupTranslation(group, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedGroup = await this.attachTaxGroupTranslation(data, locale);
                return { ...response, data: translatedGroup };
            }
        } catch (error) {
            console.error(`[TaxGroupInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachTaxGroupTranslation(group: any, locale: string): Promise<any> {
        if (!group?.id) return group;

        const result = { ...group };

        // Main TaxGroup translation
        const groupTranslation = await TaxGroupTranslation.getTranslated(group.id, locale);
        if (groupTranslation) {
            result._translations = groupTranslation;
        }

        // Nested TaxGroupRules
        if (result.taxGroupRules && Array.isArray(result.taxGroupRules)) {
            result.taxGroupRules = await Promise.all(
                result.taxGroupRules.map(async (ruleRel: any) => {
                    const mappedRel = { ...ruleRel };
                    if (mappedRel.taxRule && mappedRel.taxRule.id) {
                        const taxRuleTranslation = await TaxRuleTranslation.getTranslated(mappedRel.taxRule.id, locale);
                        if (taxRuleTranslation) {
                            mappedRel.taxRule = {
                                ...mappedRel.taxRule,
                                _translations: taxRuleTranslation
                            };
                        }
                    }
                    return mappedRel;
                })
            );
        }

        return result;
    }
}
