import { getCurrencyConverter } from '../../../currency-maping/utils';
import { PropertyDao } from '../../../property-management/repository';
import { errorResponse, IApiResponse, successResponse } from '../../../utils';
import { CustomizableDealDao } from '../dao';
import { ICCreateCustomizableDealS, IUCustomizableDealS } from '../interfaces';

export class CustomizableDealService {
    private repo: CustomizableDealDao;

    constructor() {
        this.repo = new CustomizableDealDao();
    }

    public async createCustomizableDeal(
        propertyId: string,
        propertyCode: string,
        dealData: ICCreateCustomizableDealS
    ): Promise<IApiResponse> {
        try {
            const property = await PropertyDao.getPropertyById(
                propertyId,
                true
            );
            if (!property)
                return errorResponse('Property not found or drafted');

            const [room, ratePlan, addons, { convert, baseCurrency }] =
                await Promise.all([
                    this.repo.findRoom(dealData.roomId, propertyId),
                    this.repo.findRatePlan(dealData.ratePlanId, propertyId),
                    dealData.applicableAddons.length > 0
                        ? this.repo.findAddons(
                              dealData.applicableAddons,
                              propertyId
                          )
                        : Promise.resolve([]),
                    getCurrencyConverter(
                        propertyId,
                        dealData.currencyCode ? dealData.currencyCode : 'AED'
                    ),
                ]);

            if (!room)
                return errorResponse(
                    'Room not found or does not belong to this property'
                );
            if (!ratePlan)
                return errorResponse(
                    'Rate plan not found or does not belong to this property'
                );
            if (addons.length !== dealData.applicableAddons.length) {
                return errorResponse('Some addons are invalid or not found');
            }

            const newDeal = await this.repo.createCustomizableDeal(
                propertyId,
                propertyCode,
                {
                    ...dealData,
                    roomType: room.roomType,
                    ratePlanCode: ratePlan.ratePlanCode,
                    applicableAddons: addons,
                    currencyCode:
                        dealData.discountType === 'flat'
                            ? baseCurrency
                            : dealData.currencyCode,
                    discountValue:
                        dealData.discountType === 'flat'
                            ? convert(Number(dealData.discountValue))
                            : dealData.discountValue,
                }
            );

            return successResponse(
                'Customizable Deal created successfully',
                newDeal
            );
        } catch (error) {
            return errorResponse(
                'Failed to create Customizable Deal',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    public async getCustomizableDealsByPropertyId(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const deals =
                await this.repo.getCustomizableDealsByPropertyId(propertyId);
            return successResponse(
                'Customizable Deals fetched successfully',
                deals
            );
        } catch (error) {
            return errorResponse(
                'Failed to get Customizable Deals',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    public async getCustomizableDealById(
        dealId: string
    ): Promise<IApiResponse> {
        try {
            const deal = await this.repo.getCustomizableDealById(dealId);
            if (!deal) return errorResponse('Customizable Deal not found');
            return successResponse(
                'Customizable Deal fetched successfully',
                deal
            );
        } catch (error) {
            return errorResponse(
                'Failed to get Customizable Deal',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    public async updateCustomizableDeal(
        dealId: string,
        propertyId: string,
        dealData: IUCustomizableDealS
    ): Promise<IApiResponse> {
        try {
            const exists = await this.repo.getCustomizableDealById(dealId);
            if (!exists)
                return errorResponse('Customizable Deal does not exist');
            if (exists.propertyId !== propertyId)
                return errorResponse(
                    'Customizable Deal does not belong to this property'
                );

            const [room, ratePlan, addons, { convert, baseCurrency }] =
                await Promise.all([
                    dealData.roomId
                        ? this.repo.findRoom(dealData.roomId, propertyId)
                        : Promise.resolve(null),
                    dealData.ratePlanId
                        ? this.repo.findRatePlan(
                              dealData.ratePlanId,
                              propertyId
                          )
                        : Promise.resolve(null),
                    dealData.applicableAddons
                        ? this.repo.findAddons(
                              dealData.applicableAddons,
                              propertyId
                          )
                        : Promise.resolve(null),
                    getCurrencyConverter(
                        propertyId,
                        dealData.currencyCode ? dealData.currencyCode : 'AED'
                    ),
                ]);

            if (dealData.roomId && !room) {
                return errorResponse(
                    'Room not found or does not belong to this property'
                );
            }
            if (dealData.ratePlanId && !ratePlan) {
                return errorResponse(
                    'Rate plan not found or does not belong to this property'
                );
            }
            if (
                dealData.applicableAddons &&
                addons!.length !== dealData.applicableAddons.length
            ) {
                return errorResponse('Some addons are invalid or not found');
            }

            const updatedDeal = await this.repo.updateCustomizableDeal(dealId, {
                discountType: dealData.discountType ?? exists.discountType,
                discountValue:
                    dealData.discountValue ??
                    (exists.discountType && exists.discountType === 'flat'
                        ? convert(Number(exists.discountValue))
                        : exists.discountValue),
                currencyCode:
                    dealData.currencyCode ??
                    (exists.discountType && exists.discountType === 'flat'
                        ? baseCurrency
                        : exists.currencyCode),
                startDate: dealData.startDate ?? exists.startDate,
                endDate: dealData.endDate ?? exists.endDate,
                isActive: dealData.isActive ?? exists.isActive,
                roomId: room?.id ?? exists.roomId,
                roomType: room?.roomType ?? exists.roomType,
                ratePlanId: ratePlan?.id ?? exists.ratePlanId,
                ratePlanCode: ratePlan?.ratePlanCode ?? exists.ratePlanCode,
                ...(addons && { applicableAddons: addons }),
            });

            return successResponse(
                'Customizable Deal updated successfully',
                updatedDeal
            );
        } catch (error) {
            return errorResponse(
                'Failed to update Customizable Deal',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    public async deleteCustomizableDeal(
        dealId: string,
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const exists = await this.repo.getCustomizableDealById(dealId);
            if (!exists)
                return errorResponse('Customizable Deal does not exist');
            if (exists.propertyId !== propertyId)
                return errorResponse(
                    'Customizable Deal does not belong to this property'
                );

            const deleted = await this.repo.deleteCustomizableDeal(dealId);
            return successResponse(
                'Customizable Deal deleted successfully',
                deleted
            );
        } catch (error) {
            return errorResponse(
                'Failed to delete Customizable Deal',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }
}
