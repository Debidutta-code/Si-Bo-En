// import { prisma } from "../../../config";
import { PropertyDao } from "../../../property-management/repository";
import { errorResponse, IApiResponse, successResponse } from "../../../utils";
import { CustomizableDealDao } from "../dao";
import {
    ICCreateCustomizableDealS,
    IUCustomizableDealS
} from "../interfaces";


export class CustomizableDealService {
    customizableDealRepository: CustomizableDealDao;

    constructor() {
        this.customizableDealRepository = new CustomizableDealDao();
    }

    public async createCustomizableDeal(
        propertyId: string,
        propertyCode: string,
        dealData: ICCreateCustomizableDealS
    ): Promise<IApiResponse> {
        try {
            const property = await PropertyDao.getPropertyById(propertyId, true);
            if (!property) {
                return errorResponse('Property not found', "property not found or drafted");
            }
            const [rooms, ratePlans, addons] = await Promise.all([
                this.customizableDealRepository.findRoomTypes(dealData.applicableRoomTypes, propertyId),
                this.customizableDealRepository.findRatePlans(dealData.applicableRatePlans, propertyId),
                this.customizableDealRepository.findAddons(dealData.applicableAddons, propertyId)
            ])
            if(rooms.length !== dealData.applicableRoomTypes.length){
                return errorResponse('Some room types are invalid or not found');
            }
            if(ratePlans.length !== dealData.applicableRatePlans.length){
                return errorResponse('Some rate plans are invalid or not found');
            }
            if(addons.length !== dealData.applicableAddons.length){
                return errorResponse('Some addons are invalid or not found');
            }
            const newDeal = await this.customizableDealRepository.createCustomizableDeal(
                propertyId,
                propertyCode,
                {
                    ...dealData,
                    applicableRoomTypes: rooms,
                    applicableRatePlans: ratePlans,
                    applicableAddons: addons
                }
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
        dealData: IUCustomizableDealS
    ): Promise<IApiResponse> {
        try {
            const exists = await this.customizableDealRepository.getCustomizableDealById(dealId);
            if (!exists) {
                return errorResponse('Customizable Deal does not exist');
            }

            if (exists.propertyId !== propertyId) {
                return errorResponse('Customizable Deal does not belong to this property');
            }

            const [rooms, ratePlans, addons] = await Promise.all([
                this.customizableDealRepository.findRoomTypes(dealData.applicableRoomTypes, propertyId),
                this.customizableDealRepository.findRatePlans(dealData.applicableRatePlans, propertyId),
                this.customizableDealRepository.findAddons(dealData.applicableAddons, propertyId)
            ])
            if(rooms.length !== dealData.applicableRoomTypes.length){
                return errorResponse('Some room types are invalid or not found');
            }
            if(ratePlans.length !== dealData.applicableRatePlans.length){
                return errorResponse('Some rate plans are invalid or not found');
            }
            if(addons.length !== dealData.applicableAddons.length){
                return errorResponse('Some addons are invalid or not found');
            }

            const updatedDeal = await this.customizableDealRepository.updateCustomizableDeal(
                dealId,
                {
                    ...dealData,
                    applicableAddons:addons,
                    applicableRatePlans:ratePlans,
                    applicableRoomTypes:rooms
                }
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