// Loyalty Program APIs
export {
    createLoyaltyProgram,
    getLoyaltyProgram,
    updateLoyaltyProgram,
    deleteLoyaltyProgram,
    createAdvanceLoyaltyProgram,
    getAdvanceLoyaltyProgram,
    updateAdvanceLoyaltyProgram,
    deleteAdvanceLoyaltyProgram,
    getLoyaltyProgramByCreationId
} from "./loyality-program.api";

// Loyalty Field APIs
export {
    addFields,
    getFields,
    updateField,
    deleteField,
    updateManyFields,
    getAllFields
} from "./loyality-field.api";

// Loyalty Condition APIs
export {
    createCondition,
    updateCondition,
    deleteCondition,
    getConditionsByProgramId,
    createSpecialCondition,
    updateSpecialCondition,
    deleteSpecialCondition,
    getSpecialConditionsByProgramId
} from "./loyality-condition.api";

// Property Loyalty APIs
export {
    createPropertyLoyalityConfig,
    getLoyalityForProperty,
    updatePropertyLoyalityConfig,
    deletePropertyLoyalityConfig,
    getAllPropertyLoyalityWithLoyality,
    getActiveLoyaltyConfigByPropertyId,
    getPropertiesByLoyaltyProgram
} from "./property-loyality.api";

// Creation Loyalty APIs
export {
    createCreationLoyality,
    getCreationLoyalityById,
    updateCreationLoyality,
    deleteLoyality,
    getLoyalityByCreation,
    getAllCreationLoyalityWithProperty
} from "./creation-loyality.api";

export {
    // createLoyaltyGuest,
    deleteLoyaltyGuest,
    getLoyaltyGuestsForCreation,
    getLoyaltyGuestsForProperty,
    
} from "./loyalty-guest.api";

// Loyalty Level APIs
export {
    getLoyalityLevels,
    createLoyalityLevel,
    updateLoyalityLevel,
    deleteLoyalityLevel
} from "./loyality-level.api";

// Loyalty Multilanguage APIs
export {
    upsertLoyaltyConditionTranslation,
    getAllLoyaltyConditionTranslations,
    getLoyaltyConditionTranslation,
    deleteLoyaltyConditionTranslationLocale,
    upsertLoyaltySpecialConditionTranslation,
    getAllLoyaltySpecialConditionTranslations,
    getLoyaltySpecialConditionTranslation,
    deleteLoyaltySpecialConditionTranslationLocale,
} from "./multilanguage.api";