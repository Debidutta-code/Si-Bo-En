// Enums matching backend
export type DeviceType = "mobile" | "tablet" | "desktop";

export type DiscountType = "percentage" | "flat";

export type CurrencyCode = "USD" | "EUR" | "INR";
export type PromotionType = "early_bird" | "offer_for_tonight" | "customizable_deal" | "device_specific";

export interface DeviceSpecificPromotion {
  id: string;
  propertyId: string;
  promotionName: string;
  ratePlanId: string;
  ratePlanCode: string;
  deviceType: DeviceType[];
  discountType: DiscountType;
  discountValue: number;
  currencyCode?: CurrencyCode;
  validFrom: string;
  validTo?: string | null;
  applicableDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
    isAutoApplied: boolean;

  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeviceSpecificPromotionWithRatePlan extends DeviceSpecificPromotion {
  ratePlan: {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
  };
}

export interface CreateDeviceSpecificPromotion {
  propertyId: string;
  promotionName: string;
  ratePlanId: string;
  ratePlanCode: string;
  promotionType: PromotionType;
  deviceType: DeviceType[];
  discountType: DiscountType;
  discountValue: number;
  currencyCode?: CurrencyCode;
  validFrom: string;
  validTo?: string | null;
  monApplicable: boolean;
  tueApplicable: boolean;
  wedApplicable: boolean;
  thuApplicable: boolean;
  friApplicable: boolean;
  satApplicable: boolean;
  sunApplicable: boolean;
  isActive: boolean;
    isAutoApplied: boolean;

}

export interface UpdateDeviceSpecificPromotion {
  promotionName?: string;
  discountType?: DiscountType;
  discountValue?: number;
  currencyCode?: CurrencyCode;
  validFrom?: string;
  validTo?: string | null;
  monApplicable?: boolean;
  tueApplicable?: boolean;
  wedApplicable?: boolean;
  thuApplicable?: boolean;
  friApplicable?: boolean;
  satApplicable?: boolean;
  sunApplicable?: boolean;
  isActive?: boolean;
    isAutoApplied: boolean;

}

// Helper to convert frontend applicableDays to backend format
export const convertApplicableDaysToBackend = (applicableDays: {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}) => ({
  monApplicable: applicableDays.monday,
  tueApplicable: applicableDays.tuesday,
  wedApplicable: applicableDays.wednesday,
  thuApplicable: applicableDays.thursday,
  friApplicable: applicableDays.friday,
  satApplicable: applicableDays.saturday,
  sunApplicable: applicableDays.sunday,
});

// Helper to convert backend format to frontend applicableDays
export const convertBackendToApplicableDays = (data: any) => ({
  monday: data.monApplicable ?? true,
  tuesday: data.tueApplicable ?? true,
  wednesday: data.wedApplicable ?? true,
  thursday: data.thuApplicable ?? true,
  friday: data.friApplicable ?? true,
  saturday: data.satApplicable ?? true,
  sunday: data.sunApplicable ?? true,
});