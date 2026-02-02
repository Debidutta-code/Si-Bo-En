import type { RatePlanRule } from "@/pages/rate-plan/interfaces/ratePlan.type";

export interface RatePlanRuleWithRatePlan extends RatePlanRule {
    ratePlan: {
        id: string;
        ratePlanName: string;
        ratePlanCode: string;
    };
}