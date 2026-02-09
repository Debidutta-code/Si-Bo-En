export interface ICategory {
  id: string;
  categoryName: string;
  categoryDescription: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPropertyType {
  id: string;
  propertyTypeName: string;
  propertyTypeDescription: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}


export interface IAmenity {
  id: string;
  amenityName: string;
  description?: string;
  icon?: string;
}

export interface ILoyaltyGuestField {
  id: string;
  fieldName: string;
  createdAt?: string;
  updatedAt?: string;
}
