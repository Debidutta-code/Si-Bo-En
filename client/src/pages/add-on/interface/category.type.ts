import type { IAddon } from "./addon.type";
import type { IAddonSubCategory } from "./sub-category.type";

// AddonCategory interfaces
export interface IAddonCategory {
    id: string;
    code: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    _translations?: {
        name: string;
    }
}

export interface IAddonCategoryCreate {
    name: string;
}

export interface IAddonCategoryUpdate {
    name: string;
}

export interface IAddonCategoryWithRelations extends IAddonCategory {
    subcategories?: IAddonSubCategory[];
    addons?: IAddon[];
}