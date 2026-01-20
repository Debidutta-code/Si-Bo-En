import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from '../utils/customRequest';
import { errorResponse } from '../utils/return';
import {prisma} from '../config';
import { Role } from '@prisma/client';

type Permission =
  //Hotel
  | 'canCreateHotel'
  | 'canUpdateHotel'
  | 'canDeleteHotel'
  | 'canViewHotel'
  //Payment
  | 'canUpdatePaymentDetails'
  //Rate Plan
  | 'canCreateRatePlan'
  | 'canViewRatePlan'
  | 'canUpdateRatePlan'
  | 'canDeleteRatePlan'
  | 'canAddInventory'
  | 'canCreateRoomAvailability'
  | 'canMapRatePlan'
  | 'canUpdateRoomPrice'
  | 'canSeeBookingDetails'
  | 'canUpdateBookingStatus'
  | 'canViewAnalytics'
  | 'canCreateMembers'
  | 'canViewMembers'
  | 'canUpdateMembers'
  | 'canDeleteMembers'
  | 'canCreateLevel0User'
  | 'canCreateLevel1User'
  | 'canCreateLevel2User'
  | 'canCreateLevel3User'
  | 'canUpdateLevel0User'
  | 'canUpdateLevel1User'
  | 'canUpdateLevel2User'
  | 'canUpdateLevel3User'
  | 'canDeleteLevel0User'
  | 'canDeleteLevel1User'
  | 'canDeleteLevel2User'
  | 'canDeleteLevel3User'
  | 'canViewLogs'
  | 'canCreateNewRole'
  | 'canViewAccess'
  | 'canModifyAccess'
  | 'canDeleteRole'
  | 'canCreatePolicy'
  | 'canUpdatePolicy'
  | 'canDeletePolicy'
  //news
  | 'canCDCategory' //CD-create and delete
  | 'canCDPropertyType'
  | 'canCDDestinationType'
  | 'canCDAmenity'
  | 'canSeeDraftedProperties';

export function checkRoleBased(requiredPermission: Permission) {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const role = req?.user?.role;

      if (!role) {
        return res
          .status(401)
          .json(errorResponse('Unauthorized: User role is missing'));
      }

      const roleDoc = await prisma.accessControl.findFirst({
        where: {
          role: role as Role,
          isActive: true
        },
        select: {
          role: true,
          level: true,
          isActive: true,
          canCreateHotel: true,
          canUpdateHotel: true,
          canDeleteHotel: true,
          canViewHotel: true,
          canUpdatePaymentDetails: true,
          canCreateRatePlan: true,
          canViewRatePlan: true,
          canUpdateRatePlan: true,
          canDeleteRatePlan: true,
          canAddInventory: true,
          canCreateRoomAvailability: true,
          canMapRatePlan: true,
          canUpdateRoomPrice: true,
          canSeeBookingDetails: true,
          canUpdateBookingStatus: true,
          canViewAnalytics: true,
          canCreateMembers: true,
          canViewMembers: true,
          canUpdateMembers: true,
          canDeleteMembers: true,
          canCreateLevel0User: true,
          canCreateLevel1User: true,
          canCreateLevel2User: true,
          canCreateLevel3User: true,
          canUpdateLevel0User: true,
          canUpdateLevel1User: true,
          canUpdateLevel2User: true,
          canUpdateLevel3User: true,
          canDeleteLevel0User: true,
          canDeleteLevel1User: true,
          canDeleteLevel2User: true,
          canDeleteLevel3User: true,
          canViewLogs: true,
          canCreateNewRole: true,
          canViewAccess: true,
          canModifyAccess: true,
          canDeleteRole: true,
          canCreatePolicy: true,
          canUpdatePolicy: true,
          canDeletePolicy: true,
          canCDCategory: true,
          canCDPropertyType: true,
          canCDDestinationType: true,
          canCDAmenity: true,
          canSeeDraftedProperties: true,
        },
      });

      if (!roleDoc) {
        console.log('Role document not found or inactive for role:', role);
        return res
          .status(403)
          .json(errorResponse('Access denied: Role not found or inactive'));
      }

      const hasPermission = roleDoc[requiredPermission as keyof typeof roleDoc];

      if (!hasPermission || hasPermission !== true) {
        return res
          .status(403)
          .json(
            errorResponse(
              `Access denied: '${role}' does not have permission '${requiredPermission}'`
            )
          );
      }

      next();
    } catch (error: any) {
      console.error('Role-based access check error:', {
        error: error.message,
        stack: error.stack,
        role: req?.user?.role,
        permission: requiredPermission,
      });
      return res
        .status(500)
        .json(
          errorResponse('Internal server error while verifying permissions')
        );
    }
  };
}

