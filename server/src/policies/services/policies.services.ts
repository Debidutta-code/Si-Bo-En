import { PolicyRepository } from "../repository"
import { errorResponse, successResponse } from "../../utils/return";
export class PoliciesServices {
    public static async createPolicyService(propertyId: string, description: string, type: "deposit" | "guarantee" | "cancellation", policyName: string) {
        try {
            const response = await PolicyRepository.createOne({ policyName, type, description, propertyId })
            //console.log("Repository Response:", response); // Debugging line
            if (response.id) {
                //console.log("Success res", response)
                return successResponse("Policy Created Successfully", response)
            } else {
                //console.log(response)
                return errorResponse("Error occur while getting the Policy")
            }
        } catch (error: any) {
            return errorResponse("Error occur while getting the Policy", error.message)
        }

    }

    public static async updatePolicyService(id: string, ratePlanCode: string, ratePlanName: string) {
        try {
            const response = await PolicyRepository.MapPolicyDao(id, { ratePlanCode, ratePlanName })
            if (response) {
                return successResponse("Policy Mapped Successfully", response)

            } else {
                return errorResponse("Error occur while mapping the Policy")

            }
        } catch (error: any) {
            return errorResponse("Error occur while Updating the Policy", error.message)
        }

    }
    public static async updatePolicyDetailsService(id: string, policyName?: string, description?: string) {
        try {
            if (!policyName && description === undefined) {
                return errorResponse("At least one field (policyName or description) is required")
            }
            const response = await PolicyRepository.updatePolicyDetails(id, { policyName, description })
            if (response) {
                return successResponse("Policy Updated Successfully", response)
            } else {
                return errorResponse("Error occurred while updating the Policy")
            }
        } catch (error: any) {
            return errorResponse("Error occurred while updating the Policy", error.message)
        }
    }
    public static async deletePolicyService(id: string) {
        try {
            const existingPolicy = await PolicyRepository.getPolicyById(id)
            if (!existingPolicy) {
                return errorResponse("Policy not found")
            }
            const response = await PolicyRepository.deleteOne(id)
            if (response) {
                return successResponse("Policy Deleted Successfully")
            } else {
                return errorResponse("Error occur while deleting the Policy")
            }
        } catch (error: any) {
            return errorResponse("Error occur while deleting the Policy", error.message)
        }

    }
    public static async getPoliciesService(propertyId: string, ratePlanCode: string) {
        try {
            const response = await PolicyRepository.findOne({ ratePlanCode, propertyId })
            if (response) {
                return successResponse("Policy fetched Successfully", response)
            } else {
                return errorResponse("Failed to fetch policy")
            }
        } catch (error: any) {
            return errorResponse("Error occur while getting the Policy", error.message)
        }

    }
    public static async getPoliciesByHotelCode(propertyId: string) {
        try {
            const response = await PolicyRepository.getPoliciesByHotelCode(propertyId)
            if (response) {
                return successResponse("Policy fetched successfully Successfully", response)

            } else {
                return errorResponse("Failed to fetch policy")
            }
        } catch (error: any) {
            return errorResponse("Error occur while getting the Policy", error.message)
        }
    }
    public static async AddToRatePlan(policyId: string, ratePlanId: string) {
        try {
            const existingPolicy = await PolicyRepository.getPolicyById(policyId)
            if (!existingPolicy) {
                return errorResponse("Policy not found")
            }
            const response = await PolicyRepository.AddPolicyToRatePlan(policyId, ratePlanId, existingPolicy.type)
            if (response) {
                return successResponse("Policy added to Rate Plan Successfully", response)

            } else {
                return errorResponse("Error occur while adding Policy to Rate Plan")

            }
        } catch (error: any) {
            return errorResponse("Error occur while adding Policy to Rate Plan", error.message)
        }

    }
}
