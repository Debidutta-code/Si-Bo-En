import { IApiResponse } from '../../../utils/return.types';
import { CreationTranslation } from '../../models/core/creation.model';
import { PropertyTranslation } from '../../models/property/property.model';

export class CreationInterceptor {
    public static async interceptGetCreationByRole(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }
        try {
            const data = response.data;
            if (Array.isArray(data)) {
                const translatedData = await Promise.all(
                    data.map((creation) => this.attachCreationTranslation(creation, locale))
                );
                return { ...response, data: translatedData };
            }
            return response;
        } catch (error) {
            console.error(`[CreationInterceptor Error]:`, error);
            return response;
        }
    }

    public static async interceptGetSpecificCreation(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }
        try {
            const data = response.data;
            if (data.creation) {
                const [translatedCreation, propertyTranslation] = await Promise.all([
                    this.attachCreationTranslation(data.creation, locale),
                    data.propertyDetails?.id
                        ? PropertyTranslation.getTranslated(data.propertyDetails.id, locale)
                        : Promise.resolve(null),
                ]);
                const translatedPropertyDetails = propertyTranslation
                    ? { ...data.propertyDetails, _translations: propertyTranslation }
                    : data.propertyDetails;
                return { ...response, data: { ...data, creation: translatedCreation, propertyDetails: translatedPropertyDetails } };
            } else {
                const translatedCreation = await this.attachCreationTranslation(data, locale);
                return { ...response, data: translatedCreation };
            }
        } catch (error) {
            console.error(`[CreationInterceptor Error]:`, error);
            return response;
        }
    }

    /**
     * Attaches translations under `_translations` for the Creation entity
     * and any nested creation entities (super, group, brand).
     */
    private static async attachCreationTranslation(creation: any, locale: string): Promise<any> {
        if (!creation || !creation.id) return creation;

        const result = { ...creation }; // Clone — never mutate the original

        // ── Main Creation ────────────────────────────────────────────────────────
        const translation = await CreationTranslation.getTranslated(creation.id, locale);
        if (translation) {
            result._translations = translation;
        }

        // ── Nested Super ─────────────────────────────────────────────────────────
        if (creation.super?.id) {
            const superTranslation = await CreationTranslation.getTranslated(creation.super.id, locale);
            result.super = {
                ...creation.super,
                ...(superTranslation && { _translations: superTranslation }),
            };
        }

        // ── Nested Group ─────────────────────────────────────────────────────────
        if (creation.group?.id) {
            const groupTranslation = await CreationTranslation.getTranslated(creation.group.id, locale);
            result.group = {
                ...creation.group,
                ...(groupTranslation && { _translations: groupTranslation }),
            };
        }

        // ── Nested Brand ─────────────────────────────────────────────────────────
        if (creation.brand?.id) {
            const brandTranslation = await CreationTranslation.getTranslated(creation.brand.id, locale);
            result.brand = {
                ...creation.brand,
                ...(brandTranslation && { _translations: brandTranslation }),
            };
        }

        if (creation.regional?.id) {
            const regionalTranslation = await CreationTranslation.getTranslated(creation.regional.id, locale);
            result.regional = {
                ...creation.regional,
                ...(regionalTranslation && { _translations: regionalTranslation }),
            };
        }

        if (Array.isArray(creation.regionalChildren) && creation.regionalChildren.length > 0) {
            result.regionalChildren = await Promise.all(
                creation.regionalChildren.map(async (child: any) => {
                    if (!child?.id) return child;
                    const childTranslation = await CreationTranslation.getTranslated(child.id, locale);
                    return childTranslation ? { ...child, _translations: childTranslation } : child;
                })
            );
        }

        return result;
    }
}
