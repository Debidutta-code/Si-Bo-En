import { prisma } from "../../../config";
import { PropertyDao } from "../../../property-management/repository";
import { errorResponse, IApiResponse, successResponse } from "../../../utils";
import { CustomizableDealDao } from "../dao";
import { ICCreateCustomizableDeal, ICUpdateCustomizableDeal } from "../interfaces";


export class CustomizableDealService {
    customizableDealRepository: CustomizableDealDao;

    constructor() {
        this.customizableDealRepository = new CustomizableDealDao();
    }

    public async createCustomizableDeal(
        propertyId: string,
        propertyCode: string,
        dealData: ICCreateCustomizableDeal
    ): Promise<IApiResponse> {
        try {
            // Validate property exists
            const property = await PropertyDao.getPropertyById(propertyId, true);
            if (!property) {
                return errorResponse('Property not found');
            }

            // Validate rooms exist and belong to property
            if (dealData.applicableRoomTypes.length > 0) {
                const rooms = await prisma.room.findMany({
                    where: {
                        id: { in: dealData.applicableRoomTypes },
                        propertyId
                    }
                });

                if (rooms.length !== dealData.applicableRoomTypes.length) {
                    return errorResponse('Some rooms not found or do not belong to this property');
                }
            }

            // Validate rate plans exist and belong to property
            if (dealData.applicableRatePlans.length > 0) {
                const ratePlans = await prisma.ratePlan.findMany({
                    where: {
                        id: { in: dealData.applicableRatePlans },
                        propertyId
                    }
                });

                if (ratePlans.length !== dealData.applicableRatePlans.length) {
                    return errorResponse('Some rate plans not found or do not belong to this property');
                }
            }

            // Validate addons exist and belong to property
            if (dealData.applicableAddons.length > 0) {
                const addons = await prisma.addon.findMany({
                    where: {
                        id: { in: dealData.applicableAddons },
                        propertyId
                    }
                });

                if (addons.length !== dealData.applicableAddons.length) {
                    return errorResponse('Some addons not found or do not belong to this property');
                }
            }

            const newDeal = await this.customizableDealRepository.createCustomizableDeal(
                propertyId,
                propertyCode,
                dealData
            );

            if (newDeal) {
                return successResponse('Customizable Deal created successfully', newDeal);
            } else {
                return errorResponse('Failed to create Customizable Deal');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to create Customizable Deal', error.message);
            } else {
                return errorResponse('Failed to create Customizable Deal', 'Unknown error occurred');
            }
        }
    }

    public async getCustomizableDealsByPropertyId(propertyId: string): Promise<IApiResponse> {
        try {
            const deals = await this.customizableDealRepository.getCustomizableDealsByPropertyId(propertyId);
            return successResponse('Customizable Deals fetched successfully', deals);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to get Customizable Deals', error.message);
            } else {
                return errorResponse('Failed to get Customizable Deals', 'Unknown error occurred');
            }
        }
    }

    public async getCustomizableDealById(dealId: string): Promise<IApiResponse> {
        try {
            const deal = await this.customizableDealRepository.getCustomizableDealById(dealId);
            
            if (!deal) {
                return errorResponse('Customizable Deal not found');
            }

            return successResponse('Customizable Deal fetched successfully', deal);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to get Customizable Deal', error.message);
            } else {
                return errorResponse('Failed to get Customizable Deal', 'Unknown error occurred');
            }
        }
    }

    public async updateCustomizableDeal(
        dealId: string,
        propertyId: string,
        dealData: ICUpdateCustomizableDeal
    ): Promise<IApiResponse> {
        try {
            const exists = await this.customizableDealRepository.getCustomizableDealById(dealId);
            if (!exists) {
                return errorResponse('Customizable Deal does not exist');
            }

            // Verify deal belongs to property
            if (exists.propertyId !== propertyId) {
                return errorResponse('Customizable Deal does not belong to this property');
            }

            // Validate rooms if provided
            if (dealData.applicableRoomTypes && dealData.applicableRoomTypes.length > 0) {
                const rooms = await prisma.room.findMany({
                    where: {
                        id: { in: dealData.applicableRoomTypes },
                        propertyId
                    }
                });

                if (rooms.length !== dealData.applicableRoomTypes.length) {
                    return errorResponse('Some rooms not found or do not belong to this property');
                }
            }

            // Validate rate plans if provided
            if (dealData.applicableRatePlans && dealData.applicableRatePlans.length > 0) {
                const ratePlans = await prisma.ratePlan.findMany({
                    where: {
                        id: { in: dealData.applicableRatePlans },
                        propertyId
                    }
                });

                if (ratePlans.length !== dealData.applicableRatePlans.length) {
                    return errorResponse('Some rate plans not found or do not belong to this property');
                }
            }

            // Validate addons if provided
            if (dealData.applicableAddons && dealData.applicableAddons.length > 0) {
                const addons = await prisma.addon.findMany({
                    where: {
                        id: { in: dealData.applicableAddons },
                        propertyId
                    }
                });

                if (addons.length !== dealData.applicableAddons.length) {
                    return errorResponse('Some addons not found or do not belong to this property');
                }
            }

            const updatedDeal = await this.customizableDealRepository.updateCustomizableDeal(
                dealId,
                dealData
            );

            if (updatedDeal) {
                return successResponse('Customizable Deal updated successfully', updatedDeal);
            } else {
                return errorResponse('Failed to update Customizable Deal');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to update Customizable Deal', error.message);
            } else {
                return errorResponse('Failed to update Customizable Deal', 'Unknown error occurred');
            }
        }
    }

    public async deleteCustomizableDeal(dealId: string, propertyId: string): Promise<IApiResponse> {
        try {
            const exists = await this.customizableDealRepository.getCustomizableDealById(dealId);
            if (!exists) {
                return errorResponse('Customizable Deal does not exist');
            }

            // Verify deal belongs to property
            if (exists.propertyId !== propertyId) {
                return errorResponse('Customizable Deal does not belong to this property');
            }

            const deletedDeal = await this.customizableDealRepository.deleteCustomizableDeal(dealId);
            
            if (deletedDeal) {
                return successResponse('Customizable Deal deleted successfully', deletedDeal);
            } else {
                return errorResponse('Failed to delete Customizable Deal');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to delete Customizable Deal', error.message);
            } else {
                return errorResponse('Failed to delete Customizable Deal', 'Unknown error occurred');
            }
        }
    }
}