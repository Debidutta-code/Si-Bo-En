import { getRatePlanRulesByPropertyId } from "../apis";

export async function getRatePlanRulesByPropertyIdService(propertyId: string) {
    if (!propertyId) {
        return {
            success: false,
            message: "Property ID is required"
        };
    }
    const result = await getRatePlanRulesByPropertyId(propertyId);
    return result;
}