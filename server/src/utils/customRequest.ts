import e, { Request as ExpressRequest } from 'express';
import { Role } from './jwtHelper';
import { IUserRolesAndAccess } from '../access-control/types/access.types';
export interface PropertyRequest extends ExpressRequest {
    property?: {
        id: string;
        propertyName: string;
        propertyCode: string;
        creationId: string;
        timezone?: string;
        currencyCode?: string;
    };
}
export interface PropertyCustomRequest extends PropertyRequest {
    user?: {
        id: string;
        email: string;
        role?: Role;
        level?: number;
        creationId: string;
    };
    jwt?: string;
    permission?: IUserRolesAndAccess;
}
export interface CustomRequest extends ExpressRequest {
    user?: {
        id: string;
        email: string;
        role?: Role;
        level?: number;
        creationId: string;
    };
    customer?: {
        id: string;
        email: string;
    };
    jwt?: string;
    permission?: IUserRolesAndAccess;
    property?: {
        id: string;
        propertyName: string;
        propertyCode: string;
        creationId: string;
        timezone?: string;
        currencyCode?: string;
    };
}

export interface RateTigerRequest extends ExpressRequest {
    rateTiger?: {
        partnerId: string;
        apiKey: string;
        propertyCode?: string;
        rtHotelCode?: string;
    };
}


