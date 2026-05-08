export interface ICVariant {
    name: string;
    code: string;
    subcategoryId: string;
}
export interface IAddonVariant extends ICVariant {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
