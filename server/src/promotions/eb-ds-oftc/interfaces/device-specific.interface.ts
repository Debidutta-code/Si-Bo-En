import { DeviceType } from "../../../agent-paltform/property/types";
import {  DiscountType } from "../../customizable-deal/interfaces";
import { CurrencyCode } from "../../../tax-system/interfaces/tourist-tax.type";
import { PromotionType } from "./eb-ds-oftc.interface";

// Base promotion interface
export interface IDeviceSpecificPromotionBase {
  promotionName: string;
  propertyId: string;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  currencyCode?: CurrencyCode;
  validFrom: Date;
  validTo?: Date;
}

// Device Specific Promotion (no room, has device types)
export interface IDeviceSpecificPromotion extends IDeviceSpecificPromotionBase {
  deviceType: DeviceType[];
  ratePlanId: string;
  ratePlanCode: string;
  monApplicable: boolean;
  tueApplicable: boolean;
  wedApplicable: boolean;
  thuApplicable: boolean;
  friApplicable: boolean;
  satApplicable: boolean;
  sunApplicable: boolean;
  isAutoApplied: boolean;
}

// Update interface for device-specific promotion
export interface IDeviceSpecificPromotionUpdate {
  promotionName?: string;
  validFrom?: Date;
  validTo?: Date;
  discountType?: DiscountType;
  discountValue?: number;
  currencyCode?: CurrencyCode;
  deviceType: DeviceType[];
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

// Response interface for device-specific promotion
export interface IDeviceSpecificPromotionResponse {
  id: string;
  promotionName: string;
  propertyId: string;
  validFrom: Date | null;
  validTo: Date | null;
  promotionType: PromotionType;
  deviceType: DeviceType[];
  ratePlanId: string;
  ratePlanCode: string;
  discountType: DiscountType;
  discountValue: number;
  currencyCode: CurrencyCode | null;
  monApplicable: boolean;
  tueApplicable: boolean;
  wedApplicable: boolean;
  thuApplicable: boolean;
  friApplicable: boolean;
  satApplicable: boolean;
  sunApplicable: boolean;
  isActive: boolean;
  createdAt: Date;
}