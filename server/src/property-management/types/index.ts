
export interface CreatePropertyData {
  id?: string
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  propertyType: string;
  propertyCategory: string;
  destinationType: string;
  description?: string;
  image?: string[];
  starRating?: number;
  isDraft?: boolean;
  propertyCode?: string;
  level3Id?: string;
  level2Id?: string;
  level1Id?: string;
  createdBy: string;
  gbpRef:string
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

export * from "./integration.type";
export * from "./room.type";
export * from "./propertyModel.types";