import { Decimal } from "@prisma/client/runtime/library";
import {IFolioLine} from "./folio-line.type";
import {IPayment} from "./payment.type";
import { CurrencyCode } from "../../../../tax-system/interfaces/tourist-tax.type";
export type FolioStatus="open"|"closed";

export interface ICFolio{
    bookingCode:string;
    reservationId:string;
    status:FolioStatus;
    totalAmount:Decimal;
    propertyId:string;
    currency:CurrencyCode
}

export interface IFolio extends ICFolio{
    id:string;
    createdAt:Date;
    updatedAt:Date;
}

export interface IFolioWithPaymentAndLine extends IFolio{
    folioLines: IFolioLine[];
    payments: IPayment[];
}