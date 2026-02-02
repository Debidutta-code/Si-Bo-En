import type { IAddonAvailability } from "./addon-availability.type";
import type { IBookingAddon } from "./booking-addon.type";
import type { IAddonCategory } from "./category.type";
import type { IAddonSubCategory } from "./sub-category.type";
import type { IAddonVariant } from "./variant.type";

// Addon interfaces
export type PostingRhythm = "per_night" | "per_stay" | "per_person_per_night" | "per_person_per_stay" | "per_person_per_room" | "per_room" | "per_room_per_night";

export interface IAddon {
    id: string;
    propertyId: string;
    categoryId: string | null;
    subcategoryId: string | null;
    variantId: string | null;
    code: string;
    name: string;
    postingRhythm: PostingRhythm;
    description: string | null;
    isActive: boolean;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IAddonCreate {
    name: string;
    postingRhythm: PostingRhythm;
    description?: string;
    isActive: boolean;
    images: string[];
    categoryId?: string;
    subcategoryId?: string;
    variantId?: string;
}

export interface IAddonUpdate {
    name?: string;
    postingRhythm: PostingRhythm;
    description?: string | null;
    isActive: boolean;
    images: string[];
    categoryId?: string | null;
    subcategoryId?: string | null;
    variantId?: string | null;
}

export interface IAddonWithRelations extends IAddon {
    property?: any;
    subCategory?: IAddonSubCategory | null;
    category?: IAddonCategory | null;
    addonVariant?: IAddonVariant | null;
    bookingAddons?: IBookingAddon[];
    availability?: IAddonAvailability[];
}