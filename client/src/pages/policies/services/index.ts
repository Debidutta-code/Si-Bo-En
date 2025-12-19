import {createPolicyService,getPoliciesByHotelCodeService,addPolicyToRatePlanService, deletePolicyService} from "./policy.services";
import {fetchRatePlansService} from "../../rate-plan/services"
export{
    createPolicyService,
    getPoliciesByHotelCodeService as getPoliciesService,
    fetchRatePlansService, 
    addPolicyToRatePlanService,
    deletePolicyService
}