export interface ICCategory {
    name: string;
    code: string;
    propertyId:string|null;
}
export interface IAddOnCategory extends ICCategory {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUCategory {
    name: string;
}