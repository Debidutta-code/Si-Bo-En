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


    
    createTouristTaxService,
    deleteTouristTaxService,
    fetchTouristTaxesByPropertyService,
    updateTouristTaxService
}