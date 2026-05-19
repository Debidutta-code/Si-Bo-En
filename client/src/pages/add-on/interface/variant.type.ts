import type { IAddon } from "./addon.type";
import type { IAddonSubCategory } from "./sub-category.type";

// AddonVariant interfaces
export interface IAddonVariant {
    id: string;
    code: string;
    name: string;
    subcategoryId: string;
    createdAt: Date;
    updatedAt: Date;
    _translations?: {
        name: string
    }
}

export interface IAddonVariantCreate {
    name: string;
    subcategoryId: string;
}

export interface IAddonVariantUpdate {
    name: string;
    subcategoryId: string;
}

export interface IAddonVariantWithRelations extends IAddonVariant {
    subCategory?: IAddonSubCategory;
    addons?: IAddon[];
}