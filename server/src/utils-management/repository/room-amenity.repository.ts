import { AmenityType } from "../types";
import {prisma} from "../../config"
export class RoomAminityDao {
  public static async getAllRoomAmenities() {
    try {
      return await prisma.masterAmenity.findMany({
        where: {
          amenityType: "room",
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
        amenityType: "room" as AmenityType,
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
          amenityType: "room",
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
