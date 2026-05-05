import { errorResponse, successResponse } from '../../utils/return';
import { IUserRolesAndAccess } from '../types/access.types';
import {AccessDao} from '../repository';
export class AccessService {
  public static async createNewRoleService(data: IUserRolesAndAccess) {
    try {
      const isExists = await AccessDao.getAccessByRole(data.role);
      if (isExists) {
        return successResponse(`Access Exits for Role ${data.role}`);
      }
      const daoRes = await AccessDao.createAccess(data);
      if (daoRes) {
        return successResponse(
          `New Role ${data.role} created Successfully`,
          daoRes
        );
      } else {
        return errorResponse(`Failed to create ${data.role}`);
      }
    } catch (error: any) {
      return errorResponse(
        'Error occur while Creating new Role',
        error?.message
      );
    }
  }
  public static async getAllAccessesService() {
    try {
      const daoRes = await AccessDao.getAllAccess();
      if (daoRes) {
        return successResponse(`Access Got Successfully`, daoRes);
      } else {
        return errorResponse(`Failed to get acess`);
      }
    } catch (error: any) {
      return errorResponse(
        'Error occur while Fetching  Access For Roles',
        error?.message
      );
    }
  }
  public static async getAccessForLevel(role: "staff" | "super_admin" | "group_manager" | "hotel_manager" | "brand_manager" | "revenue_manager") {
    try {
      const daoRes = await AccessDao.getAccessByRole(role);
      if (daoRes) {
        return successResponse(`Access Got Successfully`, daoRes);
      } else {
        return errorResponse(`Failed to get acess`);
      }
    } catch (error: any) {
      return errorResponse(
        `Error occur while Fetching  Access For Role ${role} User`,
        error?.message
      );
    }
  }
  public static async updateAccessForLevel(role: "staff" | "super_admin" | "group_manager" | "hotel_manager" | "brand_manager" | "revenue_manager", data: IUserRolesAndAccess) {
    try {
      const daoRes = await AccessDao.modifyAccessForRole(role, data);
      if (daoRes) {
        return successResponse(`Access Modified Successfully`, daoRes);
      } else {
        return errorResponse(`Failed to Modified Access`);
      }
    } catch (error: any) {
      return errorResponse(
        `Error occur while Updating  Access For Role ${role}`,
        error?.message
      );
    }
  }
  public static async getAllRoles() {
    try {
      const daoRes = await AccessDao.getAllRoles()
      if (daoRes) {
        return successResponse(`Access Modified Successfully`, daoRes);
      } else {
        return errorResponse(`Failed to Modified Access`);
      }
    } catch (error: any) {
      return errorResponse(
        `Error occur while getting  all Roles`,
        error?.message
      );
    }
  }
  public static async deleteRole(role: "staff" | "super_admin" | "group_manager" | "hotel_manager" | "brand_manager" | "revenue_manager") {
    try {
      const isExists = await this.getAccessForLevel(role)
      if (!isExists.success) {
        return errorResponse(`Role ${role} does not exists`);
      }
      const daoRes = await AccessDao.deleteRole(role)
      if (daoRes) {
        return successResponse(`${role} Role Deleted Successfully`, daoRes);
      } else {
        return errorResponse(`Failed to Delete ${role} Role`);
      }
    } catch (error: any) {
      return errorResponse(
        `Failed to Delete ${role} Roles`,
        error?.message
      );
    }
  }

}
