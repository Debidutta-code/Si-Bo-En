import {
    addRulesToTaxGroup,
    createTaxGroup,
    deleteTaxGroup,
    getTaxGroupsByPropertyId,
    removeRulesFromTaxGroup,
    updateTaxGroup,
    addRatePlanToTaxGroup,
    removeRatePlanFromTaxGroup
} from "./tax-group.api";
import {
    createTaxRuleApi,
    deleteTaxRuleApi,
    fetchTaxRulesByPro,
    updateTaxRuleApi
} from "./tax-rule.api";
import {
    createTouristTaxApi,
    deleteTouristTaxApi,
    fetchTouristTaxesByPropertyApi,
    updateTouristTaxApi
} from "./tourist-tax.api";
export {
    createTaxGroup,
    addRulesToTaxGroup,
    deleteTaxGroup,
    getTaxGroupsByPropertyId,
    removeRulesFromTaxGroup,
    updateTaxGroup,
    createTaxRuleApi,
    deleteTaxRuleApi,
    fetchTaxRulesByPro,
    updateTaxRuleApi,
    addRatePlanToTaxGroup,
    removeRatePlanFromTaxGroup,
    createTouristTaxApi,
    deleteTouristTaxApi,
    fetchTouristTaxesByPropertyApi,
    updateTouristTaxApi
}