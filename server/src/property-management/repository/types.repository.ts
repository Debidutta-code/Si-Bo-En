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

export class DestinationTypeDao {
  public static async getDestinationByName(destinationTypeName: string) {
    try {
      return await prisma.masterDestinationType.findFirst({
        where: {
          destinationTypeName: destinationTypeName,
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async createDestinationType(
    destinationTypeName: string,
    description: string
  ) {
    try {
      return await prisma.masterDestinationType.create({
        data: {
          destinationTypeName: destinationTypeName,
          destinationDescription: description,
          isActive: true,
        },
      });
    } catch (error: any) {
      console.log(error?.message);
      throw new Error(error?.message);
    }
  }

  public static async getDestinationType() {
    try {
      return await prisma.masterDestinationType.findMany({
        where: {
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async deleteDestinationType(destinationTypeName: string) {
    try {
      // Soft delete by setting isActive to false
      return await prisma.masterDestinationType.updateMany({
        where: { destinationTypeName: destinationTypeName },
        data: { isActive: false },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }
}

// Additional helper DAOs for property selection/assignment

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

export class DestinationTypeSelectionDao {
  public static async assignDestinationTypeToProperty(
    propertyId: string,
    masterDestinationTypeId: string
  ) {
    try {
      return await prisma.destinationType.upsert({
        where: { propertyId: propertyId },
        update: { masterDestinationTypeId: masterDestinationTypeId },
        create: {
          propertyId: propertyId,
          masterDestinationTypeId: masterDestinationTypeId,
        },
        include: {
          masterDestinationType: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Error assigning destination type to property: ${error.message}`);
    }
  }

  public static async getDestinationType(propertyId: string) {
    try {
      return await prisma.destinationType.findUnique({
        where: { propertyId: propertyId },
        include: {
          masterDestinationType: true,
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