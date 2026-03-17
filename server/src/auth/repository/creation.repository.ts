// dao/CreationDao.ts

import type { ICreation, PropertyFilters } from "../types";
import prisma from "../../config/prisma.client";

const toStringId = (id: string | any): string => {
  return typeof id === 'string' ? id : String(id);
};

export default class CreationDao {

  public static async create(
    type: "group" | "property" | "brand" | "super" | "regional",
    name: string,
    userId: string,
    superId?: string,
    regionalId?: string,
    groupId?: string,
    brandId?: string,
    images: string[] = []
  ) {
    try {
      return await prisma.creation.create({
        data: {
          type,
          name,
          createdById: userId,
          isActive: true,
          isDeleted: false,
          superId: superId ? superId : undefined,
          groupId: groupId ? groupId : undefined,
          brandId: brandId ? brandId : undefined,
          regionalId: regionalId ? regionalId : undefined,
          images: images,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to create creation: ${error.message}`);
    }
  }
  public static async update(
    creationId: string,
    name: string,
    images: string[] = [],
    isActive: boolean
  ) {
    try {
      return await prisma.creation.update({
        where: { id: toStringId(creationId) },
        data: { name, images, isActive },
      });
    } catch (error: any) {
      throw new Error(`Failed to update creation: ${error.message}`);
    }
  }

  public static async toggleDraft(creationId: string, val: boolean = false) {
    try {
      return await prisma.creation.update({
        where: { id: toStringId(creationId) },
        data: { isActive: val },
      });
    } catch (error: any) {
      throw new Error(`Failed to update isActive: ${error.message}`);
    }
  }

  public static async delete(creationId: string) {
    try {
      return await prisma.creation.delete({
        where: { id: creationId },
      });
    } catch (error: any) {
      throw new Error(`Failed to mark as deleted: ${error.message}`);
    }
  }

  public static async getAll(type: "group" | "property" | "brand" | "super" | "regional", isActive: boolean) {
    try {
      return await prisma.creation.findMany({
        where: {
          type,
          isActive,
          isDeleted: false,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to fetch creations: ${error.message}`);
    }
  }

  public static async getAllDeleted(type: "group" | "property" | "brand" | "super") {
    try {
      return await prisma.creation.findMany({
        where: {
          type,
          isDeleted: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to fetch deleted creations: ${error.message}`);
    }
  }

  public static async getCreationsByRole(
    filters: PropertyFilters
  ): Promise<any[]> {
    try {

      return await prisma.creation.findMany({
        where: {},
        orderBy: { createdAt: 'desc' },
        include: {
          users: true,
          createdBy: true,
          super: true,
          group: true,
          brand: true,
          property: true,
          regional: true,
          regionalChildren: true,

        },
      });
    } catch (error: any) {
      throw new Error(`Failed to get creations: ${error.message}`);
    }
  }
  public static async assignToCustom(targetCreationId: string, customCreationId: string) {
    try {
      // Check not already assigned to another regional
      const target = await prisma.creation.findUnique({
        where: { id: targetCreationId },
        select: { regionalId: true, type: true }
      });
      if (!target) throw new Error("Creation not found");
      if (target.regionalId && target.regionalId !== customCreationId) {
        throw new Error("Already assigned to another regional admin");
      }
      return await prisma.creation.update({
        where: { id: targetCreationId },
        data: { regionalId: customCreationId },
      });
    } catch (error: any) {
      throw new Error(`Failed to assign to regional: ${error.message}`);
    }
  }
  public static async removeFromCustom(targetCreationId: string) {
    try {
      return await prisma.creation.update({
        where: { id: targetCreationId },
        data: { regionalId: null },
      });
    } catch (error: any) {
      throw new Error(`Failed to remove from regional: ${error.message}`);
    }
  }

  public static async getSpecificCreation(creationId: string): Promise<ICreation | null> {
    try {
      const creation = await prisma.creation.findUnique({
        where: { id: toStringId(creationId) },
        include: {
          users: true,
          createdBy: true,
          super: true,
          group: true,
          brand: true,
          property: true,
          brandChildren: true,
          groupChildren: {
            include: {
              brandChildren: true
            }
          },
          regional: true,
          regionalChildren:true

        },
      });

      if (!creation) {
        throw new Error('Creation not found');
      }

      // Convert null values to undefined to match ICreation interface
      const formattedCreation: ICreation = {
        ...creation,
        superId: creation.superId ?? undefined,
        groupId: creation.groupId ?? undefined,
        brandId: creation.brandId ?? undefined,
        propertyId: creation.propertyId ?? undefined,
      };

      return formattedCreation;
    } catch (error: any) {
      throw new Error(`Failed to get specific creation: ${error.message}`);
    }
  }
}

// ================================
// Manage Creation Users (Level 0-4)
// ================================

export class ManageCreationUser {

  private static async addUserToLevel(
    creationId: string,
    userId: string,
    levelField: 'level0Users' | 'level1Users' | 'level2Users' | 'level3Users' | 'level4Users'
  ) {
    try {
      // Prisma doesn't have $push — we read, modify, write
      const creation = await prisma.creation.findUnique({
        where: { id: toStringId(creationId) },
        select: { id: true },
      });

      if (!creation) {
        throw new Error('Creation not found');
      }

      // Connect user via relation
      const relationField = `${levelField}Id` as const;
      const updateData: any = {
        [levelField]: {
          connect: { id: toStringId(userId) },
        },
      };

      return await prisma.creation.update({
        where: { id: toStringId(creationId) },
        data: updateData,
        include: {
          level0Users: true,
          level1Users: true,
          level2Users: true,
          level3Users: true,
          level4Users: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to add user to ${levelField}: ${error.message}`);
    }
  }

  // Generic helper for removing user from level
  private static async removeUserFromLevel(
    creationId: string,
    userId: string,
    levelField: 'level0Users' | 'level1Users' | 'level2Users' | 'level3Users' | 'level4Users'
  ) {
    try {
      return await prisma.creation.update({
        where: { id: toStringId(creationId) },
        data: {
          [levelField]: {
            disconnect: { id: toStringId(userId) },
          },
        },
        include: {
          level0Users: true,
          level1Users: true,
          level2Users: true,
          level3Users: true,
          level4Users: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to remove user from ${levelField}: ${error.message}`);
    }
  }

  public static async addLevel0User(userId: string, creationId: string) {
    return this.addUserToLevel(creationId, userId, 'level0Users');
  }

  public static async addLevel1User(userId: string, creationId: string) {
    return this.addUserToLevel(creationId, userId, 'level1Users');
  }

  public static async addLevel2User(userId: string, creationId: string) {
    return this.addUserToLevel(creationId, userId, 'level2Users');
  }

  public static async addLevel3User(userId: string, creationId: string) {
    return this.addUserToLevel(creationId, userId, 'level3Users');
  }

  public static async addLevel4User(userId: string, creationId: string) {
    return this.addUserToLevel(creationId, userId, 'level4Users');
  }

  public static async removeLevel0User(userId: string, creationId: string) {
    return this.removeUserFromLevel(creationId, userId, 'level0Users');
  }

  public static async removeLevel1User(userId: string, creationId: string) {
    return this.removeUserFromLevel(creationId, userId, 'level1Users');
  }

  public static async removeLevel2User(userId: string, creationId: string) {
    return this.removeUserFromLevel(creationId, userId, 'level2Users');
  }

  public static async removeLevel3User(userId: string, creationId: string) {
    return this.removeUserFromLevel(creationId, userId, 'level3Users');
  }

  public static async removeLevel4User(userId: string, creationId: string) {
    return this.removeUserFromLevel(creationId, userId, 'level4Users');
  }
}

// ================================
// Get Creation Details by User ID
// ================================

export class CreationDetailsByUserId {

  public static async getGroupManagersGroup(groupManagerId: string) {
    try {
      return await prisma.creation.findFirst({
        where: {
          type: 'group',
          level3Users: {
            some: {
              id: toStringId(groupManagerId),
            },
          },
          isDeleted: false,
        },
        include: {
          brandChildren: true,
          groupChildren: true,
          superChildren: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to get group for manager: ${error.message}`);
    }
  }

  public static async getGroupManagersBrands(groupManagerId: string) {
    try {
      const group = await this.getGroupManagersGroup(groupManagerId);
      return group?.brandChildren || [];
    } catch (error: any) {
      throw new Error(`Failed to get brands for group manager: ${error.message}`);
    }
  }

  public static async getGroupManagersProperty(groupManagerId: string) {
    try {
      // Get group → then get its properties via relations
      const group = await this.getGroupManagersGroup(groupManagerId);
      if (!group) return [];

      // Assuming properties are linked via Creation → Property
      const properties = await prisma.property.findMany({
        where: {
          creationId: group.id,
        },
        include: {
          creation: true,
        },
      });

      return properties;
    } catch (error: any) {
      throw new Error(`Failed to get properties for group manager: ${error.message}`);
    }
  }

  public static async getBrandManagersBrand(brandManagerId: string) {
    try {
      return await prisma.creation.findFirst({
        where: {
          type: 'brand',
          level2Users: {
            some: {
              id: toStringId(brandManagerId),
            },
          },
          isDeleted: false,
        },
        include: {
          brandChildren: true,
          groupChildren: true,
          superChildren: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to get brand for manager: ${error.message}`);
    }
  }

  public static async getBrandManagersProperty(brandManagerId: string) {
    try {
      const brand = await this.getBrandManagersBrand(brandManagerId);
      if (!brand) return [];

      const properties = await prisma.property.findMany({
        where: {
          creationId: brand.id,
        },
        include: {
          creation: true,
        },
      });

      return properties;
    } catch (error: any) {
      throw new Error(`Failed to get properties for brand manager: ${error.message}`);
    }
  }

  public static async getPropertyManagersProperty(propertyManagerId: string) {
    try {
      const creation = await prisma.creation.findFirst({
        where: {
          type: 'property',
          level1Users: {
            some: {
              id: toStringId(propertyManagerId),
            },
          },
          isDeleted: false,
        },
        include: {
          property: true,
        },
      });

      return creation?.property || null;
    } catch (error: any) {
      throw new Error(`Failed to get property for manager: ${error.message}`);
    }
  }

  public static async getLevel0UsersProperty(id: string) {
    try {
      const creation = await prisma.creation.findFirst({
        where: {
          type: 'property',
          level0Users: {
            some: {
              id: toStringId(id),
            },
          },
          isDeleted: false,
        },
        include: {
          property: true,
        },
      });

      return creation?.property || null;
    } catch (error: any) {
      throw new Error(`Failed to get property for level 0 user: ${error.message}`);
    }
  }
}

// ================================
// Get Creation Details by Creation ID
// ================================

export class CreationDetailsByCreationId {

  public static async getGroupManagersGroup(groupId: string) {
    try {
      return await prisma.creation.findUnique({
        where: {
          id: toStringId(groupId),
          type: 'group',
        },
        include: {
          brandChildren: true,
          groupChildren: true,
          superChildren: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to get group: ${error.message}`);
    }
  }

  public static async getGroupManagersBrands(groupId: string) {
    try {
      const group = await this.getGroupManagersGroup(groupId);
      return group?.brandChildren || [];
    } catch (error: any) {
      throw new Error(`Failed to get brands for group: ${error.message}`);
    }
  }

  public static async getGroupManagersProperty(groupId: string) {
    try {
      const group = await this.getGroupManagersGroup(groupId);
      if (!group) return [];

      const properties = await prisma.property.findMany({
        where: {
          creationId: group.id,
        },
        include: {
          creation: true,
        },
      });

      return properties;
    } catch (error: any) {
      throw new Error(`Failed to get properties for group: ${error.message}`);
    }
  }

  public static async getBrandManagersBrand(brandId: string) {
    try {
      return await prisma.creation.findUnique({
        where: {
          id: toStringId(brandId),
          type: 'brand',
        },
        include: {
          brandChildren: true,
          groupChildren: true,
          superChildren: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to get brand: ${error.message}`);
    }
  }

  public static async getBrandManagersProperty(brandId: string) {
    try {
      const brand = await this.getBrandManagersBrand(brandId);
      if (!brand) return [];

      const properties = await prisma.property.findMany({
        where: {
          creationId: brand.id,
        },
        include: {
          creation: true,
        },
      });

      return properties;
    } catch (error: any) {
      throw new Error(`Failed to get properties for brand: ${error.message}`);
    }
  }

  public static async getPropertyManagersProperty(propertyId: string) {
    try {
      const creation = await prisma.creation.findFirst({
        where: {
          propertyId: toStringId(propertyId),
        },
        include: {
          property: true,
        },
      });

      return creation?.property || null;
    } catch (error: any) {
      throw new Error(`Failed to get property: ${error.message}`);
    }
  }

  public static async getLevel0UsersProperty(id: string) {
    try {
      const creation = await prisma.creation.findFirst({
        where: {
          propertyId: toStringId(id),
        },
        include: {
          property: true,
        },
      });

      return creation?.property || null;
    } catch (error: any) {
      throw new Error(`Failed to get property: ${error.message}`);
    }
  }
}

// ================================
// Add Creation to Creation (Hierarchy)
// ================================

export class AddCreationToCreation {

  public static async addToSuper(superId: string, groupId: string) {
    try {
      // Connect group to super via relation
      return await prisma.creation.update({
        where: { id: toStringId(superId) },
        data: {
          superChildren: {
            connect: { id: toStringId(groupId) },
          },
        },
        include: {
          superChildren: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to add group: ${error.message}`);
    }
  }

  public static async addToGroup(groupId: string, brandId: string) {
    try {
      return await prisma.creation.update({
        where: { id: toStringId(groupId) },
        data: {
          groupChildren: {
            connect: { id: toStringId(brandId) },
          },
        },
        include: {
          groupChildren: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to add brand: ${error.message}`);
    }
  }

  public static async addToBrand(brandId: string, propertyId: string) {
    try {
      // Link property to creation
      const property = await prisma.creation.update({
        where: { id: toStringId(propertyId) },
        data: {
          brandChildren: {
            connect: { id: toStringId(brandId) }
          },
        },
        include: {
          brand: true,
        },
      });

      return property;
    } catch (error: any) {
      throw new Error(`Failed to add property: ${error.message}`);
    }
  }

  public static async addToProperty(propertyCreationId: string, propertyId: string) {
    try {
      return await prisma.creation.update({
        where: { id: propertyCreationId },
        data: {
          propertyId: {
            set: propertyId
          }
        }
      })
    } catch (error: any) {
      throw new Error(`Failed to add property: ${error.message}`);
    }
  }

}