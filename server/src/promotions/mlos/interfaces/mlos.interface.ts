import { DiscountType } from "../../customizable-deal/interfaces";
import { CurrencyCode } from "../../../tax-system/interfaces/tourist-tax.type";

export interface IMLOSCreate {
  ratePlanId: string;
  startDate: Date | null;
  endDate: Date | null;
  minLos: number;
  maxLos: number | null;
  discountType: DiscountType|null;
  discountValue: number | null;
  isActive: boolean;
  isAutoApplied: boolean;
  currencyCode: CurrencyCode;
}



export interface IMLOS {
  id: string;
  ratePlanId: string;
  startDate: Date | null;
  endDate: Date | null;
  minLos: number;
  maxLos: number | null;
  discountType: DiscountType|null;
  discountValue: number | null;
  isActive: boolean;
  isAutoApplied: boolean;
  currencyCode: CurrencyCode;

}
