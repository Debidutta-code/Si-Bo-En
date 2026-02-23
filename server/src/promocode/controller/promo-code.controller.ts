import { PromoCodeService } from "../services";
import { Request, Response } from "express";
import { ICreatePromoCode } from "../types";
import { errorResponse } from "../../utils/return";
import { PropertyCustomRequest, PropertyRequest } from "../../utils";
export class PromoCodeController {
    promoCodeService: PromoCodeService;
    constructor() {
        this.promoCodeService = new PromoCodeService();
    }
    public async createPromoCode(req: PropertyCustomRequest, res: Response): Promise<Response> {
        try {
            const promoCodeData: ICreatePromoCode = req.body;
            const validationError = this.validatePromoCodeData(promoCodeData);
            if (validationError) {
                return res.status(400).json(errorResponse(validationError));
            }

            const result = await this.promoCodeService.createPromoCode(
                {
                    name: promoCodeData.name,
                    code: promoCodeData.code,
                    description: promoCodeData.description,
                    propertyId: promoCodeData.propertyId,
                    discountType: promoCodeData.discountType,
                    discountValue: promoCodeData.discountValue,
                    validFrom: promoCodeData.validFrom,
                    validTo: promoCodeData.validTo,
                    minBookingAmount: promoCodeData.minBookingAmount,
                    maxDiscountAmount: promoCodeData.maxDiscountAmount,

                    isApplicableForMobileApp: promoCodeData.isApplicableForMobileApp,
                    isApplicableForDesktop: promoCodeData.isApplicableForDesktop,
                    isApplicableForTablet: promoCodeData.isApplicableForTablet,

                    isApplicableForWalkIn: promoCodeData.isApplicableForWalkIn,
                    isApplicableForOTA: promoCodeData.isApplicableForOTA,
                    isApplicableForCorporate: promoCodeData.isApplicableForCorporate,

                    usageLimit: promoCodeData.usageLimit,
                    usageLimitPerUser: promoCodeData.usageLimitPerUser,
                    applicableRoomTypes: (promoCodeData.applicableRoomTypes && promoCodeData.applicableRoomTypes.length > 0) ? promoCodeData.applicableRoomTypes : ["all"],
                    applicableRatePlans: (promoCodeData.applicableRatePlans && promoCodeData.applicableRatePlans.length > 0) ? promoCodeData.applicableRatePlans : ["all"],
                }
            );
            if (result.success) {
                return res.status(201).json(result);
            }
            return res.status(400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(error.message));
            }
            return res.status(500).json(errorResponse('An unexpected error occurred'));
        }
    }
    public async getAllPromoCodesByPropertyId(req: PropertyRequest, res: Response): Promise<Response> {
        try {
            const { propertyId } = req.params;
            if (!propertyId) {
                return res.status(400).json(errorResponse('Property ID is required'));
            }
            const result = await this.promoCodeService.getAllPromoCodesByPropertyId(propertyId);
            if (result.success) {
                return res.status(200).json(result);
            }
            return res.status(400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(error.message));
            }
            return res.status(500).json(errorResponse('An unexpected error occurred'));
        }
    }

    private validatePromoCodeData(promoCodeData: ICreatePromoCode): string | void {
        if (!promoCodeData) {
            return 'Promo code data is required'
        }
        if (!promoCodeData.name || !promoCodeData.code || !promoCodeData.discountType || promoCodeData.discountValue === undefined) {
            return 'Missing required promo code fields';
        }
        if (promoCodeData.validFrom && promoCodeData.validTo && promoCodeData.validFrom > promoCodeData.validTo) {
            return 'Invalid validity period';
        }
        if (promoCodeData.minBookingAmount!==null && (!promoCodeData.minBookingAmount || promoCodeData.minBookingAmount < 0)) {
            return 'Minimum booking amount cannot be negative';
        }
        if (promoCodeData.maxDiscountAmount!==null && (!promoCodeData.maxDiscountAmount || promoCodeData.maxDiscountAmount < 0)) {
            return 'Maximum discount amount cannot be negative';
        }
        if (promoCodeData.usageLimit && promoCodeData.usageLimit < 0) {
            return 'Usage limit cannot be negative';
        }
        if (promoCodeData.usageLimitPerUser && promoCodeData.usageLimitPerUser < 0) {
            return 'Per user limit cannot be negative';
        }
        if (promoCodeData.code.length < 8 || promoCodeData.code.length > 12) {
            return 'Promo code must be between 8 to 12 characters';
        }
        if (promoCodeData.isApplicableForDesktop === false && promoCodeData.isApplicableForMobileApp === false && promoCodeData.isApplicableForTablet === false) {
            return 'Promo code must be applicable for at least one platform (Desktop, Mobile App, Tablet)';
        }
        if (promoCodeData.isApplicableForWalkIn === false && promoCodeData.isApplicableForOTA === false && promoCodeData.isApplicableForCorporate === false) {
            return 'Promo code must be applicable for at least one booking source (Walk-In, OTA, Corporate)';
        }
    }
    public async getPromoCodeByParams(req: PropertyRequest, res: Response): Promise<Response> {
        try {
            const { propertyId, query } = req.params;
            if (!propertyId || !query) {
                return res.status(400).json(errorResponse('Property ID and query are required'));
            }
            const result = await this.promoCodeService.getPromoCodeByParams(propertyId, query);
            if (result.success) {
                return res.status(200).json(result);
            }
            return res.status(400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(error.message));
            }
            return res.status(500).json(errorResponse('An unexpected error occurred'));
        }

    }
    public async validatePromoCodeController(req: PropertyRequest, res: Response): Promise<Response> {
        try {
            const {promocode}=req.body
            const propertyId=req.property?.id
            if(!propertyId){
                return res.status(400).json(errorResponse("Property Id verification failed"))
            }
            if(promocode){
                return res.status(400).json(errorResponse("Promocode required for verification"))
            }
            const serRes=await this.promoCodeService.validatePromoCode(propertyId,promocode)
            return res.status(serRes.success?200:400).json(serRes)
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Error occur while verifying Promocode"));
            }
            return res.status(500).json(errorResponse('An unexpected error occurred'));

        }
    }
    public async updatePromoCode(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;
            const { promoCodeData }: { promoCodeData: Partial<ICreatePromoCode> } = req.body;
            if (!id) {
                return res.status(400).json(errorResponse('Promo code identifier is required'));
            }

            if (promoCodeData.applicableRoomTypes && promoCodeData.applicableRoomTypes.length === 0) {
                promoCodeData.applicableRoomTypes = ["all"];
            }
            if (promoCodeData.applicableRatePlans && promoCodeData.applicableRatePlans.length === 0) {
                promoCodeData.applicableRatePlans = ["all"];
            }

            const result = await this.promoCodeService.updatePromoCode(id, promoCodeData);
            if (result.success) {
                return res.status(200).json(result);
            }
            return res.status(400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(error.message));
            }
            return res.status(500).json(errorResponse('An unexpected error occurred'));
        }
    }
    public async deletePromoCode(req: PropertyRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const propertyId = req.property?.id
            const isHardDelete = req.query.hardDelete as string;
            if (!propertyId || !id) {
                return res.status(400).json(errorResponse('Property ID and Promo Code ID are required'));
            }
            let result;
            if (isHardDelete === 'true') {
                result = await this.promoCodeService.HardDeletePromoCodeById(propertyId, id);

            } else {
                result = await this.promoCodeService.SoftDeletePromoCodeById(propertyId, id);
            }
            if (result.success) {
                return res.status(200).json(result);
            }
            return res.status(400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(error.message));
            }
            return res.status(500).json(errorResponse('An unexpected error occurred'));
        }
    }
    public async recoverPromoCode(req: PropertyRequest, res: Response): Promise<Response> {
        try {
            const { propertyId, id } = req.params;
            if (!propertyId || !id) {
                return res.status(400).json(errorResponse('Property ID and Promo Code ID are required'));
            }
            const result = await this.promoCodeService.RecoverPromoCodeById(propertyId, id);
            if (result.success) {
                return res.status(200).json(result);
            }
            return res.status(400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(error.message));
            }
            return res.status(500).json(errorResponse('An unexpected error occurred'));
        }

    }
}