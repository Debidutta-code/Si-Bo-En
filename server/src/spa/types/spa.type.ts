import { ISpaDates, ISpaSlot, ISpaUser } from '.';
import { CurrencyCode } from '../../tax-system/interfaces';
import { ICSpaCatrgory, ICSpaSubCategory } from '../../utils-management/types';

export interface ICSpaR {
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
}
export interface ICSpaC {
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
    categoryId: string;
    subCategoryId: string;
    propertyId: string;
}
export interface IUSpaR {
    name: string;
    itemCode: string;
    description: string;
    benefits: string[];
    conditions: any;
    isInclusive: boolean;
    images: string[];
    serviceTime: number;
    location: string;
    isActive: boolean;
    discountValue: number | null;
    currencyCode: CurrencyCode | null;
    categoryId: string;
    subCategoryId: string;
}
export interface ISpaO extends ICSpaR {
    id: string;
    isActive: boolean;
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
    AssignedSpas: {
        id: string;
        User: ISpaUser;
    }[];
    isActive: boolean;
}
export interface ISpaWSlots extends ISpa {
    SpaDates: ISpaDates[];
}
export interface IReservationSpa {
    id: string;
    propertyId: string;
    bookingCode: string;
    reservationStartDate: Date;
    reservationEndDate: Date;
}
