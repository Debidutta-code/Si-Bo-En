// services/geoRatePlan.service.ts

import { getCurrencyConverter } from '../../../currency-maping/utils';
import { CurrencyCode } from '../../../tax-system/interfaces';
import { errorResponse, IApiResponse, successResponse } from '../../../utils';
import { GeoRatePlanDao } from '../dao';
import {
    IGeoRatePlanCreate,
    IGeoRatePlanFilter,
    IGeoRatePlanInput,
} from '../interfaces';

export class GeoRatePlanService {
    private geoRatePlanRepository: GeoRatePlanDao;

    constructor() {
        this.geoRatePlanRepository = new GeoRatePlanDao();
    }

    public async createGeoRatePlanBulk(
        data: IGeoRatePlanInput
    ): Promise<IApiResponse> {
        try {
            let convert: ((amount: number) => number) | undefined;
            let baseCurrency: CurrencyCode;

            if (data.restrictionType === 'fixed') {
                const currencyData = await getCurrencyConverter(
                    data.propertyId,
                    data.currencyCode
                );
                convert = currencyData.convert;
                baseCurrency = currencyData.baseCurrency;
            }

            // Build combinations to check for duplicates
            const combinations: {
                roomId: string | null;
                ratePlanId: string;
            }[] = [];

            if (!data.rooms || data.rooms.length === 0) {
                for (const ratePlan of data.ratePlans) {
                    combinations.push({
                        roomId: null,
                        ratePlanId: ratePlan.id,
                    });
                }
            } else {
                for (const room of data.rooms) {
                    for (const ratePlan of data.ratePlans) {
                        combinations.push({
                            roomId: room.id,
                            ratePlanId: ratePlan.id,
                        });
                    }
                }
            }

            // Check for duplicates before inserting
            const duplicates = await this.geoRatePlanRepository.checkDuplicates(
                data.propertyId,
                data.countryCode,
                combinations
            );

            if (duplicates.length > 0) {
                const detail = duplicates
                    .map(
                        d =>
                            `ratePlanId: ${d.ratePlanId}, roomId: ${d.roomId ?? 'N/A'}`
                    )
                    .join(' | ');
                return errorResponse(
                    'Duplicate geo rate plans found for this country',
                    `The following combinations already exist: ${detail}`
                );
            }

            // Build the data array
            const geoRatePlanData: IGeoRatePlanCreate[] = combinations.map(
                ({ roomId, ratePlanId }) => {
                    const room = data.rooms?.find(r => r.id === roomId);
                    const ratePlan = data.ratePlans.find(
                        rp => rp.id === ratePlanId
                    )!;
                    return {
                        propertyId: data.propertyId,
                        roomId: roomId,
                        roomType: room?.type ?? null,
                        ratePlanId: ratePlan.id,
                        ratePlanCode: ratePlan.code,
                        restrictionType: data.restrictionType,
                        restrictionValue:
                            data.restrictionType === 'fixed'
                                ? convert!(Number(data.restrictionValue))
                                : data.restrictionValue,
                        currencyCode:
                            data.restrictionType === 'fixed'
                                ? baseCurrency!
                                : data.currencyCode,
                        countryCode: data.countryCode,
                        isActive: data.isActive ?? true,
                        restrictionTypeAction: data.restrictionTypeAction,
                    };
                }
            );

            await this.geoRatePlanRepository.createGeoRatePlan(geoRatePlanData);
            return successResponse(`Successfully created geo rate plan`);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create geo rate plans',
                    error?.message
                );
            }
            return errorResponse('Failed to create geo rate plans');
        }
    }
    public async getGeoRatePlansByPropertyId(
        propertyId: string,
        filters?: IGeoRatePlanFilter
    ): Promise<IApiResponse> {
        try {
            const geoRatePlans =
                await this.geoRatePlanRepository.getGeoRatePlansByPropertyId(
                    propertyId,
                    filters
                );

            return successResponse(
                'Geo rate plans fetched successfully',
                geoRatePlans
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch geo rate plans',
                    error?.message
                );
            }
            return errorResponse('Failed to fetch geo rate plans');
        }
    }

    public async getGeoRatePlanById(id: string) {
        try {
            const geoRatePlan =
                await this.geoRatePlanRepository.getGeoRatePlanById(id);

            if (!geoRatePlan) {
                return errorResponse('Geo rate plan not found');
            }

            return successResponse(
                'Geo rate plan fetched successfully',
                geoRatePlan
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch geo rate plans',
                    error?.message
                );
            }
            return errorResponse('Failed to fetch geo rate plans');
        }
    }

    public async updateGeoRatePlan(id: string, updateData: IGeoRatePlanCreate) {
        try {
            const [exists, { convert, baseCurrency }] = await Promise.all([
                this.geoRatePlanRepository.getGeoRatePlanById(id),
                getCurrencyConverter(
                    updateData.propertyId,
                    updateData.currencyCode ? updateData.currencyCode : 'AED'
                ),
            ]);
            if (!exists) {
                return errorResponse('Geo rate plan not found');
            }

            const response = await this.geoRatePlanRepository.updateGeoRatePlan(
                id,
                {
                    ...updateData,
                    restrictionValue:
                        updateData.restrictionType === 'fixed'
                            ? convert(Number(updateData.restrictionValue))
                            : updateData.restrictionValue,
                    currencyCode:
                        updateData.restrictionType === 'fixed'
                            ? baseCurrency
                            : updateData.currencyCode,
                }
            );

            if (response) {
                return successResponse(
                    'Geo rate plan updated successfully',
                    response
                );
            } else {
                return errorResponse('Failed to update geo rate plan');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update geo rate plans',
                    error?.message
                );
            }
            return errorResponse('Failed to update geo rate plans');
        }
    }

    public async deleteGeoRatePlan(id: string) {
        try {
            const exists =
                await this.geoRatePlanRepository.getGeoRatePlanById(id);
            if (!exists) {
                return errorResponse('Geo rate plan not found');
            }

            const response =
                await this.geoRatePlanRepository.deleteGeoRatePlan(id);

            if (response) {
                return successResponse(
                    'Geo rate plan deleted successfully',
                    response
                );
            } else {
                return errorResponse('Failed to delete geo rate plan');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete geo rate plans',
                    error?.message
                );
            }
            return errorResponse('Failed to delete geo rate plans');
        }
    }
}
