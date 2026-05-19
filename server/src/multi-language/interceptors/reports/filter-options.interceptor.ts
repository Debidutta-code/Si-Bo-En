import { IApiResponse } from '../../../utils/return.types';
import { CreationTranslation } from '../../models/core/creation.model';
import { PropertyTranslation } from '../../models/property/property.model';

export class FilterOptionsInterceptor {
    public static async intercept(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = response.data;
            const result = { ...data };

            if (Array.isArray(data.groups)) {
                result.groups = await Promise.all(
                    data.groups.map(async (group: any) => {
                        if (!group?.id) return group;
                        const translation = await CreationTranslation.getTranslated(group.id, locale);
                        return translation ? { ...group, _translations: translation } : group;
                    })
                );
            }

            if (Array.isArray(data.brands)) {
                result.brands = await Promise.all(
                    data.brands.map(async (brand: any) => {
                        if (!brand?.id) return brand;
                        const translation = await CreationTranslation.getTranslated(brand.id, locale);
                        return translation ? { ...brand, _translations: translation } : brand;
                    })
                );
            }

            if (Array.isArray(data.properties)) {
                result.properties = await Promise.all(
                    data.properties.map(async (property: any) => {
                        const updatedProperty = { ...property };
                        
                        // 1. Creation translation for the property's creation record
                        if (property.id) {
                            const creationTranslation = await CreationTranslation.getTranslated(property.id, locale);
                            if (creationTranslation) {
                                updatedProperty._translations = creationTranslation;
                            }
                        }

                        // 2. Nested property translation
                        if (property.property?.id) {
                            const propertyTranslation = await PropertyTranslation.getTranslated(property.property.id, locale);
                            if (propertyTranslation) {
                                updatedProperty.property = {
                                    ...property.property,
                                    _translations: propertyTranslation
                                };
                            }
                        }
                        
                        return updatedProperty;
                    })
                );
            }

            return { ...response, data: result };
        } catch (error) {
            console.error(`[FilterOptionsInterceptor Error]:`, error);
            return response;
        }
    }
}
