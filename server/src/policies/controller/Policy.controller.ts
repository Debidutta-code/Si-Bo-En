import { CustomRequest } from "../../utils/customRequest";
import { Response } from "express"
import { errorResponse } from "../../utils/return";
import { PoliciesServices } from "../services"
export class PolicyController {

    public static async createPolicies(req: CustomRequest, res: Response) {
        try {
            const { propertyId, description, type, policyName } = req.body
            if (!description || !type || !policyName) {
                return res.status(400).json(errorResponse("All the fields are required"))
            }
            const serRes = await PoliciesServices.createPolicyService(propertyId, description, type, policyName)
            const resStatus = serRes?.success ? 200 : 400
            return res.status(resStatus).json(serRes)
        } catch (error: any) {
            return res.status(500).json(errorResponse("Internal server error", error?.message))
        }
    }
    public static async updatePolicy(req: CustomRequest, res: Response) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json("Policy Id is required for update")
            }
            const { ratePlanCode, ratePlanName } = req.body
            if (!ratePlanCode || !ratePlanName) {
                return res.status(400).json(errorResponse("All the fields are required"))
            }
            const serRes = await PoliciesServices.updatePolicyService(id, ratePlanCode, ratePlanName)
            const resStatus = serRes ? 200 : 400
            return res.status(resStatus).json(serRes)
        } catch (error: any) {
            return res.status(500).json(errorResponse("Internal server error", error?.message))
        }
    }
    public static async deletePolicy(req: CustomRequest, res: Response) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json("Policy Id is required for deletion")
            }
            const serRes = await PoliciesServices.deletePolicyService(id)
            const resStatus = serRes ? 200 : 400
            return res.status(resStatus).json(serRes)
        } catch (error: any) {
            return res.status(500).json(errorResponse("Internal server error", error?.message))
        }
    }
    public static async findPolicy(req: CustomRequest, res: Response) {
        try {

            const { propertyCode, ratePlanCode } = req.body
            if (!ratePlanCode || !propertyCode) {
                return res.status(400).json(errorResponse("All fields are required"))
            }
            const serRes = await PoliciesServices.getPoliciesService(propertyCode, ratePlanCode);
            const resStatus = serRes ? 200 : 400
            return res.status(resStatus).json(serRes)
        } catch (error: any) {
            return res.status(500).json(errorResponse("Internal server error", error?.message))
        }
    }
    public static async getPoliciesByHotelCode(req: CustomRequest, res: Response) {
        try {
            const { propertyId } = req.query
            if (!propertyId) {
                return res.status(400).json(errorResponse("Hotel code is required"))
            }
            const serRes = await PoliciesServices.getPoliciesByHotelCode(propertyId.toString())
            const resStatus = serRes.success ? 200 : 400
            return res.status(resStatus).json(serRes)
        } catch (error: any) {
            return res.status(500).json(errorResponse("Internal server error", error?.message))
        }
    }



    public static async AddToRatePlan(req: CustomRequest, res: Response) {
        try {
            const { policyId, ratePlanId } = req.body
            if (!policyId || !ratePlanId) {
                return res.status(400).json(errorResponse("All fields are required"))
            }
            const serRes = await PoliciesServices.AddToRatePlan(policyId, ratePlanId)
            const resStatus = serRes.success ? 200 : 400
            return res.status(resStatus).json(serRes)
        } catch (error: any) {
            return res.status(500).json(errorResponse("Internal server error", error?.message))
        }
    }
}