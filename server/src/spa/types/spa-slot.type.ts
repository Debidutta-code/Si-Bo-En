// spa-slots.types.ts

import { CurrencyCode } from "../../tax-system/interfaces";

export interface ICSpaDatesS {
    date: Date;
}
export interface ICSpaDatesR extends ICSpaDatesS {
    spaModuleId: string;
}
export interface ISpaDates extends ICSpaDatesR {
    id: string;
    slots: ISpaSlotWAvailability[];
}
export interface BatchPayload {
    count: number;
}

// SpaSlots — clean, no booking state here anymore
export interface ICSpaSlotS {
    startTime: Date;
    endTime: Date | null;
}
export interface ICSpaSlotR extends ICSpaSlotS {
    spaDateId: string;
}
export interface ISpaSlot extends ICSpaSlotR {
    id: string;
}

export interface ISlotsAvailable {
    id: string;
    spaSlotId: string;
    status: SlotStatus;
    reservationId: string | null;
    slotBooking?: ISlotBooking | null;
    spaSlot?:ISpaSlot | null;
    userName?:string|null;
    userEmail?:string|null;
    
}
 export  interface IBookAvailability {
        availabilityId: string;
        slotId: string;
        spaId: string;
        userName?: string;
        userEmail?: string;
    }
export type SlotStatus = 'active' | 'inactive' | 'booked' | 'completed' | 'cancelled';

export interface ISpaSlotWAvailability extends ISpaSlot {
    slotsAvailable: ISlotsAvailable[];
}


export interface ISlotBooking {
    id: string;
    spaBookingId: string;
    spaId: string;
    amount: number;
    slotsAvailableId: string;      
}

export interface IGuestSlot {
    guestName: string;
    guestEmail: string | null;
    spaId: string;
    slotsAvailableId: string;
    amount: number;
}

export interface ISpaBookingRequest {
    userEmail: string;
    userName: string;
    currencyCode: CurrencyCode;
    userContactNumber: string;
    userId?: string;
    bookingCode?: string;
    slots: {
        spaId: string;
        slotsAvailableId: string;  
        userName?: string;
        userEmail?: string;
    }[];
    additionalGuests?: IGuestSlot[]; // NEW
}

export interface ICSpaSlotBatch {
    spaDateId: string;
    startTime: Date;
    endTime: Date | null;
    availability: number;
}