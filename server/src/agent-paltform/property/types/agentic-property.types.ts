export interface IPropertyConfigs {
    baseCurrency: string;
    showVideo: boolean;
    commission: boolean;
    timezone: string;
    isB2bAvailable: boolean; // ← ADDED
    isB2cAvailable: boolean; // ← ADDED
}

export interface IProperty {
    id: string;
    propertyName: string;
    propertyEmail: string;
    propertyContact: string;
    propertyCode: string;
    description: string;
    image: string[];
    propertyAddress: IPropertyAddress | null; // ← removed ?
    propertyAmenities: IPropertyAmenities[];
    propertyCategory: IPropertyCategory | null;
    propertyType: IPropertyType | null;
    propertyVideos: PropertyVideo | null;
    propertyConfigs: IPropertyConfigs | null;
}

export interface IPropertyAddress {
    addressLine1: string;
    addressLine2: string | null;
    country: string;
    state: string;
    city: string;
    location: string;
    landmark: string;
    zipCode: string;
    latitude: number;
    longitude: number;
}

export interface IPropertyCategory {
    masterCategoryId: string;
    masterCategory: IPropertyMasterCategory;
}

export interface IPropertyMasterCategory {
    categoryName: string;
    categoryDescription: string | null;
    isActive: boolean;
}

export interface IPropertyType {
    masterPropertyTypeId: string;
    masterPropertyType: IPropertyMasterType;
}

export interface IPropertyMasterType {
    propertyTypeName: string;
    propertyTypeDescription: string | null;
    isActive: boolean;
}

export interface PropertyVideo {
    propertyId: string;
    url: string;
    thumbnail: string | null;
}

export interface IMasterAmenity {
    amenityName: string;
    description: string | null;
    icon: string | null;
}

export interface IPropertyAmenities {
    amenity: IMasterAmenity;
}
