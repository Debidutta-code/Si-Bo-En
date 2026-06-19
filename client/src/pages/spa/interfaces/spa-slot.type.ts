// interfaces/spa-slot.type.ts — replace entirely

export interface IgetInDates {
    startDate: Date;
    endDate: Date;
}

export interface ICSpaDatesS {
    date: Date;
}
export interface ICSpaDatesR extends ICSpaDatesS {
    spaModuleId: string;
}
export interface ISpaDates extends ICSpaDatesR {
    id: string;
    slots: ISpaSlotWAvailability[]; // lowercase, matches API response
}

export interface BatchPayload {
    count: number;
}

export type SlotStatus = 'active' | 'inactive' | 'booked' | 'completed' | 'cancelled';

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
    userName: string | null
}

export interface ISpaSlotWAvailability extends ISpaSlot {
    slotsAvailable: ISlotsAvailable[];
}