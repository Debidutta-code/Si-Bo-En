export interface IPropertyDetails {
  id: string;
  propertyName: string;
  propertyCode: string;
  description: string;
  image: string[];
  propertyCategory: propertyCategory | null;
  propertyType: propertyType | null;
  propertyAddress: IPropertyAddress | null;
  basePrice?: number;
  currencyCode?: string;
}

export interface propertyCategory {
  id: string;
  masterCategory: {
    categoryName: string;
    categoryDescription: string | null;
  };
}

export interface propertyType {
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
