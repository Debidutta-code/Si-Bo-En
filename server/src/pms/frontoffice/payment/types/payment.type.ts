import { Decimal } from "../../../../generated/prisma/runtime/library";
import { CurrencyCode,IFolio } from "./folio.type";
export type PaymentMethod = "credit_card" | "debit_card" | "net_banking" | "upi" | "wallet" | "cash"
export type PaymentStatus = "confirmed" | "cancelled" | "pending"
export interface ICPayment {
    folioId: string;
    amount: Decimal;
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