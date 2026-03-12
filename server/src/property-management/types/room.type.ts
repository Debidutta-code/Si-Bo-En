import { ICreatePropertyData } from ".";

export type roomView = "sea" | "garden" | "city" | "mountain" | "others";
export type roomUnit = "sqm" | "sqft";
export type smokingPolicy = "smoking" | "non_smoking" | "designated_area";
export interface ICRoom {
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
    propertyId: string;
    image: string[];
    numberOfBedrooms?: number;
    numberOfLivingRoom?: number;
    extraBed?: number;
    description: string | null;
    available: boolean;
    priority: number;
}
export interface IRoom extends ICRoom {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IRoomWProperty extends IRoom {
    property: ICreatePropertyData;
}