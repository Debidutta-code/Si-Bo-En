import { IApiResponse } from '../../../utils/return.types';
import { PromotionTranslation } from '../../models/features/promotions/promotion.model';
import { PropertyTranslation } from '../../models/property/property.model';
import { RatePlanTranslation } from '../../models/ari/rate-plan.model';
import { RoomTranslation } from '../../models/room/rooms.model';

export class PromotionInterceptor {
    public static async intercept(
        response: IApiResponse<any | any[]>,
        locale: string
    ): Promise<IApiResponse<any | any[]>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = response.data;

            if (Array.isArray(data)) {
                const translatedData = await Promise.all(
                    data.map((promotion) => this.attachPromotionTranslation(promotion, locale))
                );
                return { ...response, data: translatedData };
            } else {
                const translatedPromotion = await this.attachPromotionTranslation(data, locale);
                return { ...response, data: translatedPromotion };
            }
        } catch (error) {
            console.error(`[PromotionInterceptor Error]:`, error);
            return response;
        }
    }

    private static async attachPromotionTranslation(promotion: any, locale: string): Promise<any> {
        if (!promotion?.id) return promotion;

        const result = { ...promotion };

        // 1. Main Promotion
        const promotionTranslation = await PromotionTranslation.getTranslated(promotion.id, locale);
        if (promotionTranslation) {
            result._translations = promotionTranslation;
        }

        // 2. Nested Property
        if (result.property?.id) {
            const propertyTranslation = await PropertyTranslation.getTranslated(result.property.id, locale);
            if (propertyTranslation) {
                result.property = { ...result.property, _translations: propertyTranslation };
            }
        }

        // 3. Nested RatePlan
        if (result.ratePlan?.id) {
            const ratePlanTranslation = await RatePlanTranslation.getTranslated(result.ratePlan.id, locale);
            if (ratePlanTranslation) {
                result.ratePlan = { ...result.ratePlan, _translations: ratePlanTranslation };
            }
        }

        // 4. Nested Room
        if (result.room?.id) {
            const roomTranslation = await RoomTranslation.getTranslated(result.room.roomType, locale);
            if (roomTranslation) {
                result.room = { ...result.room, _translations: roomTranslation };
            }
        }

        return result;
    }
}
