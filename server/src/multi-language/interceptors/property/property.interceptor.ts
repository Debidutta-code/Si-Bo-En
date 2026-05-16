import { IApiResponse } from '../../../utils/return.types';
import { PropertyTranslation } from '../../models/property/property.model';
import { PropertyAddressTranslation } from '../../models/property/property-address.model';
import { RoomTranslation } from '../../models/room/rooms.model';
import {
    MasterPropertyCategoryTranslation,
    MasterPropertyTypeTranslation,
    MasterAmenityTranslation,
    MasterRoomViewTranslation,
} from '../../models/property/property-masters.model';

export class PropertyInterceptor {
    public static async interceptGetPropertyById(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }
        try {
            const data = response.data;
            const result = { ...data };

            const [propertyTranslation, addressTranslation] = await Promise.all([
                PropertyTranslation.getTranslated(data.id, locale),
                data.propertyAddress?.id
                    ? PropertyAddressTranslation.getTranslated(data.id, locale)// update requred address trans lation is being saved as property if insted of address id
                    : Promise.resolve(null),
            ]);

            if (propertyTranslation) {
                result._translations = propertyTranslation;
            }

            if (data.propertyAddress) {
                result.propertyAddress = {
                    ...data.propertyAddress,
                    ...(addressTranslation && { _translations: addressTranslation }),
                };
            }

            if (Array.isArray(data.propertyRooms)) {
                result.propertyRooms = await Promise.all(
                    data.propertyRooms.map((room: any) => this.attachRoomTranslation(room, locale))
                );
            }

            if (data.propertyCategory?.masterCategory?.id) {
                const catTranslation = await MasterPropertyCategoryTranslation.getTranslated(
                    data.propertyCategory.masterCategory.id, locale
                );
                result.propertyCategory = {
                    ...data.propertyCategory,
                    masterCategory: {
                        ...data.propertyCategory.masterCategory,
                        ...(catTranslation && { _translations: catTranslation }),
                    },
                };
            }

            if (data.propertyType?.masterPropertyType?.id) {
                const typeTranslation = await MasterPropertyTypeTranslation.getTranslated(
                    data.propertyType.masterPropertyType.id, locale
                );
                result.propertyType = {
                    ...data.propertyType,
                    masterPropertyType: {
                        ...data.propertyType.masterPropertyType,
                        ...(typeTranslation && { _translations: typeTranslation }),
                    },
                };
            }

            return { ...response, data: result };
        } catch (error) {
            console.error(`[PropertyInterceptor Error]:`, error);
            return response;
        }
    }

    public static async interceptFindAmenityByPropertyId(
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
                data.map(async (item: any) => {
                    if (!item?.masterId) return item;
                    const amenityTranslation = await MasterAmenityTranslation.getTranslated(item.masterId, locale);
                    return amenityTranslation ? { ...item, _translations: amenityTranslation } : item;
                })
            );
            return { ...response, data: translated };
        } catch (error) {
            console.error(`[PropertyInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachRoomTranslation(room: any, locale: string): Promise<any> {
        if (!room?.id) return room;

        const result = { ...room };

        const roomTranslation = await RoomTranslation.getTranslated(room.id, locale);
        if (roomTranslation) {
            result._translations = roomTranslation;
        }

        if (Array.isArray(room.roomAmenities)) {
            result.roomAmenities = await Promise.all(
                room.roomAmenities.map(async (ra: any) => {
                    if (!ra?.amenity?.id) return ra;
                    const amenityTranslation = await MasterAmenityTranslation.getTranslated(ra.amenity.id, locale);
                    return {
                        ...ra,
                        amenity: {
                            ...ra.amenity,
                            ...(amenityTranslation && { _translations: amenityTranslation }),
                        },
                    };
                })
            );
        }

        if (room.RoomViews?.MasterRoomView?.id) {
            const viewTranslation = await MasterRoomViewTranslation.getTranslated(
                room.RoomViews.MasterRoomView.id, locale
            );
            result.RoomViews = {
                ...room.RoomViews,
                MasterRoomView: {
                    ...room.RoomViews.MasterRoomView,
                    ...(viewTranslation && { _translations: viewTranslation }),
                },
            };
        }

        return result;
    }
}
