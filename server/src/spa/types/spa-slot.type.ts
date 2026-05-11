import { CurrencyCode } from '../../tax-system/interfaces';

export interface ICSpaDatesS {
    date: Date;
}
export interface ICSpaDatesR extends ICSpaDatesS {
    spaModuleId: string;
}
export interface ISpaDates extends ICSpaDatesR {
    id: string;
    Slots: ISpaSlotsWReservation[];
}
export interface BatchPayload {
    count: number;
}
export interface ICSpaSlotS {
    startTime: Date;
    endTime: Date | null;
    isBooked: boolean;
}
export interface ICSpaSlotR extends ICSpaSlotS {
    spaDateId: string;
}
export interface ISpaSlot extends ICSpaSlotR {
    id: string;
    isCompleted: boolean;
    reservationId: string | null;
}
export interface ISpaSlotsWReservation extends ISpaSlot {
    Reservation: {
        bookingCode: string;
    } | null;
}
export interface IMarkSlotAdAvilable {
    reservationId: string;
    userName: string;
    isBooked: boolean;
}
export interface ITaxBrakeDown {
    currencyCode: CurrencyCode;
    name: string;
    taxedAmount: number;
    pricingBrakeDownId: string;
}
