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
  _translations?:{
    propertyName:string,
    description:string,
  }
}

export interface propertyCategory {
  id: string;
  masterCategory: {
    categoryName: string;
    categoryDescription: string | null;
    _translations?:{
      categoryName:string,
      categoryDescription:string
    }
  };
}

export interface propertyType {
  id: string;
  masterPropertyType: {
    propertyTypeName: string;
    propertyTypeDescription: string | null;
      _translations?:{
      propertyTypeName:string,
      propertyTypeDescription:string
    }
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
  _translations?:{
    addressLine1: string,
    addressLine2: string,
    country: string,
    state: string,
    city: string,
    location: string,
    landmark: string
  }
}
