import { PropertyTranslation } from '../../models/property/property.model';
import { PropertyAddressTranslation } from '../../models/property/property-address.model';
import { RoomTranslation } from '../../models/room/rooms.model';
import { RatePlanTranslation } from '../../models/ari/rate-plan.model';
import { PolicyTranslation } from '../../models/ari/policy.model';
import { PromotionTranslation } from '../../models/features/promotions/promotion.model';
import { TouristTaxTranslation } from '../../models/features/tax-system/tourist-tax.model';
import { MasterAmenityTranslation } from '../../models/property/property-masters.model';
import {
    LoyaltyConditionsTranslation,
    LoyaltySpecialConditionTranslation,
} from '../../models/features/loyalty/loyalty-configs.model';
import { LoyalityFieldController } from '../../../loyalty/controllers';
import { MasterLoyaltyRegistrationFieldTranslation } from '../../models/masters/loyalty.master.model';

export class BookingEngineRoomsInterceptor {
    public static async intercept(response: any, locale: string): Promise<any> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = { ...response.data };

            // ── 1. Property details ───────────────────────────────────────────
            if (data.propertyDetails?.id) {
                const propertyTranslation = await PropertyTranslation.getTranslated(
                    data.propertyDetails.id,
                    locale
                );
                if (propertyTranslation) {
                    data.propertyDetails = {
                        ...data.propertyDetails,
                        _translations: propertyTranslation,
                    };
                }

                // ── 1a. Loyalty conditions ────────────────────────────────────
                const loyaltyConfig =
                    data.propertyDetails.loyaltyProgramConfig?.CreationLoyaltyConfig;

                if (loyaltyConfig) {
                    if (Array.isArray(loyaltyConfig.loyaltyConditions)) {
                        loyaltyConfig.loyaltyConditions = await Promise.all(
                            loyaltyConfig.loyaltyConditions.map(async (cond: any) => {
                                if (!cond?.id) return cond;
                                const t = await LoyaltyConditionsTranslation.getTranslated(
                                    cond.id,
                                    locale
                                );
                                return t ? { ...cond, _translations: t } : cond;
                            })
                        );
                    }

                    // ── 1b. Loyalty special conditions ────────────────────────
                    if (Array.isArray(loyaltyConfig.loyaltySpecialConditions)) {
                        loyaltyConfig.loyaltySpecialConditions = await Promise.all(
                            loyaltyConfig.loyaltySpecialConditions.map(async (sc: any) => {
                                if (!sc?.id) return sc;
                                const t = await LoyaltySpecialConditionTranslation.getTranslated(
                                    sc.id,
                                    locale
                                );
                                return t ? { ...sc, _translations: t } : sc;
                            })
                        );
                    }
                    if (Array.isArray(loyaltyConfig.LoyaltyProgramFieldConfig)) {
                        loyaltyConfig.LoyaltyProgramFieldConfig = await Promise.all(
                            loyaltyConfig.LoyaltyProgramFieldConfig.map(async (sc: any) => {
                                if (!sc?.id) return sc;
                                const t = await MasterLoyaltyRegistrationFieldTranslation.getTranslated(
                                    sc.masterRegistrationFieldId,
                                    locale
                                );
                                return t ? { ...sc, _translations: t } : sc;
                            })
                        );
                    }
                }

                // ── 1c. Property address ──────────────────────────────────────
                const address = data.propertyDetails.address;
                if (address?.id) {
                    const addressTranslation = await PropertyAddressTranslation.getTranslated(
                        address.id,
                        locale
                    );
                    if (addressTranslation) {
                        data.propertyDetails.address = {
                            ...address,
                            _translations: addressTranslation,
                        };
                    }
                }
            }

            // ── 2. Rooms ──────────────────────────────────────────────────────
            if (Array.isArray(data.rooms)) {
                data.rooms = await Promise.all(
                    data.rooms.map((room: any) => this.translateRoom(room, locale))
                );
            }

            return { ...response, data };
        } catch (error) {
            console.error('[BookingEngineRoomsInterceptor Error]:', error);
            return response;
        }
    }

    // ── Room ─────────────────────────────────────────────────────────────────
    private static async translateRoom(room: any, locale: string): Promise<any> {
        if (!room?.id) return room;

        const result = { ...room };

        // Room name
        const roomTranslation = await RoomTranslation.getTranslated(room.id, locale);
        if (roomTranslation) {
            result._translations = roomTranslation;
        }

        // Amenities
        if (Array.isArray(room.amenities)) {
            result.amenities = await Promise.all(
                room.amenities.map(async (amenity: any) => {
                    if (!amenity?.id) return amenity;
                    const t = await MasterAmenityTranslation.getTranslated(amenity.id, locale);
                    return t ? { ...amenity, _translations: t } : amenity;
                })
            );
        }

        // Rate plans / room price combos
        if (Array.isArray(room.roomPrice)) {
            result.roomPrice = await Promise.all(
                room.roomPrice.map((rp: any) => this.translateRoomPrice(rp, locale))
            );
        }

        return result;
    }

    // ── Room price (rate plan combo) ──────────────────────────────────────────
    private static async translateRoomPrice(rp: any, locale: string): Promise<any> {
        const result = { ...rp };

        // Rate plan translation
        if (rp.ratePlanId) {
            const ratePlanTranslation = await RatePlanTranslation.getTranslated(
                rp.ratePlanId,
                locale
            );
            if (ratePlanTranslation) {
                result._translations = ratePlanTranslation;
            }
        }

        // Policies
        if (rp.policy) {
            result.policy = { ...rp.policy };

            for (const key of ['depositPolicy', 'cancellationPolicy', 'guaranteePolicy'] as const) {
                const policy = rp.policy[key];
                if (policy?.id) {
                    const t = await PolicyTranslation.getTranslated(policy.id, locale);
                    if (t) {
                        result.policy[key] = { ...policy, _translations: t };
                    }
                }
            }
        }

        // Tourist tax
        if (rp.touristTax?.id) {
            const taxTranslation = await TouristTaxTranslation.getTranslated(
                rp.touristTax.id,
                locale
            );
            if (taxTranslation) {
                result.touristTax = { ...rp.touristTax, _translations: taxTranslation };
            }
        }

        // Available promotions
        if (Array.isArray(rp.availablePromotions)) {
            result.availablePromotions = await Promise.all(
                rp.availablePromotions.map(async (promo: any) => {
                    if (!promo?.id) return promo;
                    const t = await PromotionTranslation.getTranslated(promo.id, locale);
                    return t ? { ...promo, _translations: t } : promo;
                })
            );
        }

        return result;
    }
}
