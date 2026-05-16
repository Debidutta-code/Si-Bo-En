import {addRulesToTaxGroupService,
    createTaxGroupService,
    deleteTaxGroupService,
    getTaxGroupsByPropertyIdService,
    removeRulesFromTaxGroupService,
    updateTaxGroupService,
    addRatePlanToTaxGroupService,
    removeRatePlanFromTaxGroupService
} from "./tax-group.services";
import {createTaxRuleService,
    deleteTaxRuleService,
    fetchTaxRulesByPropertyService,
    updateTaxRuleService
} from "./tax-rule.services";

import {createTouristTaxService,
    deleteTouristTaxService,
    fetchTouristTaxesByPropertyService,
    updateTouristTaxService
} from "./tourist-tax.service";
import {fetchRatePlansService} from "../../rate-plan/services";
import {
    deleteTaxGroupTranslationLocaleService,
    deleteTaxRuleTranslationLocaleService,
    deleteTouristTaxTranslationLocaleService,
    getAllTaxGroupTranslationsService,
    getAllTaxRuleTranslationsService,
    getAllTouristTaxTranslationsService,
    getTaxGroupTranslationService,
    getTaxRuleTranslationService,
    getTouristTaxTranslationService,
    upsertTaxGroupTranslationService,
    upsertTaxRuleTranslationService,
    upsertTouristTaxTranslationService,
} from "./multilanguage.services";


export {
    addRulesToTaxGroupService,
    createTaxGroupService,
    deleteTaxGroupService,
    getTaxGroupsByPropertyIdService,
    removeRulesFromTaxGroupService,
    updateTaxGroupService,
    addRatePlanToTaxGroupService,
    removeRatePlanFromTaxGroupService,


    createTaxRuleService,
    deleteTaxRuleService,
    fetchTaxRulesByPropertyService,
    updateTaxRuleService,
    fetchRatePlansService,

    upsertTaxGroupTranslationService,
    getAllTaxGroupTranslationsService,
    getTaxGroupTranslationService,
    deleteTaxGroupTranslationLocaleService,
    upsertTaxRuleTranslationService,
    getAllTaxRuleTranslationsService,
    getTaxRuleTranslationService,
    deleteTaxRuleTranslationLocaleService,
    upsertTouristTaxTranslationService,
    getAllTouristTaxTranslationsService,
    getTouristTaxTranslationService,
    deleteTouristTaxTranslationLocaleService,
    
    createTouristTaxService,
    deleteTouristTaxService,
    fetchTouristTaxesByPropertyService,
    updateTouristTaxService
}