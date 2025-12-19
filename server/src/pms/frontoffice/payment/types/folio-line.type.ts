
import { Decimal } from "@prisma/client/runtime/library";
import type {  IFolio ,CurrencyCode} from "./folio.type";

export interface ICFolioLine {
    folioId: string;
    description: string;
    amount: Decimal;
    taxAmount: Decimal;
    currencyCode:CurrencyCode
}

export interface IFolioLine extends ICFolioLine {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IFolioLineWithFolio extends IFolioLine{
        folio: IFolio;

}