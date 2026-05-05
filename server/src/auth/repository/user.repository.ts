import type { IBrandEntity, IGroupEntity, IRUsers } from "../types/index"
import { prisma } from '../../config';


export class UserAuthRepository {

  public static async findUserById(userId: string) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        include: {
          creation:{
            include:{
              property:true
            }
          }
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  public static async findUserByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email: email }
      });
    } catch (error: any) {
      throw new Error('Error occurred while verifying email');
    }
  }
public static async recoveryUser(email:string){
  try{
    return await prisma.user.update({
      where: { email: email },
      data: { isDrafted: false,creationId:null, },
      
    });
  }catch(error){
      throw new Error('Error occurred while recovering user');
    
  }
}
  public static async createUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: "super_admin" | "group_manager" | "hotel_manager" | "staff" | "brand_manager" | "revenue_manager",
    createdByEmail: string, // Not used in schema — we only store createdById
    creatorId: string,
    level: number,
  ) {
    
    try {
      // Find creator by email to validate (optional)
      const creator = await prisma.user.findUnique({
        where: { id: creatorId },
      });

      if (!creator) {
        throw new Error('Creator user not found');
      }

      return await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password,
          role,
          userLevel: level,
          createdById: creatorId,
          isDrafted: false,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  public static async deleteUser(userId: string) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { isDrafted: true },
      });
    } catch (error: any) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  public static async updateUser(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      creationId?: string; // ← Was propertyId → now creationId
    }
  ) {
    try {
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        creationId: data.creationId ? data.creationId : undefined,
      };

      return await prisma.user.update({
        where: { id: id },
        data: updateData,
      });
    } catch (error: any) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
}

export class Users {
  public static async getAllUsers(isDrafted: boolean = false): Promise<IRUsers[]> {
    try {
      return await prisma.user.findMany({
        where: {
          isDrafted: isDrafted,
        },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          id: true
        },
        orderBy:{
          createdAt:"desc"
        }
      });
    } catch (error: any) {
      throw new Error("Error occurred while fetching all users");
    }
  }
  private static async getUnmappedUsersForSuperAdmin(): Promise<IRUsers[]> {
    return await prisma.user.findMany({
      where: {
        creationId: null, // ← unmapped = no creationId
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        id: true
      },
      orderBy:{
          createdAt:"desc"
        }
    });

  }
  private static async getUnmappedUsersForGroupOrBrandManager(createdById: string): Promise<IRUsers[]> {
    return await prisma.user.findMany({
      where: {
        createdById: createdById,
        creationId: null, // ← unmapped = no creationId
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        id: true
      },
      orderBy:{
          createdAt:"desc"
        }
    });

  }
  public static async unMappedUser(createdById: string, role: string): Promise<IRUsers[]> {
    try {
      if (role === "super_admin") {
        return await this.getUnmappedUsersForSuperAdmin();
      } else if (role === "group_manager" || role === "brand_manager" || role === "hotel_manager"||role==="regional_admin") {
        return await this.getUnmappedUsersForGroupOrBrandManager(createdById);
      } else {
        throw new Error("Role not authorized to fetch unmapped users");
      }
    } catch (error: any) {
      throw new Error("Error occurred while fetching unmapped users");
    }
  }

  public static async getUsersForProperty(creationId: string): Promise<IRUsers[]> {
    try {
      return await prisma.user.findMany({
        where: {
          creationId: creationId,
        },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          id: true
        },orderBy:{
          createdAt:"desc"
        }
      });
    } catch (error: any) {
      throw new Error("Error occurred while fetching users for property");
    }
  }

  public static async getUsersByCreationId(creationId: string): Promise<IRUsers[]> {
    try {
      return await prisma.user.findMany({
        where: {
          creationId: creationId,
        },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          id: true
        },
        orderBy:{
          createdAt:"desc"
        }
      });
    } catch (error: any) {
      throw new Error("Error occurred while fetching users by creation ID");
    }
  }
  public static async mapUser(userId: string, creationId: string): Promise<IRUsers> {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { creationId: creationId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          id: true
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to map user: ${error.message}`);
    }
  }
}


export class UtilsRepository {

  public static async getPropertyDetailsById(propertyId: string) {
    try {
      return await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          creation: true,
          propertyCategory: true,
          propertyType: true,
          propertyAddress: true,
          propertyAmenities: true,
          bankDetails: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to get property: ${error.message}`);
    }
  }

  public static async getRoleLevelByName(role: "super_admin" | "group_manager" | "hotel_manager" | "staff" | "brand_manager" | "revenue_manager") {
    try {
      return await prisma.accessControl.findUnique({
        where: { role },
        select: {
          role: true,
          level: true,
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to get role level: ${error.message}`);
    }
  }
  public static async groupBrands(groupId: string):Promise<IGroupEntity|null> {
    try {
      return await prisma.creation.findUnique({
        where: { id: groupId,type:"group" },
        include: {
          
          groupChildren:true
          
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to group brands: ${error.message}`);
    }
  }
  public static async getBrandProperties(brandId: string): Promise<IBrandEntity|null>  {
    try {
      return await prisma.creation.findUnique({
        where: { id: brandId,type:"brand" },
        include: {
          brandChildren:true
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to get brand properties: ${error.message}`);
    }
  }
  public static async getUserForCreations(creationIds:string[]):Promise<IRUsers[]>{
    try {
      return await prisma.user.findMany({
        where: {
          creationId: { in: creationIds }
        },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          id: true
        },
        orderBy:{
          createdAt:"desc"
        }
      });
    } catch (error: any) {
      throw new Error(`Failed to get users for creations: ${error.message}`);
    }
  }
}