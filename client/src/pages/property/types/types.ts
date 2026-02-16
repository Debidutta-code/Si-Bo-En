import type { IMasterPartnersWProperty } from "../property/types";

export interface IProperty {
    id: string,
    propertyName: string;
    image: string[]
}
export interface IPropertyDetails {
    propertyName: string;
    propertyEmail: string;
    propertyContact: string;
    starRating: string;
    propertyCategory: {
        masterCategory: {

            id: string;
            categoryName: string;
            description: string
        };
    };
    
    propertyType: {
        masterPropertyType: {

            id: string;
            propertyTypeName: string
            description: string;
        }

    };
    propertyRoom: string[];
    description: string;
    propertyCode: string;
    propertyVideos?: {
      url: string;
      thumbnail: string | null;
    }
}
export interface IPropertyAddress {
    propertyId: string;
    addressLine1: string;
    addressLine2?: string;
    country: string;
    state: string;
    city: string;
    landmark: string;
    location: string;
    longitude: number;
    latitude: number;
    zipCode: number;
}
export interface INewGBP {
    name: string;
    type: "group" | "brand" | "property";
    creationId?: string;
    level: number;
    images: string[]
}
export interface ICreation {
    id: string;
    type: string;
    name: string;
    images:string[];
    level0Users?: string;
    level1Users?: string;
    level2Users?: string;
    level3Users?: string;
    level4Users?: string;
    superId?: string;
    groupId?: string;
    brandId?: string;
    propertyId?: string;
    groupIds?: string[];
    brandIds?: string[];
    propertyIds?: string[];

}

export interface Icreations {
    groups: ICreation[];
    brands: ICreation[];
    properties: ICreation[];
}
export interface IGroupCreations {
    groupData: {
        id: string;
        name: string;
        users: IUnmappedUsers[];
        superGroupName: string;
        createdAt: string;
        isActive: boolean;
        images:string[];
    }
    brands: ICreation[];
    properties: ICreation[];
}
export interface IBrandCreations {
    properties: ICreation[];
}
export interface IPropertyCreations {
    id: string;
    name: string;
    image: string[];
    isDrafted: boolean;
}
export interface IBrandDetails{
    id:string;
    name: string;
    images:string[]
    users: IUnmappedUsers[];
    under: string;
    createdAt: string;
    isActive: boolean;
}
export interface IpropertyCDetails{
    id:string;
    name: string;
    images:string[]
    users: IUnmappedUsers[];
    under: string;
    createdAt: string;
    isActive: boolean;
}
export interface IUpdateCreation{
    id:string;
    name: string;
    images:string[]
    isActive: boolean;
}

export interface IUnmappedUsers {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}
export interface HotelManagerMapping {
    hotelManagers: IUnmappedUsers[];
    staffs: IUnmappedUsers[];
    revenueManagers: IUnmappedUsers[];
    frontDesks: IUnmappedUsers[];
    housekeeping: IUnmappedUsers[];
}
export interface IAssignUser {
    creationId: string;
    userId: string;
    role: string;
}
export interface IGroupManagersMapping {
    groupManagers: IUnmappedUsers[]
}
export interface IBrandManagersMapping {
    brandManagers: IUnmappedUsers[]
}
export interface IntegrationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    partner: IMasterPartnersWProperty | null;
    propertyId: string;
    onIntegrationSuccess: () => void;
    onSubmit: (data: IntegrationSubmitData) => Promise<void>;

}

export interface IntegrationSubmitData {
    propertyId: string;
    masterIntegrationId: string;
    fields: Array<{ requiredFieldId: string; value: string }>;
}

export interface FieldError {
    [fieldId: string]: string;
}

export interface FieldValue {
    [fieldId: string]: string;
}