// Loyalty Program APIs
export {
    createLoyaltyProgram,
    getLoyaltyProgram,
    updateLoyaltyProgram,
    deleteLoyaltyProgram,
    createAdvanceLoyaltyProgram,
    getAdvanceLoyaltyProgram,
    updateAdvanceLoyaltyProgram,
    deleteAdvanceLoyaltyProgram
} from "./loyality-program.api";

// Loyalty Field APIs
export {
    addFields,
    getFields,
    updateField,
    deleteField,
    updateManyFields
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
    getActiveLoyaltyConfigByPropertyId
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
