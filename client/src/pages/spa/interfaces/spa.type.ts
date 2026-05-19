import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import type { ISpaDates, ISpaUser } from ".";
import type { ISpaCategory, ISpaSubCategory } from "@/pages/management/types";

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
    discountValue: number|null;
    currencyCode: CurrencyCode|null;
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
    discountValue: number|null;
    currencyCode: CurrencyCode|null;
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
    discountValue: number|null;
    currencyCode: CurrencyCode|null;
    categoryId: string;
    subCategoryId: string;
}
export interface ISpaO extends ICSpaR {
    id: string;
    isActive: boolean;

}
export interface ISpa extends ICSpaR {
    id:string;
    Category: ISpaCategory;
    SubCategory: ISpaSubCategory;
    User: {
        id:string;
        firstName: string;
        lastName: string;
        email: string;
    };
    AssignedSpas:{
        id:string;
        User:ISpaUser
    }[];
    isActive: boolean;
    createdAt: string;
    _translations?: {
        name: string;
        description: string;
        location: string
    }
}
export interface ISpaWSlots extends ISpa {
    SpaDates: ISpaDates[];
}
// export interface ISpaUser {
//     id: string;
//     firstName: string;
//     lastName: string;
//     email: string;
// }

// export interface ICSpaUserAssignment {
//     userId: string;
//     spaId: string;
// }