import { ICreatePropertyData } from ".";

export type roomUnit = "sqm" | "sqft";
export type smokingPolicy = "smoking" | "non_smoking" | "designated_area";
export interface ICRoom {
    roomName: string;
    roomType: string;
    totalRoom: number;
    floor: number;
    roomSize: number;
    roomUnit: roomUnit;
    smokingPolicy: smokingPolicy;
    maxOccupancy: number;
    maxNumberOfAdults: number;
    maxNumberOfChildren: number;
    propertyId: string;
    image: string[];
    numberOfBedrooms: number;
    numberOfLivingRoom: number;
    extraBed: number;
    description: string | null;
    available: boolean;
    priority: number;
    RoomViews: {
        MasterRoomView: {
            id: string;
            viewName: string;
        }

    }|null
}
export interface IRoom extends ICRoom {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IRoomWProperty extends IRoom {
    property: ICreatePropertyData;
}