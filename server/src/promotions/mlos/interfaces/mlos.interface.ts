import { Decimal } from "@prisma/client/runtime/library";
import { DiscountType } from "../../customizable-deal/interfaces";

export interface IMLOSCreate {
  ratePlanId: string;
  startDate: Date | null;
  endDate: Date | null;
  minLos: number;
  maxLos: number | null;
  discountType: DiscountType|null;
  discountValue: Decimal | null;
  isActive: boolean;
  isAutoApplied: boolean;
}



export interface IMLOS {
  id: string;
  ratePlanId: string;
  startDate: Date | null;
  endDate: Date | null;
  minLos: number;
  maxLos: number | null;
  discountType: DiscountType|null;
  discountValue: Decimal | null;
  isActive: boolean;
  isAutoApplied: boolean;

}
