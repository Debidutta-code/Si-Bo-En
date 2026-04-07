import {createPolicyService, getPoliciesByHotelCodeService, addPolicyToRatePlanService, deletePolicyService, updatePolicyDetailsService} from "./policy.services";
import {fetchRatePlansService} from "../../rate-plan/services"
export{
    createPolicyService,
    getPoliciesByHotelCodeService as getPoliciesService,
    fetchRatePlansService, 
    addPolicyToRatePlanService,
    deletePolicyService,
    updatePolicyDetailsService
}