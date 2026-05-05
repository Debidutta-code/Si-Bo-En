// group-search.types.ts

import { BaseEntity, EntityType } from '../../auth/types';

export interface IGroupSearchQuery {
  city?: string;
  startDate: string;
  endDate: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
    roomsArray: { adults: number; children: number; childAges: number[] }[];
  };
}

export interface IGroupCreations {
  id: string;
  type: EntityType;
  groupChildren: BaseEntity[];
}

export interface IBrandCreations {
  id: string;
  type: EntityType;
  brandChildren: BaseEntity[];
}

export interface IPropertyDetails {
  id: string;
  propertyName: string;
  propertyCode: string;
  description: string;
  image: string[];
  propertyCategory: IPropertyCategory | null;
  propertyType: IPropertyType | null;
  propertyAddress: IPropertyAddress | null;
}

export interface IPropertyWithBasePrice extends IPropertyDetails {
  basePrice: number;
  currencyCode: string;
}

export interface IBrandSummary {
  brandId: string;
  brandName: string;
}

export interface IPropertyCategory {
  id: string;
  masterCategory: {
    categoryName: string;
    categoryDescription: string | null;
  };
}

export interface IPropertyType {
  id: string;
  masterPropertyType: {
    propertyTypeName: string;
    propertyTypeDescription: string | null;
  };
}

export interface IPropertyAddress {
  id: string;
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