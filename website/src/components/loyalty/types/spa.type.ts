import { CurrencyCode } from "../../currencyCode/currency-code.type";

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

export interface ISpaBookingRequest {
    userEmail: string;
    userName:string;
    currencyCode:CurrencyCode;
    userContactNumber: string;
    userId?: string;
    slots: { spaId: string; spaSlotId: string }[];
}

export interface ICSpaCatrgory {
    name: string;
    _translations?: {
        name: string;
    }

}
export interface ISpaCategory extends ICSpaCatrgory {
    id: string;
}
export interface ICSpaSubCategory {
    name: string;
    categoryId: string;
    _translations?: {
        name: string;
    }

}
export interface ICSpaR {
    id:string;
    name: string;
    itemCode: string;
    description: string;
    benefits: string[];
    conditions: any;
    isInclusive: boolean;
    images: string[];
    serviceTime: number;
    location: string;
    discountValue: number | null;
    currencyCode: CurrencyCode | null;
    createdBy: string;
    categoryId: string;
    subCategoryId: string;
    propertyId: string;
    isActive:boolean;
    _translations?: {
        name: string;
        description: string;
        location: string;
    }

}
export interface ISpa extends ICSpaR {
    Category: ICSpaCatrgory;
    SubCategory: ICSpaSubCategory;
    User: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    isActive: boolean;
}
export interface ISpaWSlots extends ISpa {
    SpaDates: ISpaDates[];
}