import createAxiosInstance from "@/components/axiosInstance";
import type {
    UpsertTaxRuleTranslationPayload,
    UpsertTaxGroupTranslationPayload,
    UpsertTouristTaxTranslationPayload,
} from "../interface/multilanguage.interface";

const axiosInstance = createAxiosInstance();
const TAX_RULE_BASE = "/multi-language/tax-rule";
const TAX_GROUP_BASE = "/multi-language/tax-group";
const TOURIST_TAX_BASE = "/multi-language/tourist-tax";

function buildErrorResponse(error: any) {
    if (error?.response?.data && !error.response.data.success) {
        return error.response.data;
    }
    return { success: false, message: error?.message ?? "Unknown error" };
}

export async function upsertTaxRuleTranslation(
    taxRuleId: string,
    payload: UpsertTaxRuleTranslationPayload
) {
    try {
        const response = await axiosInstance.put(`${TAX_RULE_BASE}/${taxRuleId}`, payload);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function getAllTaxRuleTranslations(taxRuleId: string) {
    try {
        const response = await axiosInstance.get(`${TAX_RULE_BASE}/${taxRuleId}/all`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function getTaxRuleTranslation(taxRuleId: string, locale?: string) {
    try {
        const url = locale
            ? `${TAX_RULE_BASE}/${taxRuleId}?locale=${encodeURIComponent(locale)}`
            : `${TAX_RULE_BASE}/${taxRuleId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function deleteTaxRuleTranslationLocale(taxRuleId: string, locale: string) {
    try {
        const response = await axiosInstance.delete(`${TAX_RULE_BASE}/${taxRuleId}/${locale}`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function upsertTaxGroupTranslation(
    taxGroupId: string,
    payload: UpsertTaxGroupTranslationPayload
) {
    try {
        const response = await axiosInstance.put(`${TAX_GROUP_BASE}/${taxGroupId}`, payload);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function getAllTaxGroupTranslations(taxGroupId: string) {
    try {
        const response = await axiosInstance.get(`${TAX_GROUP_BASE}/${taxGroupId}/all`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function getTaxGroupTranslation(taxGroupId: string, locale?: string) {
    try {
        const url = locale
            ? `${TAX_GROUP_BASE}/${taxGroupId}?locale=${encodeURIComponent(locale)}`
            : `${TAX_GROUP_BASE}/${taxGroupId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function deleteTaxGroupTranslationLocale(taxGroupId: string, locale: string) {
    try {
        const response = await axiosInstance.delete(`${TAX_GROUP_BASE}/${taxGroupId}/${locale}`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function upsertTouristTaxTranslation(
    touristTaxId: string,
    payload: UpsertTouristTaxTranslationPayload
) {
    try {
        const response = await axiosInstance.put(`${TOURIST_TAX_BASE}/${touristTaxId}`, payload);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function getAllTouristTaxTranslations(touristTaxId: string) {
    try {
        const response = await axiosInstance.get(`${TOURIST_TAX_BASE}/${touristTaxId}/all`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function getTouristTaxTranslation(touristTaxId: string, locale?: string) {
    try {
        const url = locale
            ? `${TOURIST_TAX_BASE}/${touristTaxId}?locale=${encodeURIComponent(locale)}`
            : `${TOURIST_TAX_BASE}/${touristTaxId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}

export async function deleteTouristTaxTranslationLocale(touristTaxId: string, locale: string) {
    try {
        const response = await axiosInstance.delete(`${TOURIST_TAX_BASE}/${touristTaxId}/${locale}`);
        return response.data;
    } catch (error: any) {
        return buildErrorResponse(error);
    }
}
