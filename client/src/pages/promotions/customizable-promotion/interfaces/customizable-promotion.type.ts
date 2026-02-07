export type DiscountType = 'percentage' | 'flat';
export type CurrencyCode = 'USD' | 'EUR' | 'INR';

// Create Customizable Deal payload
export interface CreateCustomizableDeal {
  discountType: DiscountType;
  discountValue: number;
  currencyCode?: CurrencyCode;
  applicableRoomTypes: string[]; // Array of room IDs
  applicableRatePlans: string[]; // Array of rate plan IDs
  applicableAddons: string[];    // Array of addon IDs
}

// Update Customizable Deal payload
export interface UpdateCustomizableDeal {
  discountType?: DiscountType;
  discountValue?: number;
  currencyCode?: CurrencyCode;
  applicableRoomTypes?: string[];
  applicableRatePlans?: string[];
  applicableAddons?: string[];
}

// Room Type interface for the deal
export interface DealApplicableRoomType {
  id: string;
  roomId: string;
  roomTypeCode: string;
  Room: {
    id: string;
    roomName: string;
    roomType: string;
  };
}

// Rate Plan interface for the deal
export interface DealApplicableRatePlan {
  id: string;
  ratePlanId: string;
  ratePlanCode: string;
  RatePlan: {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
  };
}

// Addon interface for the deal
export interface DealApplicableAddon {
  id: string;
  addOnId: string;
  AddOn: {
    id: string;
    name: string;
    code: string;
  };
}

// Customizable Deal response
export interface CustomizableDeal {
  id: string;
  propertyId: string;
  propertyCode: string;
  discountType: DiscountType;
  discountValue: number;
  currencyCode: CurrencyCode;
  createdAt: string;
  CustomizableDealsApplicableRoomTypes: DealApplicableRoomType[];
  CustomizableDealsApplicableRatePlanTypes: DealApplicableRatePlan[];
  CustomizableDealsApplicableAddons: DealApplicableAddon[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}