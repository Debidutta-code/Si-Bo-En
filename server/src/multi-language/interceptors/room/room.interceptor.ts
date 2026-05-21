import { IApiResponse } from '../../../utils/return.types';
import { RoomTranslation } from '../../models/room/rooms.model';

export class RoomInterceptor {
    public static async interceptGetRoomsForInvSetup(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }
        try {
            const data = response.data;
            let translatedData = data;
            
            if (Array.isArray(data)) {
                translatedData = await Promise.all(
                    data.map(async (room: any) => {
                        if (!room.id) return room;
                        const translation = await RoomTranslation.getTranslated(room.id, locale);
                        return translation ? { ...room, _translations: translation } : room;
                    })
                );
            } else if (data.id) {
                const translation = await RoomTranslation.getTranslated(data.id, locale);
                if (translation) {
                    translatedData = { ...data, _translations: translation };
                }
            }

            return { ...response, data: translatedData };
        } catch (error) {
            console.error(`[RoomInterceptor Error]:`, error);
            return response;
        }
    }
}
