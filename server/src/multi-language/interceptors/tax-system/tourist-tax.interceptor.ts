import { IApiResponse } from '../../../utils/return.types';
import { IGetTouristTax } from '../../../tax-system/interfaces';
import { TouristTaxTranslation } from '../../models/features/tax-system/tourist-tax.model';

export class TouristTaxInterceptor {
    public static async intercept(
        response: IApiResponse<IGetTouristTax | IGetTouristTax[]>,
        locale: string
    ): Promise<IApiResponse<IGetTouristTax | IGetTouristTax[]>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = response.data;

            if (Array.isArray(data)) {
                const translatedData = await Promise.all(
                    data.map((tax) => this.attachTouristTaxTranslation(tax, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedTax = await this.attachTouristTaxTranslation(data, locale);
                return { ...response, data: translatedTax };
            }
        } catch (error) {
            console.error(`[TouristTaxInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachTouristTaxTranslation(tax: any, locale: string): Promise<any> {
        if (!tax?.id) return tax;

        const result = { ...tax };

        const taxTranslation = await TouristTaxTranslation.getTranslated(tax.id, locale);
        if (taxTranslation) {
            result._translations = taxTranslation;
        }

        return result;
    }
}
