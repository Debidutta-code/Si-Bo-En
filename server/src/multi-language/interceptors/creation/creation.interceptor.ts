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
                
                const resultData = { ...data, creation: translatedCreation, propertyDetails: translatedPropertyDetails };
                
                if (Array.isArray(data.groupChildren)) {
                    resultData.groupChildren = await this.translateChildren(data.groupChildren, locale);
                }
                if (Array.isArray(data.brandChildren)) {
                    resultData.brandChildren = await this.translateChildren(data.brandChildren, locale);
                }

                return { ...response, data: resultData };
            } else {
                const translatedCreation = await this.attachCreationTranslation(data, locale);
                const resultData = { ...translatedCreation };

                if (Array.isArray(data.groupChildren)) {
                    resultData.groupChildren = await this.translateChildren(data.groupChildren, locale);
                }
                if (Array.isArray(data.brandChildren)) {
                    resultData.brandChildren = await this.translateChildren(data.brandChildren, locale);
                }

                return { ...response, data: resultData };
            }
        } catch (error) {
            console.error(`[CreationInterceptor Error]:`, error);
            return response;
        }
    }

    private static async translateChildren(children: any[], locale: string): Promise<any[]> {
        return Promise.all(
            children.map(async (child: any) => {
                if (!child?.id) return child;
                const childTranslation = await CreationTranslation.getTranslated(child.id, locale);
                let translatedChild = childTranslation ? { ...child, _translations: childTranslation } : { ...child };
                
                if (translatedChild.type === 'property' && translatedChild.property?.id) {
                    const propertyTranslation = await PropertyTranslation.getTranslated(translatedChild.property.id, locale);
                    if (propertyTranslation) {
                        translatedChild.property = { ...translatedChild.property, _translations: propertyTranslation };
                    }
                }
                return translatedChild;
            })
        );
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
            result.regionalChildren = await this.translateChildren(creation.regionalChildren, locale);
        }

        if (Array.isArray(creation.groupChildren) && creation.groupChildren.length > 0) {
            result.groupChildren = await this.translateChildren(creation.groupChildren, locale);
        }

        if (Array.isArray(creation.brandChildren) && creation.brandChildren.length > 0) {
            result.brandChildren = await this.translateChildren(creation.brandChildren, locale);
        }

        return result;
    }
}
