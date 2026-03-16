// services/geoRatePlan.service.ts

import { getCurrencyConverter } from '../../../currency-maping/utils';
import { errorResponse, IApiResponse, successResponse } from '../../../utils';
import { GeoRatePlanDao } from '../dao';
import { IGeoRatePlanCreate, IGeoRatePlanFilter, IGeoRatePlanInput, } from '../interfaces';

export class GeoRatePlanService {
    private geoRatePlanRepository: GeoRatePlanDao;

    constructor() {
        this.geoRatePlanRepository = new GeoRatePlanDao();
    }

    public async createGeoRatePlanBulk(data: IGeoRatePlanInput): Promise<IApiResponse> {
        try {

            const { convert, baseCurrency } = await getCurrencyConverter(data.propertyId, data.currencyCode);

            // let finalRestrictionValue = data.restrictionValue;
            // if (data.restrictionType === 'restricted') {
            //     finalRestrictionValue = null;
            // }

            // Generate all combinations of rooms x ratePlans
            const geoRatePlanData: IGeoRatePlanCreate[] = [];
            console.log(geoRatePlanData);
            if (!data.rooms || data.rooms.length === 0) {
                for (const ratePlan of data.ratePlans) {
                    geoRatePlanData.push({
                        propertyId: data.propertyId,
                        roomId: null,
                        roomType: null,
                        ratePlanId: ratePlan.id,
                        ratePlanCode: ratePlan.code,
                        restrictionType: data.restrictionType,
                        restrictionValue: data.restrictionType === "fixed" ? convert(Number(data.restrictionValue)) : data.restrictionValue,
                        currencyCode: data.restrictionType === "fixed" ? baseCurrency : data.currencyCode,
                        countryCode: data.countryCode,
                        isActive: data.isActive ?? true,
                        restrictionTypeAction: data.restrictionTypeAction
                    });
                }
            } else {
                for (const room of data.rooms) {
                    for (const ratePlan of data.ratePlans) {
                        geoRatePlanData.push({
                            propertyId: data.propertyId,
                            roomId: room.id,
                            roomType: room.type,
                            ratePlanId: ratePlan.id,
                            ratePlanCode: ratePlan.code,
                            restrictionType: data.restrictionType,
                            restrictionValue: data.restrictionType === "fixed" ? convert(Number(data.restrictionValue)) : data.restrictionValue,
                            currencyCode: data.restrictionType === "fixed" ? baseCurrency : data.currencyCode,
                            countryCode: data.countryCode,
                            isActive: data.isActive ?? true,
                            restrictionTypeAction: data.restrictionTypeAction
                        });
                    }
                }
            }

            const daoRes = await this.geoRatePlanRepository.createGeoRatePlan(geoRatePlanData);
            console.log("Dao Response:", daoRes);
            return successResponse(
                `Successfully created geo rate plan`,
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to create geo rate plans', error?.message);
            }
            return errorResponse('Failed to create geo rate plans');
        }
    }
    public async getGeoRatePlansByPropertyId(
        propertyId: string,
        filters?: IGeoRatePlanFilter
    ): Promise<IApiResponse> {
        try {
            const geoRatePlans = await this.geoRatePlanRepository.getGeoRatePlansByPropertyId(
                propertyId,
                filters
            );

            return successResponse('Geo rate plans fetched successfully', geoRatePlans);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch geo rate plans', error?.message);
            }
            return errorResponse('Failed to fetch geo rate plans');
        }
    }

    public async getGeoRatePlanById(id: string) {
        try {
            const geoRatePlan = await this.geoRatePlanRepository.getGeoRatePlanById(id);

            if (!geoRatePlan) {
                return errorResponse('Geo rate plan not found');
            }

            return successResponse('Geo rate plan fetched successfully', geoRatePlan);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch geo rate plans', error?.message);
            }
            return errorResponse('Failed to fetch geo rate plans');
        }
    }

    public async updateGeoRatePlan(id: string, updateData: IGeoRatePlanCreate) {
        try {
            const [exists, { convert, baseCurrency }] = await Promise.all([
                this.geoRatePlanRepository.getGeoRatePlanById(id),
                getCurrencyConverter(updateData.propertyId, updateData.currencyCode ? updateData.currencyCode : "AED")
            ]);
            if (!exists) {
                return errorResponse('Geo rate plan not found');
            }

            const response = await this.geoRatePlanRepository.updateGeoRatePlan(id, {
                ...updateData,
                restrictionValue: updateData.restrictionType === "fixed" ? convert(Number(updateData.restrictionValue)) : updateData.restrictionValue,
                currencyCode: updateData.restrictionType === "fixed" ? baseCurrency : updateData.currencyCode
            });

            if (response) {
                return successResponse('Geo rate plan updated successfully', response);
            } else {
                return errorResponse('Failed to update geo rate plan');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to update geo rate plans', error?.message);
            }
            return errorResponse('Failed to update geo rate plans');
        }
    }

    public async deleteGeoRatePlan(id: string) {
        try {
            const exists = await this.geoRatePlanRepository.getGeoRatePlanById(id);
            if (!exists) {
                return errorResponse('Geo rate plan not found');
            }

            const response = await this.geoRatePlanRepository.deleteGeoRatePlan(id);

            if (response) {
                return successResponse('Geo rate plan deleted successfully', response);
            } else {
                return errorResponse('Failed to delete geo rate plan');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to delete geo rate plans', error?.message);
            }
            return errorResponse('Failed to delete geo rate plans');
        }
    }

}