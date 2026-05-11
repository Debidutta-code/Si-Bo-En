export interface ICVariant {
    name: string;
    code: string;
    subcategoryId: string;
    propertyId: string | null;

}
export interface IAddonVariant extends ICVariant {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUVariant{
    name: string;
}
