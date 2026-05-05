export interface ICBookingOffsetS {
    minimumAdvanceBookingOffset: number | null;
    maximumAdvanceBookingOffset: number | null;
    minimumAmendBookingOffset: number | null;
    maximumAmendBookingOffset: number | null;
    minimumCancelBookingOffset: number | null;
    maximumCancelBookingOffset: number | null;
}
export interface IUBookingOffsetR {
    minimumAdvanceBookingOffset: number | null;
    maximumAdvanceBookingOffset: number | null;
    minimumAmendBookingOffset: number | null;
    maximumAmendBookingOffset: number | null;
    minimumCancelBookingOffset: number | null;
    maximumCancelBookingOffset: number | null;
}
export interface ICBookingOffsetR extends ICBookingOffsetS {
    propertyId: string;
    ratePlanCode: string;
    ratePlanId: string;
    ratePlanName: string;
    date: Date;
}
export interface IBookingOffset extends ICBookingOffsetR {
    id: string;
    date: Date;
}
export type BatchPayload = {
    count: number;
};
export interface IUpsertBookingOffsetEntry {
    date: Date;
    minimumAdvanceBookingOffset?: number | null;
    maximumAdvanceBookingOffset?: number | null;
    minimumAmendBookingOffset?: number | null;
    maximumAmendBookingOffset?: number | null;
    minimumCancelBookingOffset?: number | null;
    maximumCancelBookingOffset?: number | null;
}
