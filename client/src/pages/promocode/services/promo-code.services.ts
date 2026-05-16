import {createPromoCode,deletePromoCode,fetchPromoCodes,updatePromoCode} from "../api";
import { upsertPromoCodeTranslationService } from "./promo-code-multilang.service";
import type {ICreatePromoCode,IRPromoCode, UpsertPromoCodeTranslationPayload} from "../interfaces";

type ICreatePromoCodeWithTranslations = ICreatePromoCode & {
    translations?: UpsertPromoCodeTranslationPayload;
};

type IRPromoCodeWithTranslations = IRPromoCode & {
    translations?: UpsertPromoCodeTranslationPayload;
};

const createPromoCodeService = async (promoCodeData: ICreatePromoCodeWithTranslations) => {
    try {
        if (promoCodeData.code.length < 8 || promoCodeData.code.length > 12) {
            return {
                success: false,
                message: "Promo code must be between 8 to 12 characters"
            };
        }
        if (promoCodeData.isApplicableForDesktop === false && promoCodeData.isApplicableForMobileApp === false && promoCodeData.isApplicableForTablet === false) {
            return {
                success: false,
                message: "Promo code must be applicable for at least one platform (Desktop, Mobile App, Tablet)"
            };
        }
        if (promoCodeData.discountType === "percentage") {
            if (promoCodeData.discountValue <= 0 || promoCodeData.discountValue > 100) {
                return {
                    success: false,
                    message: "For percentage discount type, discount value must be between 1 to 100"
                };
            }
        }

        const { translations, ...mainPayload } = promoCodeData;
        const response = await createPromoCode(mainPayload as ICreatePromoCode);

        const promoCodeId = response?.data?.id ?? response?.data?._id;
        if (response?.success && promoCodeId && translations && Object.keys(translations).length > 0) {
            await upsertPromoCodeTranslationService(promoCodeId, translations);
        }

        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create promo code"
        };
    }
};
const fetchPromoCodesService=async(propertyId:string)=>{
    try {
        if(!propertyId){
            return {
                success:false,
                message:"Property ID is required"
            }
        }
        return await fetchPromoCodes(propertyId);
    } catch (error) {
        return {
            success:false,
            message:"Failed to fetch promo codes"
        }
    }
}
const updatePromoCodeService=async(id:string,promoCodeData:IRPromoCodeWithTranslations)=>{
    try {
        if(!id){
            return {
                success:false,
                message:"Promo code ID is required"
            }
        }

        const { translations, ...mainPayload } = promoCodeData;
        const response = await updatePromoCode(id, mainPayload as IRPromoCode);

        if (response?.success && translations && Object.keys(translations).length > 0) {
            await upsertPromoCodeTranslationService(id, translations);
        }

        return response;
    } catch (error) {
        return {
            success:false,
            message:"Failed to update promo code"
        }
    }   
}
const deletePromoCodeService=async(propertyId:string,id:string)=>{
    try {
        if(!propertyId || !id){
            return {
                success:false,
                message:"Property ID and Promo code ID are required"
            }
        }
        return await deletePromoCode(propertyId,id);
    } catch (error) {
        return {
            success:false,
            message:"Failed to delete promo code"
        }
    }
}
export {
    createPromoCodeService,
    fetchPromoCodesService,
    updatePromoCodeService,
    deletePromoCodeService
}