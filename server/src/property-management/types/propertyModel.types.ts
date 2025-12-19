import { Types } from 'mongoose';

// Interface definitions remain the same...
export interface IPropertyAddress {
  addressLine1: string;
  addressLine2?: string;
  country: string;
  state: string;
  city: string;
  location: string;
  landmark: string;
  zipCode: number;
  latitude: number;
  longitude: number;
}
export interface IPropertyAmenity {
  amenities: Record<string, boolean>;
}
export interface ICategory {
  masterCategory:{
  id: string
  categoryName: string;
  categoryDescription: string;
  }
}
export interface IDestinationType {
  masterDestinationType:{

    id: string
  
    destinationTypeName: string;
    destinationDescription: string;
  }
}
export interface IPropertyType {
  masterPropertyType:{
  id: string

  propertyTypeName: string;
  propertyTypeDescription: string;
  }
}
export interface IPropertyInfoType {
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  starRating?: any;
  propertyCode: string;
  description: string;
  image?: string[];
  propertyCategory?: ICategory;
  destinationType?: IDestinationType;
  propertyType?: IPropertyType;
  propertyAddress?: IPropertyAddress;
  propertyAmenities?: IPropertyAmenity;
  propertyRoom?: string[];
  isDraft: boolean;
  isAvailable: boolean;
  isDeleted: boolean;
  ratePlan?: string[];
  creationId: string;
  createdById: string;
}
export interface ICreatePropertyData {
  id?: string
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  propertyType: IPropertyType;
  propertyCategory: ICategory;
  destinationType: IDestinationType;
  description?: string;
  image?: string[];
  starRating?: number;
  isDraft?: boolean;
  propertyCode?: string;
  creationId: string;

}
export interface IUpdatePropertyData {
  propertyName?: string;
  propertyEmail?: string;
  propertyContact?: string;
  starRating?: number;
  description?: string;
  image?: string[];
  isAvailable?: boolean;
  propertyType: IPropertyType;
  propertyCategory: ICategory;
  destinationType: IDestinationType;
}