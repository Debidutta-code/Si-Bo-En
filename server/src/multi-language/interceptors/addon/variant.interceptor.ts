import { IAddonVariant } from '../../../add-on/interfaces';
import { IApiResponse } from '../../../utils/return.types';
import { AddonVariantTranslation } from '../../models/features/addons/variant.model';

export class VariantInterceptor {
    public static async intercept(
        response: IApiResponse<IAddonVariant | IAddonVariant[]>,
        locale: string
    ): Promise<IApiResponse<IAddonVariant | IAddonVariant[]>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = response.data;

            if (Array.isArray(data)) {
                const translatedData = await Promise.all(
                    data.map((variant) => this.attachTranslation(variant, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedVariant = await this.attachTranslation(data, locale);
                return { ...response, data: translatedVariant };
            }
        } catch (error) {
            console.error(`[VariantInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachTranslation(variant: any, locale: string): Promise<any> {
        if (!variant?.id) return variant;

        const result = { ...variant };

        // ── Main Variant ────────────────────────────────────────────────────────
        const translation = await AddonVariantTranslation.getTranslated(variant.id, locale);
        if (translation) {
            result._translations = translation;
        }

        return result;
    }
}
