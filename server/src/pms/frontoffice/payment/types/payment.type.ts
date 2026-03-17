import { IFolio } from "./folio.type";
import { CurrencyCode } from "../../../../tax-system/interfaces/tourist-tax.type";
export type PaymentMethod = "credit_card" | "debit_card" | "net_banking" | "upi" | "wallet" | "cash"
export type PaymentStatus = "confirmed" | "cancelled" | "pending"
export interface ICPayment {
    folioId: string;
    amount: number;
    paymentMethod: PaymentMethod
    paymentDate: Date;
    currency: CurrencyCode;

    processedBy: string;
    paymentNote: string|null;

    paidAt: Date;
    paymentStatus: PaymentStatus
}

export interface IPayment extends ICPayment{
    id:string;
    createdAt:Date;
    updatedAt:Date;
}
export interface IPaymentWithFolio extends IPayment{
folio:IFolio
}