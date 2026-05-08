export interface IstartStopSellR {
    date: Date;
    roomTypeCode?: string;
    ratePlanCode?: string;
    isSellStop: boolean;
}
export interface IstartStopSellS {
    from: Date;
    to: Date;
    roomTypeCode?: string;
    ratePlanCode?: string;
    isSellStop: boolean;
}
