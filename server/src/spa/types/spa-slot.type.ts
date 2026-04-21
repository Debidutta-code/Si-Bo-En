export interface ICSpaSlot {
    time: string;
    isBooked: boolean;
    spaModuleId: string;
    date: Date;
}
export interface ISpaSlot extends ICSpaSlot {
    id: string;
}
export interface BatchPayload{
    count: number;
}