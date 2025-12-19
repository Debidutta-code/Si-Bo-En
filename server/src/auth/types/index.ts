import { Types } from "mongoose";

export interface UpdateBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?:
    "staff" | "super_admin" | "group_manager" | "hotel_manager" | "brand_manager" | "revenue_manager";
  password?: string;
}
export interface RegisterBody {
  firstName: string;
  lastName: string;
  email: string;
  name?: string;
  password: string;
  role?:
    "staff" | "super_admin" | "group_manager" | "hotel_manager" | "brand_manager" | "revenue_manager"
  createdBy?: string; // Added createdBy field which is set in createUser endpoint
  propertyId?: string;
  level?: 0|1|2|3;
  creationId:string
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface IErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}
export interface ICreateUser {
  firstName: string;
  lastName: string;
  name?: string;
  contact: number;
  email: string;
  password: string;
  role: 'groupManager' | 'hotelManager' | 'staff' | 'brandManager';
  createdBy?: string;
  userLevel?: 0 | 1 | 2 | 3;
  creatorRole?: string;
}

export interface ICreation {
  type: 'group' | 'brand' | 'property'|'super';
  name: string;
  level0Users?: string[];
  level1Users?: string[];
  level2Users?: string[];
  level3Users?: string[];
  level4Users?:string[];
  createdById: string;
  superId?:string;
  groupId?:string;
  brandId?:string;
  propertyId?: string;
  groupIds?:string[];
  brandIds?:string[];
  propertyIds?:string[];
  isActive:boolean;
  isDeleted:boolean

}
export interface PropertyFilters {
  superId?: string | string;
  groupId?: string | string;
  brandId?: string | string;
}
export interface IRUsers{
  firstName: string;  
  lastName: string;
  email: string;
  role: string;
  id:string;
}