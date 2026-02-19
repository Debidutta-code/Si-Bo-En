import type { RatePlanRule } from "@/pages/rate-plan/interfaces/ratePlan.type";
import type { CurrencyCode } from "@/pages/tax-system/interface";

export interface RatePlanRuleWithRatePlan extends RatePlanRule {
  ratePlan: {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
  };
}
export interface IMLOScu {
  selectedRatePlan: string;
  startDate: string;
  endDate: string;
  minLos: string;
  maxLos: string;
  discountType: "percentage" | "flat" | "none";
  discountValue: string | null;
  isActive: boolean;
  isAutoApplied: boolean;
  currencyCode:CurrencyCode
}
