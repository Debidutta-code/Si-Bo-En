import type { roomUnit,smokingPolicy } from "../create/types/types";

export interface IPropertyEmail {
  id: string;
  email: string;
  propertyId: string;
}

export interface IPropertyDetails {
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  propertyCode: string;
  creationId: string;
  propertyCategory: {
    masterCategory: {

      id: string;
      categoryName: string;
      categoryDescription: string
    }
  };
  destinationType: {
    masterDestinationType: {

      id: string;
      destinationTypeName: string
      destinationDescription: string;
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
  image: string[],
  propertyEmails: IPropertyEmail[];
}
export interface IPropertyAddress {
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  landmark: string;
  location: string;
  longitude: string;
  latitude: string;
  zipCode: string;
}


// types/types.ts
export interface IAmenity {
  id: string;
  amenityName: string;
  description: string | null;
  icon: string | null;
}

export interface IRoomAmenitySelection {
  id: string;
  roomId: string;
  amenityId: string;
  amenity: IAmenity;
}

export interface IRoom {
  id: string;
  roomName: string;
  roomType: string;
  totalRoom: number;
  availableRooms: number;
  floor: number;
  roomSize: number;
  roomUnit: roomUnit;
  smokingPolicy: smokingPolicy;
  maxOccupancy: number;
  maxNumberOfAdults: number;
  maxNumberOfChildren: number;
  numberOfBedrooms: number;
  numberOfLivingRoom: number;
  extraBed: number;
  description: string;
  priority: number;
  image: string[];
  available: boolean;
  isDeleted: boolean;
  __v: number;
  view360Link?: string;
  roomVideos?: {
    url: string;
    thumbnail: string;
  };
  // New relational structure for amenities
  roomAmenities?: IRoomAmenitySelection[];
  RoomViews?: {
    MasterRoomView?: {
      id: string;
      viewName: string;
    };
  };
}
export interface IRatePlans {
  hotelCode: string
  hotelName: string
  ratePlanCode: string
  ratePlanName: string
}

export interface PaymentIntegrationDetail {
  id: string;
  isActive: boolean;
  outletId: string;
  paymentIntegration: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

export interface PaymentMethods {
  payAtHotel: boolean;
  paymentGateway: boolean;
  selectedPaymentIntegration: PaymentIntegrationDetail | null;
}

export interface IBankDetails {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
}
