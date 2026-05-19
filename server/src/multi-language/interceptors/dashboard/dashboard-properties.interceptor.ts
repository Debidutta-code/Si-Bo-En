import { IApiResponse } from '../../../utils/return.types';
import { PropertyTranslation } from '../../models/property/property.model';

/**
 * Interceptor for the dashboard `getPropertyByCreationId` endpoint.
 * Attaches `_translations` (propertyName, description) to each property
 * returned in the array when a non-English locale is requested.
 */
export class DashboardPropertiesInterceptor {
    public static async intercept(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        if (
            !response.success ||
            !Array.isArray(response.data) ||
            locale.toLowerCase() === 'en'
        ) {
            return response;
        }

        try {
            const translated = await Promise.all(
                response.data.map(async (property: any) => {
                    if (!property?.id) return property;

                    const translation = await PropertyTranslation.getTranslated(
                        property.id,
                        locale
                    );

                    return translation
                        ? { ...property, _translations: translation }
                        : property;
                })
            );

            return { ...response, data: translated };
        } catch (error) {
            console.error('[DashboardPropertiesInterceptor Error]:', error);
            return response;
        }
    }
}
