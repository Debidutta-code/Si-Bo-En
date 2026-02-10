import { AmenityType } from "@prisma/client";
import {prisma} from "../../config";

export class RoomAminityDao {
  public static async getAllRoomAmenities() {
    try {
      return await prisma.masterAmenity.findMany({
        where: {
          amenityType: AmenityType.room,
          isActive: true,
        },
        select: {
          id: true,
          amenityName: true,
          description: true,
          icon: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async addRoomAmenities(newAmenities: string[]) {
    try {
      // Create multiple amenities
      const amenityData = newAmenities.map(name => ({
        amenityName: name,
        amenityType: AmenityType.room,
        isActive: true,
      }));

      const createdAmenities = await prisma.masterAmenity.createMany({
        data: amenityData,
        skipDuplicates: true, // Skip if amenityName already exists (unique constraint)
      });

      // Return all room amenities after creation
      return await this.getAllRoomAmenities();
    } catch (error: any) {
      throw new Error(`Error adding room amenities: ${error.message}`);
    }
  }

  public static async deleteAmenities(amenityNames: string[]) {
    try {
      // Soft delete by setting isActive to false
      const result = await prisma.masterAmenity.updateMany({
        where: {
          amenityName: { in: amenityNames },
          amenityType: AmenityType.room,
        },
        data: {
          isActive: false,
        },
      });

      if (result.count === 0) {
        throw new Error('No room amenities found to delete');
      }

      // Return all active room amenities after deletion
      return await this.getAllRoomAmenities();
    } catch (error: any) {
      throw new Error(`Error deleting amenities: ${error.message}`);
    }
  }
}

export class PropertyAminityDao {
  public static async getAllPropertyAmenities(type:string="property") {
    try {
      return await prisma.masterAmenity.findMany({
        where: {
          amenityType: type=== "property"?AmenityType.property: AmenityType.room,
          isActive: true,
        },
        select: {
          id: true,
          amenityName: true,
          description: true,
          icon: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async addPropertyAmenities(newAmenities: string[]) {
    try {
      // Create multiple amenities
      const amenityData = newAmenities.map(name => ({
        amenityName: name,
        amenityType: AmenityType.property,
        isActive: true,
      }));

      const createdAmenities = await prisma.masterAmenity.createMany({
        data: amenityData,
        skipDuplicates: true, // Skip if amenityName already exists (unique constraint)
      });

      // Return all property amenities after creation
      return await this.getAllPropertyAmenities();
    } catch (error: any) {
      throw new Error(`Error adding property amenities: ${error.message}`);
    }
  }

  public static async deletePropertyAmenities(amenityNames: string[]) {
    try {
      // Soft delete by setting isActive to false
      const result = await prisma.masterAmenity.updateMany({
        where: {
          amenityName: { in: amenityNames },
          amenityType: AmenityType.property,
        },
        data: {
          isActive: false,
        },
      });

      if (result.count === 0) {
        throw new Error('No property amenities found to delete');
      }

      // Return all active property amenities after deletion
      return await this.getAllPropertyAmenities();
    } catch (error: any) {
      throw new Error(`Error deleting amenities: ${error.message}`);
    }
  }
}

export class CategoryDao {
  public static async getCategoryByName(categoryName: string) {
    try {
      return await prisma.masterPropertyCategory.findFirst({
        where: {
          categoryName: categoryName,
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async createCategory(categoryName: string, description: string) {
    try {
      return await prisma.masterPropertyCategory.create({
        data: {
          categoryName,
          categoryDescription: description,
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async getCategory() {
    try {
      return await prisma.masterPropertyCategory.findMany({
        where: {
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async deleteCategory(categoryName: string) {
    try {
      // Soft delete by setting isActive to false
      return await prisma.masterPropertyCategory.updateMany({
        where: { categoryName: categoryName },
        data: { isActive: false },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }
}

export class PropertyTypesDao {
  public static async getTypeByName(propertyTypeName: string) {
    try {
      return await prisma.masterPropertyType.findFirst({
        where: {
          propertyTypeName: propertyTypeName,
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async createPropertyType(
    propertyTypeName: string,
    description: string
  ) {
    try {
      return await prisma.masterPropertyType.create({
        data: {
          propertyTypeName,
          propertyTypeDescription: description,
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async getPropertyType() {
    try {
      return await prisma.masterPropertyType.findMany({
        where: {
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async deletePropertyType(propertyTypeName: string) {
    try {
      // Soft delete by setting isActive to false
      return await prisma.masterPropertyType.updateMany({
        where: { propertyTypeName: propertyTypeName },
        data: { isActive: false },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }
}



export class PropertyCategorySelectionDao {
  public static async assignCategoryToProperty(
    propertyId: string,
    masterCategoryId: string
  ) {
    try {
      return await prisma.propertyCategory.upsert({
        where: { propertyId: propertyId },
        update: { masterCategoryId: masterCategoryId },
        create: {
          propertyId: propertyId,
          masterCategoryId: masterCategoryId,
        },
        include: {
          masterCategory: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Error assigning category to property: ${error.message}`);
    }
  }

  public static async getPropertyCategory(propertyId: string) {
    try {
      return await prisma.propertyCategory.findUnique({
        where: { propertyId: propertyId },
        include: {
          masterCategory: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }
}

export class PropertyTypeSelectionDao {
  public static async assignTypeToProperty(
    propertyId: string,
    masterPropertyTypeId: string
  ) {
    try {
      return await prisma.propertyType.upsert({
        where: { propertyId: propertyId },
        update: { masterPropertyTypeId: masterPropertyTypeId },
        create: {
          propertyId: propertyId,
          masterPropertyTypeId: masterPropertyTypeId,
        },
        include: {
          masterPropertyType: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Error assigning type to property: ${error.message}`);
    }
  }

  public static async getPropertyType(propertyId: string) {
    try {
      return await prisma.propertyType.findUnique({
        where: { propertyId: propertyId },
        include: {
          masterPropertyType: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }
}



export class PropertyAmenitySelectionDao {
  public static async assignAmenitiesToProperty(
    propertyId: string,
    amenityIds: string[]
  ) {
    try {
      // First, remove existing selections
      await prisma.propertyAmenitySelection.deleteMany({
        where: { propertyId: propertyId },
      });

      // Then create new selections
      const selections = amenityIds.map(amenityId => ({
        propertyId: propertyId,
        amenityId: amenityId,
      }));

      return await prisma.propertyAmenitySelection.createMany({
        data: selections,
      });
    } catch (error: any) {
      throw new Error(`Error assigning amenities to property: ${error.message}`);
    }
  }

  public static async getPropertyAmenities(propertyId: string) {
    try {
      return await prisma.propertyAmenitySelection.findMany({
        where: { propertyId: propertyId },
        include: {
          amenity: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async addAmenityToProperty(
    propertyId: string,
    amenityId: string
  ) {
    try {
      return await prisma.propertyAmenitySelection.create({
        data: {
          propertyId: propertyId,
          amenityId: amenityId,
        },
        include: {
          amenity: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Error adding amenity to property: ${error.message}`);
    }
  }

  public static async removeAmenityFromProperty(
    propertyId: string,
    amenityId: string
  ) {
    try {
      return await prisma.propertyAmenitySelection.delete({
        where: {
          propertyId_amenityId: {
            propertyId: propertyId,
            amenityId: amenityId,
          },
        },
      });
    } catch (error: any) {
      throw new Error(`Error removing amenity from property: ${error.message}`);
    }
  }
}

export class LoyaltyGuestFieldsDao{
  public static async createGuestFilelds(name:string[]){
    try {
      return await prisma.masterLoyaltyRegistrationFields.createMany({
        data: name.map(fieldName => ({ fieldName })),
      });
    } catch (error) {
      throw new Error(`Error creating loyalty guest field`);
    }
  }
  public static async deleteGuestField(id:string){
    try {
      return await prisma.masterLoyaltyRegistrationFields.delete({
        where:{
          id:id
        }
      })
    } catch (error) {
      throw new Error(`Error deleting loyalty guest field`);
    }
  }
  public static async getGuestFields(){
    try {
      return await prisma.masterLoyaltyRegistrationFields.findMany();
    } catch (error) {
      throw new Error(`Error fetching loyalty guest fields`);
    }
  }
}


export class PaymentIntegrationDao {
  // ============ Master Payment Integration Methods ============
  
  public static async getPaymentIntegrationByName(name: string) {
    try {
      return await prisma.masterPaymentIntegration.findUnique({
        where: {
          name: name,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async createPaymentIntegration(name: string) {
    try {
      return await prisma.masterPaymentIntegration.create({
        data: {
          name,
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async getPaymentIntegrations() {
    try {
      return await prisma.masterPaymentIntegration.findMany({
        where: {
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async updatePaymentIntegration(
    id: string, 
    name?: string, 
    isActive?: boolean
  ) {
    try {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (isActive !== undefined) updateData.isActive = isActive;

      return await prisma.masterPaymentIntegration.update({
        where: { id },
        data: updateData,
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async deletePaymentIntegration(id: string) {
    try {
      // Soft delete by setting isActive to false
      return await prisma.masterPaymentIntegration.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  // ============ Property Payment Integration Methods ============

  /**
   * Validate that master payment integrations exist and are active
   */
  public static async validateMasterIntegrations(integrationIds: string[]): Promise<boolean> {
    try {
      const count = await prisma.masterPaymentIntegration.count({
        where: {
          id: { in: integrationIds },
          isActive: true
        }
      });
      return count === integrationIds.length;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  /**
   * Create property payment integrations
   */
  public static async createPropertyIntegrations(
    propertyId: string,
    integrationIds: string[]
  ) {
    try {
      const data = integrationIds.map(integrationId => ({
        propertyId,
        paymentIntegrationId: integrationId,
        isActive: true
      }));

      return await prisma.propertyPaymentIntegration.createMany({
        data,
        skipDuplicates: true
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  /**
   * Get active property payment integrations by property ID
   */
  public static async getByPropertyId(propertyId: string) {
    try {
      return await prisma.propertyPaymentIntegration.findMany({
        where: {
          propertyId,
          isActive: true
        },
        include: {
          paymentIntegration: true
        }
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  /**
   * Get all property payment integrations (including inactive)
   */
  public static async getAllByPropertyId(propertyId: string) {
    try {
      return await prisma.propertyPaymentIntegration.findMany({
        where: {
          propertyId
        },
        include: {
          paymentIntegration: true
        }
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  /**
   * Delete property payment integrations (hard delete)
   */
  public static async deletePropertyIntegrations(propertyId: string) {
    try {
      return await prisma.propertyPaymentIntegration.deleteMany({
        where: { propertyId }
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  /**
   * Deactivate all property payment integrations
   */
  public static async deactivatePropertyIntegrations(propertyId: string) {
    try {
      return await prisma.propertyPaymentIntegration.updateMany({
        where: { propertyId },
        data: { isActive: false }
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  /**
   * Update property payment integrations (replaces existing with new ones)
   */
  public static async updatePropertyIntegrations(
    propertyId: string,
    integrationIds: string[]
  ) {
    try {
      // Use a transaction to ensure atomicity
      return await prisma.$transaction(async (tx) => {
        // First, delete all existing integrations
        await tx.propertyPaymentIntegration.deleteMany({
          where: { propertyId }
        });

        // Then create new ones
        if (integrationIds.length > 0) {
          const data = integrationIds.map(integrationId => ({
            propertyId,
            paymentIntegrationId: integrationId,
            isActive: true
          }));

          await tx.propertyPaymentIntegration.createMany({
            data
          });
        }

        // Return the updated integrations
        return await tx.propertyPaymentIntegration.findMany({
          where: { propertyId },
          include: {
            paymentIntegration: true
          }
        });
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  /**
   * Check if a specific payment integration is active for a property
   */
  public static async isIntegrationActiveForProperty(
    propertyId: string,
    integrationId: string
  ): Promise<boolean> {
    try {
      const integration = await prisma.propertyPaymentIntegration.findUnique({
        where: {
          propertyId_paymentIntegrationId: {
            propertyId,
            paymentIntegrationId: integrationId
          }
        }
      });

      return integration?.isActive ?? false;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  /**
   * Toggle property payment integration status
   */
  public static async togglePropertyIntegration(
    propertyId: string,
    integrationId: string,
    isActive: boolean
  ) {
    try {
      return await prisma.propertyPaymentIntegration.update({
        where: {
          propertyId_paymentIntegrationId: {
            propertyId,
            paymentIntegrationId: integrationId
          }
        },
        data: { isActive }
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }
}