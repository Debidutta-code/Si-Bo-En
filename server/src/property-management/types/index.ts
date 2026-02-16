import { Types } from 'mongoose';

export interface CreatePropertyData {
  id?: Types.ObjectId
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  propertyType: Types.ObjectId;
  propertyCategory: Types.ObjectId;
  destinationType: Types.ObjectId;
  description?: string;
  image?: string[];
  starRating?: number;
  isDraft?: boolean;
  propertyCode?: string;
  level3Id?: Types.ObjectId;
  level2Id?: Types.ObjectId;
  level1Id?: Types.ObjectId;
  createdBy: Types.ObjectId;
  gbpRef:Types.ObjectId
}


// export interface AmenityType {
//   room
//   property
// }


export interface PropertyQueryOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1 | 'asc' | 'desc'>;
  select?: string;
  populate?: string[] | Record<string, any>;
}
import type {IUPropertyConfig} from "./property-config.type"
import type {IBookingEngineConfig} from "./bokingEngine.types"
export type {
  IUPropertyConfig,
  IBookingEngineConfig
}

export * from "./vedio.types";

export * from "./integration.type"