
import type {   IFolio } from "./folio.type";
import { CurrencyCode } from "../../../../tax-system/interfaces/tourist-tax.type";

export interface ICFolioLine {
    folioId: string;
    description: string;
    amount: number;
    taxAmount: number;
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