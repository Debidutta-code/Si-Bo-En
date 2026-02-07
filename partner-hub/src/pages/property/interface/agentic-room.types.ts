export type RoomView = "sea"
  | "garden"
  | "mountain"
  | "others"
  | "city";

export type RoomUnit = "sqft"
  | "sqm";

export type SmokingPolicy = "smoking"
  | "non_smoking"
  | "designated_area";

export interface IRoomAmenity {
  amenity: {
    amenityName: string;
    description: string | null;
    icon: string | null;
  };
}

export interface IRoomVideo {
  roomId: string;
  url: string;
  thumbnail: string | null;
}

export interface IRoom {
  id: string;
  roomName: string;
  roomType: string;
  totalRoom: number;
  floor: number;
  roomView: RoomView;
  roomSize: any;
  roomUnit: RoomUnit;
  smokingPolicy: SmokingPolicy;
  maxOccupancy: number;
  maxNumberOfAdults: number;
  maxNumberOfChildren: number;
  numberOfBedrooms: number;
  numberOfLivingRoom: number | null;
  extraBed: number | null;
  description: string | null;
  view360Link: string | null;
  image: string[];
  available: boolean;
  isDeleted: boolean;
  propertyId: string;
  roomVideos: IRoomVideo | null;
  roomAmenities: IRoomAmenity[];
}

export interface IRooms {
  id: string;
  agenticPropertyId: string;
  roomId: string;
  isActive: boolean;
  isDeleted: boolean;
  room: IRoom;
}