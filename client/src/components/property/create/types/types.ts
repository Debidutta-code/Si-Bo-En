export interface IPropertyType {
  id: string;
  propertyTypeName: string;
  propertyTypeDescription: string;
}
export interface IDestinationType {
  id: string;
  destinationTypeName: string;
  destinationDescription: string;
}
export interface IPropertyCategory {
  id: string;
  categoryName: string;
  categoryDescription: string;
}
export interface IPropertyDetails {
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  propertyCategory: {
    masterCategory: {

      id: string;
      categoryName: string;
      categoryDescription: string
    }
  };
  propertyType: {
    masterPropertyType: {

      id: string;
      propertyTypeName: string
      propertyTypeDescription: string;
    }

  };
  description: string;
  image: string[];
}
export interface IPropertyAddress {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  location: string;
  landmark: string;
  zipCode: string;
  latitude: string;
  longitude: string;
}

export interface PropertyAddressProps {
  isUpdating: boolean;
  propertyId: string;
  setPropertyId: (propertyId: string) => void;
  setIsUpdating: (val: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}
export type roomView = "sea" | "garden" | "city" | "mountain" | "others";
export type roomUnit = "sqm" | "sqft";
export type smokingPolicy = "smoking" | "non_smoking" | "designated_area";

export interface IRoomDetails {
  roomName: string;
  roomType: string;
  totalRoom: number;
  floor: number;
  roomView: roomView;
  roomSize: number;
  roomUnit: roomUnit;
  smokingPolicy: smokingPolicy;
  maxOccupancy: number;
  maxNumberOfAdults: number;
  maxNumberOfChildren: number;
  image: string[];
  numberOfBedrooms?: number;
  numberOfLivingRoom?: number;
  extraBed?: number;
  description: string | null;
  available: boolean;
  priority: number;
}
export interface IAmenityTypes {
  amenityName: string;
  description: string | null;
  icon: string | null;
  id: string
}
export interface IRatePlan {
  propertyCode: string;
  propertyName: string;
  ratePlanName: string;
}