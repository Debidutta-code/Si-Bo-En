export interface ICSubCategory {
    name: string;
    code: string;
    categoryId: string;
    propertyId: string | null;

}
export interface IAddonSubCategory extends ICSubCategory {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUSubCategory {
    name: string;

}