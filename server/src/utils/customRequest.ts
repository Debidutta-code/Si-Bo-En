import { Request as ExpressRequest } from 'express';
import { Role } from './jwtHelper';
import { IUserRolesAndAccess } from '../access-control/types/access.types';
export interface CustomRequest extends ExpressRequest {

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
