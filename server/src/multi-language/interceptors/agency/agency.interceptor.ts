import { IApiResponse } from '../../../utils/return.types';
import { PropertyTranslation } from '../../models/property/property.model';
import { RoomTranslation } from '../../models/room/rooms.model';

export class AgencyInterceptor {
    /**
     * Intercepts getAgenticPropertyDetails response.
     * Translates the AgenticProperty's linked property name/description
     * and all nested AgenticRooms (roomName, roomType, description).
     */
    public static async interceptGetAgenticPropertyDetails(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }
        try {
            const data = response.data;
            const result = { ...data };

            // 1. Translate the parent property fields (propertyName, description)
            if (data.propertyId) {
                const propertyTranslation = await PropertyTranslation.getTranslated(
                    data.propertyId,
                    locale
                );
                if (propertyTranslation) {
                    result._translations = propertyTranslation;
                }
            }

            // 2. Translate nested AgenticRooms (roomName, roomType, description)
            if (Array.isArray(data.AgenticRooms)) {
                result.AgenticRooms = await Promise.all(
                    data.AgenticRooms.map((agenticRoom: any) =>
                        AgencyInterceptor.attachRoomTranslation(agenticRoom, locale)
                    )
                );
            }

            return { ...response, data: result };
        } catch (error) {
            console.error(`[AgencyInterceptor Error]:`, error);
            return response;
        }
    }

    /**
     * Intercepts getAvailablePropertiesForAgents response.
     * Translates each property's name/description in the list.
     */
    public static async interceptGetAvailablePropertiesForAgents(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }
        try {
            const data = response.data;
            if (!Array.isArray(data)) return response;

            const translatedData = await Promise.all(
                data.map(async (property: any) => {
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

            return { ...response, data: translatedData };
        } catch (error) {
            console.error(`[AgencyInterceptor Error]:`, error);
            return response;
        }
    }

    /**
     * Intercepts getRoomsForAgencies response.
     * Translates each room's name/type/description in the list.
     */
    public static async interceptGetRoomsForAgencies(
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
                    data.map((room: any) =>
                        AgencyInterceptor.attachRoomTranslation(room, locale)
                    )
                );
                return { ...response, data: translatedData };
            } else if (data?.id) {
                const translated = await AgencyInterceptor.attachRoomTranslation(
                    data,
                    locale
                );
                return { ...response, data: translated };
            }

            return response;
        } catch (error) {
            console.error(`[AgencyInterceptor Error]:`, error);
            return response;
        }
    }

    /**
     * Helper: attaches RoomTranslation onto a single room object.
     * Works for both AgenticRoom (uses roomId FK) and Room (uses id PK).
     */
    private static async attachRoomTranslation(
        room: any,
        locale: string
    ): Promise<any> {
        // AgenticRoom stores the original room's PK as `roomId`
        const lookupId = room?.roomId ?? room?.id;
        if (!lookupId) return room;

        const translation = await RoomTranslation.getTranslated(lookupId, locale);
        return translation ? { ...room, _translations: translation } : room;
    }
}
