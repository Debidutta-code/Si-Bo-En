import { IApiResponse } from '../../../utils/return.types';
import { PromoCodeTranslation } from '../../models/features/promocodes/promocodes.model';

export class PromoCodeInterceptor {
    public static async interceptGetAllByPropertyId(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }
        try {
            const data = response.data;
            if (!Array.isArray(data)) return response;

            const translated = await Promise.all(
                data.map(async (promoCode: any) => {
                    if (!promoCode?.id) return promoCode;
                    const translation = await PromoCodeTranslation.getTranslated(promoCode.id, locale);
                    return translation ? { ...promoCode, _translations: translation } : promoCode;
                })
            );
            return { ...response, data: translated };
        } catch (error) {
            console.error(`[PromoCodeInterceptor Error]:`, error);
            return response;
        }
    }
}
