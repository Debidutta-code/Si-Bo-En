export interface ICSubCategory {
    name: string;
    code: string;
    categoryId: string;
}
export interface IAddonSubCategory extends ICSubCategory {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