// Optional: Export a helper function to check multiple permissions
export function checkMultiplePermissions(requiredPermissions: Permission[]) {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const role = req?.user?.role;

      if (!role) {
        return res
          .status(401)
          .json(errorResponse('Unauthorized: User role is missing'));
      }

      const roleDoc = await prisma.accessControl.findFirst({
        where: {
          role: role as Role,
          isActive: true
        },
      });

      if (!roleDoc) {
        return res
          .status(403)
          .json(errorResponse('Access denied: Role not found or inactive'));
      }

      // Check if user has ALL required permissions
      const missingPermissions = requiredPermissions.filter(
        permission => !roleDoc[permission as keyof typeof roleDoc]
      );

      if (missingPermissions.length > 0) {
        return res
          .status(403)
          .json(
            errorResponse(
              `Access denied: Missing permissions: ${missingPermissions.join(', ')}`
            )
          );
      }

      next();
    } catch (error: any) {
      console.error('Multiple permissions check error:', error);
      return res
        .status(500)
        .json(
          errorResponse('Internal server error while verifying permissions')
        );
    }
  };
}

export function addRoleBasedDetails() {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const role = req.user?.role;

      if (!role) {
        return res
          .status(401)
          .json(errorResponse('Unauthorized: User role is missing'));
      }

      const roleDoc = await prisma.accessControl.findFirst({
        where: {
          role: role as Role,
          isActive: true
        },
        select: {
          role: true,
          level: true,
          isActive: true,
          canCreateHotel: true,
          canUpdateHotel: true,
          canDeleteHotel: true,
          canViewHotel: true,
          canUpdatePaymentDetails: true,
          canCreateRatePlan: true,
          canViewRatePlan: true,
          canUpdateRatePlan: true,
          canDeleteRatePlan: true,
          canAddInventory: true,
          canCreateRoomAvailability: true,
          canMapRatePlan: true,
          canUpdateRoomPrice: true,
          canSeeBookingDetails: true,
          canUpdateBookingStatus: true,
          canViewAnalytics: true,
          canCreateMembers: true,
          canViewMembers: true,
          canUpdateMembers: true,
          canDeleteMembers: true,
          canCreateLevel0User: true,
          canCreateLevel1User: true,
          canCreateLevel2User: true,
          canCreateLevel3User: true,
          canUpdateLevel0User: true,
          canUpdateLevel1User: true,
          canUpdateLevel2User: true,
          canUpdateLevel3User: true,
          canDeleteLevel0User: true,
          canDeleteLevel1User: true,
          canDeleteLevel2User: true,
          canDeleteLevel3User: true,
          canViewLogs: true,
          canCreateNewRole: true,
          canViewAccess: true,
          canModifyAccess: true,
          canDeleteRole: true,
          canCreatePolicy: true,
          canUpdatePolicy: true,
          canDeletePolicy: true,
          canCDCategory: true,
          canCDPropertyType: true,
          canCDDestinationType: true,
          canCDAmenity: true,
          canSeeDraftedProperties: true,
        },
      });

      if (!roleDoc) {
        return res
          .status(403)
          .json(errorResponse('Access denied: Role not found or inactive'));
      }

      // Add all permissions to request object
      req.permission = roleDoc;

      next();
    } catch (error: any) {
      console.error('Role-based details fetch error:', {
        error: error.message,
        stack: error.stack,
        role: req?.user?.role,
      });
      return res
        .status(500)
        .json(
          errorResponse('Internal server error while fetching role permissions')
        );
    }
  };
}