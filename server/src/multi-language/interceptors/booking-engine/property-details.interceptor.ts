import { PropertyTranslation } from '../../models/property/property.model';
import { PropertyAddressTranslation } from '../../models/property/property-address.model';

export class PropertyDetailsInterceptor {
    public static async intercept(response: any, locale: string): Promise<any> {
        // Nothing to translate for English or failed responses
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = { ...response.data };

            // ── 1. Property name ──────────────────────────────────────────────
            if (data.id) {
                const propertyTranslation = await PropertyTranslation.getTranslated(
                    data.id,
                    locale
                );
                if (propertyTranslation) {
                    data._translations = propertyTranslation;
                }
            }

            // ── 2. Property address ───────────────────────────────────────────
            // Keyed by propertyId (same pattern as BookingEngineRoomsInterceptor)
            const address = data.propertyAddress;
            if (address?.propertyId) {
                const addressTranslation = await PropertyAddressTranslation.getTranslated(
                    address.propertyId,
                    locale
                );
                if (addressTranslation) {
                    data.propertyAddress = {
                        ...address,
                        _translations: addressTranslation,
                    };
                }
            }

            return { ...response, data };
        } catch (error) {
            console.error('[PropertyDetailsInterceptor Error]:', error);
            return response; // always return original on failure
        }
    }
}