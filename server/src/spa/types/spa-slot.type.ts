export interface ICSpaDates {
    spaModuleId: string;
    date: Date;
}
export interface ISpaDates extends ICSpaDates {
    id: string;
    Slots: ISpaSlot[];
}
export interface BatchPayload{
    count: number;
}
export interface ICSpaSlot{
    startTime: Date;
    endTime: Date|null;
    spaDateId: string;
    isBooked: boolean;
}
export interface ISpaSlot extends ICSpaSlot{
    id: string;
}