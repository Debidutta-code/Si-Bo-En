export type DeviceType = "mobile"|"tablet"|"desktop"
export type PolicyType = "deposit" | "guarantee" |"cancellation";
export interface IRatePlan {
  id              :string;
  ratePlanName   :string;
  ratePlanCode    :string;
  deviceType      :DeviceType[];
  // Back relation to Property
  propertyId      :string;
  // Policies
  depositPolicy   :IPolicy | null;
  depositPolicyId :string | null;

  cancellationPolicy   :IPolicy | null;
  cancellationPolicyId :string | null;

  guaranteePolicy   :IPolicy | null;
  guaranteePolicyId :string | null;

  b2bAvailable      :boolean;
  b2cAvailable      :boolean;
}
export interface IPolicy{
policyName  :string;
  type        :PolicyType;
  description :string;
}