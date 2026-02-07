import { ICTouristTax } from "../interfaces";
import { TouristTaxRepository } from "../repository/tourist-tax.repository";
import { PropertyDao } from "../../property-management/repository/property.repository";
import { successResponse, errorResponse } from "../../utils/return";
import { IApiResponse } from "../../utils/return.types";
import { RatePlanRepository } from "../../ari/repository";

export class TouristTaxService {
    touristTaxRepository: TouristTaxRepository;

    constructor() {
        this.touristTaxRepository = new TouristTaxRepository();
    }

    public async createTouristTax(
        propertyId: string,
        touristTaxData: ICTouristTax,
    ): Promise<IApiResponse> {
        try {
            // Verify property exists
            const property = await PropertyDao.getPropertyById(propertyId, true);
            if (!property) {
                return errorResponse('Property not found');
            }

            // Get rate plan by code and verify it belongs to the property
            const ratePlan = await RatePlanRepository.getRatePlanByCode(
                touristTaxData.ratePlanCode,
            );

            if (!ratePlan) {
                return errorResponse('Rate plan not found or does not belong to this property');
            }

            // Check if tourist tax already exists for this rate plan
            const existingTouristTax = await this.touristTaxRepository.getTouristTaxByRatePlanCode(
                touristTaxData.ratePlanCode,
                propertyId
            );

            if (existingTouristTax) {
                return errorResponse('Tourist tax already exists for this rate plan');
            }

            const newTouristTax = await this.touristTaxRepository.createTouristTax(
                ratePlan.id,
                touristTaxData
            );

            if (newTouristTax) {
                return successResponse('Tourist tax created successfully', newTouristTax);
            } else {
                return errorResponse('Failed to create tourist tax');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to create tourist tax', error.message);
            } else {
                return errorResponse('Failed to create tourist tax', 'Unknown error occurred');
            }
        }
    }

    public async getTouristTaxesByPropertyId(propertyId: string): Promise<IApiResponse> {
        try {
            const touristTaxes = await this.touristTaxRepository.getTouristTaxesByPropertyId(propertyId);
            return successResponse('Tourist taxes fetched successfully', touristTaxes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to get tourist taxes', error.message);
            } else {
                return errorResponse('Failed to get tourist taxes', 'Unknown error occurred');
            }
        }
    }

    public async updateTouristTax(
        touristTaxId: string,
        touristTaxData: Partial<ICTouristTax>,
    ): Promise<IApiResponse> {
        try {
            const exists = await this.touristTaxRepository.getTouristTaxById(touristTaxId);
            if (!exists) {
                return errorResponse('Tourist tax does not exist');
            }

            const updatedTouristTax = await this.touristTaxRepository.updateTouristTax(
                touristTaxId,
                touristTaxData
            );

            if (updatedTouristTax) {
                return successResponse('Tourist tax updated successfully', updatedTouristTax);
            } else {
                return errorResponse('Failed to update tourist tax');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to update tourist tax', error.message);
            } else {
                return errorResponse('Failed to update tourist tax', 'Unknown error occurred');
            }
        }
    }

    public async deleteTouristTax(touristTaxId: string): Promise<IApiResponse> {
        try {
            const exists = await this.touristTaxRepository.getTouristTaxById(touristTaxId);
            if (!exists) {
                return errorResponse('Tourist tax does not exist');
            }

            const deletedTouristTax = await this.touristTaxRepository.deleteTouristTax(touristTaxId);
            if (deletedTouristTax) {
                return successResponse('Tourist tax deleted successfully', deletedTouristTax);
            } else {
                return errorResponse('Failed to delete tourist tax');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to delete tourist tax', error.message);
            } else {
                return errorResponse('Failed to delete tourist tax', 'Unknown error occurred');
            }
        }
    }
}