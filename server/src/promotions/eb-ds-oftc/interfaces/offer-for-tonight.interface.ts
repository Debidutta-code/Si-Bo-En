import { PromotionType, DiscountType } from '@prisma/client';
import { IRoomRatePlanPair } from './early-bird.interface';
import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';

export interface IOfferForTonightPromotionBase {
  promotionName: string;
  propertyId: string;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  currencyCode?: CurrencyCode;
  validFrom: Date;
  validTo?: Date;
  
}

export interface IOfferForTonightPromotion extends IOfferForTonightPromotionBase {
  roomRatePlans: IRoomRatePlanPair[];
  monApplicable: boolean;
  tueApplicable: boolean;
  wedApplicable: boolean;
  thuApplicable: boolean;
  friApplicable: boolean;
  satApplicable: boolean;
  sunApplicable: boolean;
    isAutoApplied: boolean;

}




