import { DeviceType } from "@prisma/client";
import { IRoomVideo } from "../../property-management/types";
import { Decimal } from "@prisma/client/runtime/library";
import { CurrencyCode } from "../../pms/frontoffice/payment/types";
import { DiscountType } from "../../promocode/types";

export interface IBookingSearchPayload {
  startDate: string;
  endDate: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  PropertyCode: string;
  countryCode?: string;
  deviceType?: DeviceType;
  promocode?: string;
}

export interface IBaseByGuestAmount {
  numberOfGuests: number;
  amountBeforeTax: number;
}

export interface IAddonDetail {
  id: string;
  name: string;
  code: string;
  price: number;
  postingRhythm: string;
  description?: string | null;
  images: string[];
  category?: { id: string; name: string; code: string } | null;
  subCategory?: { id: string; name: string; code: string } | null;
  addonVariant?: { id: string; name: string; code: string } | null;
}

export interface IPromotion {
  id: string;
  promotionName: string;
  promotionType: string;
  discountType: string;
  discountValue: Decimal | null;
  minLos?: number;
  maxLos?: number;
  validFrom?: Date | null;
  validTo?: Date | null;
  advanceBookingDays: number | null;
  monApplicable?: boolean;
  tueApplicable?: boolean;
  wedApplicable?: boolean;
  thuApplicable?: boolean;
  friApplicable?: boolean;
  satApplicable?: boolean;
  sunApplicable?: boolean;
}

export interface IAppliedDiscount {
  id: string;
  promotionName: string;
  promotionType: string;
  discountType: string;
  discountValue: number;
  calculatedDiscountAmount: number;
}

export interface ITouristTax {
  id: string;
  name: string | null;
  discountType: DiscountType;
  discountValue: Decimal | null;
  currencyCode: CurrencyCode | null;
  calculatedTaxAmount?: number;
}

export interface IRoomPrice {
  ratePlanName: string;
  ratePlanCode: string;
  comboLabel: string;
  totalAmount: number;
  currencyCode: string;
  baseByGuestAmts: IBaseByGuestAmount[];
  policy: {
    depositPolicy?: any;
    cancellationPolicy?: any;
    guaranteePolicy?: any;
  };
  addons: IAddonDetail[];
  availablePromotions: IPromotion[];
  appliedDiscounts: IAppliedDiscount[];
  touristTax?: ITouristTax | null;
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
  roomVideos: IRoomVideo | null;
}