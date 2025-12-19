
// import { IFolio, IFolioWithPaymentAndLine } from "../../payment/types";
import { IGuests, ICGuest } from "../../guest/types";
// import { IReservationRoom, ICReservationRoomService } from "../../room-management/types";
import { Decimal } from "../../../../generated/prisma/runtime/library";
export type ReservationStatus = "reserved" | "checked_in" | "checked_out" | "cancelled" | "no_show";
export type BookingSource = "ota" | "walk_in" | "corporate";
import { CurrencyCode, PaymentMethod } from "../../payment/types";
export interface ICReservation {
    bookingCode: string;

    bookedAt: Date;
    reservationStatus: ReservationStatus;

    noOfAdults: number;
    noOfChildren: number;
    noOfInfants: number;

    isDeleted: boolean;
    from: Date;
    to: Date;
    checkedInDate: Date | null;
    checkedOutDate: Date | null;
    additionalNotes: string | null;

    // primaryGuestId: string;

    source: BookingSource;
    propertyCode: string;
    propertyName: string;

    // folioId?: string | null;
}
export interface ICReservationService {
    bookedAt?: Date;
    paymentNote: string | null;
    totalAmount: Decimal;
    currencyCode: CurrencyCode;
    paidAmount: Decimal;
    paymentMethod: PaymentMethod;
    noOfAdults: number;
    noOfChildren: number;
    noOfInfants: number;
    Guests: ICGuest[];
    // PrimaryGuest: ICGuest;
    // ReservationRooms: ICReservationRoomService[];
    // PartialReservationRooms: IPartialReservationRoomService[];
    from: Date;
    to: Date;
    additionalNotes: string | null;
    // folioId: string | null;
    source: BookingSource;

    propertyId: string
}
export interface IReservationWPG extends IReservation {
    id: string;
    Guests: IGuests[];
    // folio: IFolioWithPaymentAndLine | null;

}
export interface IReservation extends ICReservation {
    id: string;
    Guests: IGuests[];
    // PrimaryGuest: IGuests;

    createdAt: Date;
    updatedAt: Date;
}
export interface IReservationWithAllDetails extends IReservation {
    // folio: IFolioWithPaymentAndLine | null;
    // ReservationRooms: IReservationRoom[];
    // partialRooms: IPartialReservationRoom[];
    addOns: any[];
}

export interface ICPartialReservationRoom {
    reservationId: string

    roomTypeCode: string
    roomTypeName: string;
    quantity: number;
    ratePlanCode: string;
    ratePlanName: string;
    noOfAdults: number;
    noOfChildren: number;
    noOfInfants: number;
}
export interface IPartialReservationRoom extends ICPartialReservationRoom {
    id: string;
}
export interface IPartialReservationRoomService {
    roomTypeId: string;
    quantity: number;
    ratePlanCode: string;
    noOfAdults: number;
    noOfChildren: number;
    noOfInfants: number;
}

export interface IReservationPriceBrakeDownS {
    additionalGuestCharges: number
    baseRatePerNight: number
    numberOfNights: number
    priceAfterTax: Decimal
    totalAmount: Decimal
    totalTax: Decimal
    breakdown: any
    dailyBreakdown: any[]
}
export interface IReservationPriceBrakeDownR  {
        additionalGuestCharges: number
    baseRatePerNight: number
    numberOfNights: number
    priceAfterTax: Decimal
    totalAmount: Decimal
    totalTax: Decimal
    breakdown: any
    dailyBreakdown: any[]
    reservationId: string;
}
export interface IReservationPriceBrakeDown extends IReservationPriceBrakeDownS {
    id: string;
    reservationId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAriManulupulation {
    propertyCode:string;
    roomInfos: AriManupulationRooms[];
    dates:string[];
}
export interface AriManupulationRooms{
    roomTypeCode: string;
    numberOfRooms: number;
}