import type { IAddon } from "./addon.type";
import type { IAddonCategory } from "./category.type";
import type { IAddonVariant } from "./variant.type";


// AddonSubCategory interfaces
export interface IAddonSubCategory {
    id: string;
    code: string;
    name: string;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAddonSubCategoryCreate {
    name: string;
    categoryId: string;
}

export interface IAddonSubCategoryUpdate {
    name: string;
    categoryId: string;
}

export interface IAddonSubCategoryWithRelations extends IAddonSubCategory {
    category?: IAddonCategory;
    addons?: IAddon[];
    variants?: IAddonVariant[];
}