import { PromoCodeRepository } from "../repository";
import { ICreatePromoCode, } from "../types";
import { property, isPropertyExists } from "../utils";
import {  successResponse, errorResponse } from "../../utils/return";
import {IApiResponse} from "../../utils/return.types"
export class PromoCodeService {
    private promoCodeRepository: PromoCodeRepository;

    constructor() {
        this.promoCodeRepository = new PromoCodeRepository();
    }

    public async createPromoCode(data: ICreatePromoCode): Promise<IApiResponse> {
        try {
            const propertyExists = await isPropertyExists(data.propertyId);
            if (!propertyExists) {
                return errorResponse('Property does not exist');
            }
            const existingPromoCode = await this.promoCodeRepository.checkIfCodeIsAlreadyExistsForThisProperty(data.propertyId, data.code);
            if (existingPromoCode) {
                return errorResponse('An PromoCode with this code has already exists for this property');
            }
            const promoCode = await this.promoCodeRepository.createPromoCode(data);
            return successResponse('PromoCode created successfully', 201, promoCode);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }


    public async getAllPromoCodesByPropertyId(propertyId: string): Promise<IApiResponse> {
        try {
            const propertyExists = await isPropertyExists(propertyId);
            if (!propertyExists) {
                return errorResponse('Property does not exist', );
            }
            const promoCodes = await this.promoCodeRepository.getPromoCodesByPropertyId(propertyId);
            if (!promoCodes || promoCodes.length === 0) {
                return errorResponse('No PromoCodes found for this property');
            }
            return successResponse('PromoCodes fetched successfully',  promoCodes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }

    public async getPromoCodeByParams(propertyId: string, query: string): Promise<IApiResponse> {
        try {
            const propertyExists = await isPropertyExists(propertyId);
            if (!propertyExists) {
                return errorResponse('Property does not exist', );
            }
            const promoCode = await this.promoCodeRepository.getPromoCodeByIdOrCode(propertyId, query);
            if (!promoCode) {
                return errorResponse('PromoCode not found');
            }
            return successResponse('PromoCode fetched successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }

    public async updatePromoCode(params: string, data: Partial<ICreatePromoCode>): Promise<IApiResponse> {
        try {
            const promoCode = await this.promoCodeRepository.getPromoCodeByIdOrCode(data.propertyId!, params);
            if (promoCode?.code != data.code) {
                return errorResponse('PromoCode code cannot be changed,If want to use the code then create it again', );
            }
            if (!promoCode) {
                return errorResponse('PromoCode not found', );
            }
            const updatedPromoCode = await this.promoCodeRepository.updatePromoCodeByCode(promoCode.id, data);
            return successResponse('PromoCode updated successfully', updatedPromoCode);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }
    public async SoftDeletePromoCodeById(propertyId: string, promoCodeId: string): Promise<IApiResponse> {
        try {
            const promoCode = await this.promoCodeRepository.getPromoCodeByIdOrCode(propertyId, promoCodeId);
            if (!promoCode) {
                return errorResponse('PromoCode not found', );
            }
            await this.promoCodeRepository.softDeletePromoCodeById(promoCode.id);
            return successResponse('PromoCode deleted successfully', );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }
    public async HardDeletePromoCodeById(propertyId: string, promoCodeId: string): Promise<IApiResponse> {
        try {
            const promoCode = await this.promoCodeRepository.getPromoCodeByIdOrCode(propertyId, promoCodeId);
            if (!promoCode) {
                return errorResponse('PromoCode not found', );
            }
            await this.promoCodeRepository.hardDeletePromoCodeById(promoCode.id);
            return successResponse('PromoCode permanently deleted successfully', );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }
    public async RecoverPromoCodeById(propertyId: string, promoCodeId: string): Promise<IApiResponse> {
        try {
            const promoCode = await this.promoCodeRepository.getPromoCodeByIdOrCode(propertyId, promoCodeId);
            if (!promoCode) {
                return errorResponse('PromoCode not found', );
            }
            await this.promoCodeRepository.recoverPromoCodeById(promoCode.id);
            return successResponse('PromoCode recovered successfully', );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }

}