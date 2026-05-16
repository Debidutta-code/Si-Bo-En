import { createPromoCode, deletePromoCode, fetchPromoCodes, updatePromoCode } from "./promo-code.api";
import {
    upsertPromoCodeTranslation,
    getAllPromoCodeTranslations,
    getPromoCodeTranslation,
    deletePromoCodeTranslationLocale,
} from "./promo-code-multilang.api";

export {
    createPromoCode,
    deletePromoCode,
    fetchPromoCodes,
    updatePromoCode,
    upsertPromoCodeTranslation,
    getAllPromoCodeTranslations,
    getPromoCodeTranslation,
    deletePromoCodeTranslationLocale,
};