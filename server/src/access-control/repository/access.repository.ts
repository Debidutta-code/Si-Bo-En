import {prisma} from "../../config"
import type { IUserRolesAndAccess } from '../types/access.types';


export default class AccessDao {

  public static async createAccess(data: IUserRolesAndAccess) {
    try {
      return await prisma.accessControl.create({
        data,
      });
    } catch (error: any) {
      throw new Error(`Failed to create access control: ${error.message}`);
    }
  }

  public static async getAccessByRole(role: "super_admin" | "group_manager" | "hotel_manager" | "staff" | "brand_manager" | "revenue_manager" | "regional_admin" | "spa_manager") { // 👈 Role enum
    try {
      return await prisma.accessControl.findUnique({
        where: { role }, 
      });
    } catch (error: any) {
      throw new Error(`Failed to fetch access for role ${role}: ${error.message}`);
    }
  }

  public static async getAllAccess() {
    try {
      return await prisma.accessControl.findMany();
    } catch (error: any) {
      throw new Error(`Failed to fetch all access controls: ${error.message}`);
    }
  }

  public static async modifyAccess(role: "super_admin" | "group_manager" | "hotel_manager" | "staff" | "brand_manager" | "revenue_manager" | "regional_admin", newAccess: IUserRolesAndAccess) {
    try {
      const updatedRole = await prisma.accessControl.update({
        where: { role },
        data: newAccess,
      });
      return updatedRole;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error(`Role '${role}' not found`);
      }
      throw new Error(`Error updating role permissions: ${error.message}`);
    }
  }

  public static async getAllRoles() {
    try {
      return await prisma.accessControl.findMany({
        select: {
          role: true,
          level: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to fetch roles: ${error.message}`);
    }
  }

  public static async deleteRole(role: "super_admin" | "group_manager" | "hotel_manager" | "staff" | "brand_manager" | "revenue_manager") { // 👈 Role enum
    try {
      return await prisma.accessControl.delete({
        where: { role },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error(`Role '${role}' not found`);
      }
      throw new Error(`Error deleting role: ${error.message}`);
    }
  }

  // ✅ FIXED: This was broken — now properly updates
  public static async modifyAccessForRole(
    role: "super_admin" | "group_manager" | "hotel_manager" | "staff" | "brand_manager" | "revenue_manager",
    newAccess: IUserRolesAndAccess
  ) {
    try {
      const updatedRole = await prisma.accessControl.update({
        where: { role },
        data: newAccess, // 👈 Directly pass the update object
      });

      if (!updatedRole) {
        throw new Error(`Role '${role}' not found`); // Won't happen with .update + P2025
      }

      return updatedRole;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error(`Role '${role}' not found`);
      }
      throw new Error(`Error updating role permissions: ${error.message}`);
    }
  }

  // ✅ Bonus: Check if role exists
  public static async roleExists(role: "super_admin" | "group_manager" | "hotel_manager" | "staff" | "brand_manager" | "revenue_manager"): Promise<boolean> {
    const count = await prisma.accessControl.count({
      where: { role }
    });
    return count > 0;
  }

  // ✅ Bonus: Activate/Deactivate role
  public static async toggleRoleActive(role: "super_admin" | "group_manager" | "hotel_manager" | "staff" | "brand_manager" | "revenue_manager", isActive: boolean) {
    try {
      return await prisma.accessControl.update({
        where: { role },
        data: { isActive },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error(`Role '${role}' not found`);
      }
      throw new Error(`Error toggling role active status: ${error.message}`);
    }
  }
}