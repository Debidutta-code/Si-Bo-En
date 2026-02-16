import {prisma} from "../../config";
import {AmenityType} from "../types";
export class PropertyAminityDao {
  public static async getAllPropertyAmenities(type: string = "property") {
    try {
      return await prisma.masterAmenity.findMany({
        where: {
          amenityType: type === "property" ? "property" : "room",
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
        amenityType: "property" as AmenityType,
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
          amenityType: "property",
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