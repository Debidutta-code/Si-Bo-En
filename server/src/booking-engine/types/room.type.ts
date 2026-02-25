import { DeviceType } from "@prisma/client";
import { IRoomVideo } from "../../property-management/types";
import { Decimal } from "@prisma/client/runtime/library";
import { CurrencyCode } from "../../pms/frontoffice/payment/types";

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
  deviceType?: DeviceType; // For device-specific promotions (mobile, tablet, desktop)
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
  discountValue: Decimal|null;
  minLos?: number; // For MLOS promotions
  maxLos?: number; // For MLOS promotions
  validFrom?: Date | null;
  validTo?: Date | null;
  advanceBookingDays: number|null;
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
   appliedDiscounts: IAppliedDiscount[];
   touristTax?: ITouristTax | null;
}
export interface ITouristTax {
  id: string;
  name:string|null;
  discountType: string;
  discountValue: Decimal|null;
  currencyCode: CurrencyCode|null;
  calculatedTaxAmount?:number;
}
export interface IAppliedDiscount {
    id: string;
    promotionName: string;
    promotionType: string;
    discountType: string;
    discountValue: number;
    calculatedDiscountAmount: number; 
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
  roomVideos:IRoomVideo | null;
}