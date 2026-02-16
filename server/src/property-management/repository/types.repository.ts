import { prisma } from "../../config";


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
