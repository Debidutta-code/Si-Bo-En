export interface IPropertyType {
  id: string;
  propertyTypeName: string;
  description: string;
}
export interface IDestinationType {
  id: string;
  destinationTypeName: string;
  description: string;
}
export interface IPropertyCategory {
  id: string;
  categoryName: string;
  description: string;
}
export interface IPropertyDetails {
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  propertyCategory: {
    masterCategory:{

      id: string;
      categoryName: string;
      categoryDescription: string
    }
  };
  
  propertyType: {
    masterPropertyType:{

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
  setPropertyId:(propertyId:string)=>void;
  setIsUpdating:(val:boolean)=>void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export interface IRoomDetails {
  roomName?: string;
  roomType?: string;
  totalRoom?: number;
  roomView?: string;
  floor?: number;
  roomSize?: number;
  roomUnit?: string;
  smokingPolicy?: string;
  maxOccupancy?: number;
  maxNumberOfAdults?: number;
  maxNumberOfChildren?: number;
  numberOfBedrooms?: number;
  numberOfLivingRoom?: number;
  extraBed?: number;
  description?: string;
  image?: string[];
  available?: boolean;
  view360Link?: string;
  roomVideos?: {
    thumbnail: string;
    url: string;
  };
}