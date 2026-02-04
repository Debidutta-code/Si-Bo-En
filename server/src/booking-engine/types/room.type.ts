export interface IBookingSearchPayload {
  startDate: string;
  endDate: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  PropertyCode: string;
  countryCode?: string; // For geo-based pricing
  deviceType?: string; // For device-specific promotions (mobile, tablet, desktop)
}

export interface IBaseByGuestAmount {
  numberOfGuests: number;
  amountBeforeTax: number;
}

export interface IAddonInfo {
  id: string;
  name: string;
  price: number;
  postingRhythm: string;
}

export interface IPromotion {
  id: string;
  promotionName: string;
  promotionType: string; // "early_bird" | "offer_for_tonight" | "mlos"
  discountType: string; // "percentage" | "flat"
  discountValue: number;
  minLos?: number; // For MLOS promotions
  maxLos?: number; // For MLOS promotions
  validFrom?: Date | null;
  validTo?: Date | null;
  advanceBookingDays?: number;
  monApplicable?: boolean;
  tueApplicable?: boolean;
  wedApplicable?: boolean;
  thuApplicable?: boolean;
  friApplicable?: boolean;
  satApplicable?: boolean;
  sunApplicable?: boolean;
}

export interface IRoomPrice {
  ratePlanName: string;
  ratePlanCode: string;
  totalAmount: number;
  currencyCode: string;
  baseByGuestAmts: IBaseByGuestAmount[]; // ✅ ARRAY, not singular object
  policy: {
    depositPolicy?: any;
    cancellationPolicy?: any;
    guaranteePolicy?: any;
  };
  addons: IAddonInfo[];
  availablePromotions: IPromotion[];
}

export interface IRoom {
  id: string;
  room_name: string;
  room_type: string;
  room_size: number;
  max_occupancy: number;
  room_unit: string;
  room_view: string;
  description: string;
  images: string[];
  amenities: any[];
  has_valid_rate: boolean;
  room_price: IRoomPrice[];
}