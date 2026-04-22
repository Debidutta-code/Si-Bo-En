export interface ICSpaDatesS {
    date: Date;

}
export interface ICSpaDatesR extends ICSpaDatesS {
    spaModuleId: string;

}
export interface ISpaDates extends ICSpaDatesR {
    id: string;
    Slots: ISpaSlot[];
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
}