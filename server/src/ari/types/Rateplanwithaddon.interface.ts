export interface IRatePlanWithAddon {
  id: string;
  ratePlanId: string;
  addonId: string;
  createdAt: Date;
}

export interface IAddAddonToRatePlan {
  ratePlanCode: string;
  addonId: string;
}

export interface IRemoveAddonFromRatePlan {
  ratePlanCode: string;
  addonId: string;
}