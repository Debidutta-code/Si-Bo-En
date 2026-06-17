import { IApiResponse } from '../../../utils/return.types';
import { PropertyTranslation } from '../../models/property/property.model';
import { PropertyAddressTranslation } from '../../models/property/property-address.model';
import { MasterPropertyCategoryTranslation, MasterPropertyTypeTranslation } from '../../models/property/property-masters.model';

export class GroupSearchInterceptor {
    public static async intercept(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        if (!response.success || !Array.isArray(response.data) || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const translated = await Promise.all(
                response.data.map(async (property: any) => {
                    if (!property?.id) return property;
                    const translatedProperty = { ...property };

                    // 1. Property Name & Description
                    console.log(property)
                    const propertyTranslation = await PropertyTranslation.getTranslated(property.id, locale);
                    console.log(propertyTranslation)
                    if (propertyTranslation) {
                        translatedProperty._translations = propertyTranslation;
                    }

                    // 2. Property Category
                    if (property.propertyCategory?.masterCategoryId) {
                        const categoryTranslation = await MasterPropertyCategoryTranslation.getTranslated(
                            property.propertyCategory.masterCategoryId,
                            locale
                        );
                        if (categoryTranslation) {
                            translatedProperty.propertyCategory = {
                                ...property.propertyCategory,
                                masterCategory: {
                                    ...property.propertyCategory.masterCategory,
                                    _translations: categoryTranslation
                                }
                            };
                        }
                    }

                    // 3. Property Type
                    if (property.propertyType?.masterPropertyTypeId) {
                        const typeTranslation = await MasterPropertyTypeTranslation.getTranslated(
                            property.propertyType.masterPropertyTypeId,
                            locale
                        );
                        if (typeTranslation) {
                            translatedProperty.propertyType = {
                                ...property.propertyType,
                                masterPropertyType: {
                                    ...property.propertyType.masterPropertyType,
                                    _translations: typeTranslation
                                }
                            };
                        }
                    }

                    // 4. Property Address
                    if (property.propertyAddress?.propertyId) {
                        const addressTranslation = await PropertyAddressTranslation.getTranslated(
                            property.propertyAddress.propertyId,
                            locale
                        );
                        if (addressTranslation) {
                            translatedProperty.propertyAddress = {
                                ...property.propertyAddress,
                                _translations: addressTranslation
                            };
                        }
                    }

                    return translatedProperty;
                })
            );

            return { ...response, data: translated };
        } catch (error) {
            console.error('[GroupSearchInterceptor Error]:', error);
            return response;
        }
    }
}
