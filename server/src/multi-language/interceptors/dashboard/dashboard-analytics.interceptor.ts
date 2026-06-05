import { IApiResponse } from '../../../utils/return.types';
import { AddonTranslation } from '../../models/features/addons/addon.model';
import { PropertyTranslation } from '../../models/property/property.model';

export class DashboardAnalyticsInterceptor {
    public static async intercept(
        response: IApiResponse<any>,
        locale: string
    ): Promise<IApiResponse<any>> {
        if (!response.success || !response.data || locale.toLowerCase() === 'en') {
            return response;
        }

        try {
            const data = response.data;
            const analytics = data.analytics;

            if (!analytics || !analytics.topPerformingProperties) {
                return response;
            }

            const topPerforming = analytics.topPerformingProperties;
            const addons = analytics.addon.popularAddons;
            const result = {
                ...data,
                analytics: {
                    ...analytics,
                    topPerformingProperties: {
                        ...topPerforming
                    },
                    addon:{
                        ...analytics.addon,
                        popularAddons: {
                            ...addons
                        }
                    }
                }
            };


            const translateList = async (list: any[]) => {
                if (!Array.isArray(list)) return list;
                return Promise.all(
                    list.map(async (item: any) => {
                        if (!item?.propertyId) return item;
                        const translation = await PropertyTranslation.getTranslated(item.propertyId, locale);
                        return translation ? { ...item, _translations: translation } : item;
                    })
                );
            };
            const translateAddons = async (addons: any[]) => {
                if (!Array.isArray(addons)) return addons;
                return Promise.all(
                    addons.map(async (item: any) => {
                        console.log("Singular add on",item)
                        if (!item?.addonId) return item;
                        const translation = await AddonTranslation.getTranslated(item.addonId, locale);
                        return translation ? { ...item, _translations: translation } : item;
                    })
                );
            };
            if (addons) {
                result.analytics.addon.popularAddons = await translateAddons(addons);
            }

            if (topPerforming.topByRevenue) {
                result.analytics.topPerformingProperties.topByRevenue = await translateList(topPerforming.topByRevenue);
            }

            if (topPerforming.topByBookings) {
                result.analytics.topPerformingProperties.topByBookings = await translateList(topPerforming.topByBookings);
            }

            if (topPerforming.topByOccupancy) {
                result.analytics.topPerformingProperties.topByOccupancy = await translateList(topPerforming.topByOccupancy);
            }
            return { ...response, data: result };
        } catch (error) {
            console.error('[DashboardAnalyticsInterceptor Error]:', error);
            return response;
        }
    }
}
