

// Query/Filter interfaces
export interface IAddonCategoryQuery {
    id?: string;
    code?: string;
    name?: string;
}

export interface IAddonSubCategoryQuery {
    id?: string;
    code?: string;
    name?: string;
    categoryId?: string;
}

export interface IAddonVariantQuery {
    id?: string;
    code?: string;
    name?: string;
    subcategoryId?: string;
}

export interface IAddonQuery {
    id?: string;
    propertyId?: string;
    categoryId?: string;
    subcategoryId?: string;
    variantId?: string;
    code?: string;
    name?: string;
    isActive?: boolean;
}

export interface IBookingAddonQuery {
    id?: string;
    bookingId?: string;
    addonId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface IAddonAvailabilityQuery {
    id?: string;
    addonId?: string;
    propertyId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    isAvailable?: boolean;
}