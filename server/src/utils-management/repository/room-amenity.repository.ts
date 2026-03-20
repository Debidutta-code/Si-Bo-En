import { AmenityType } from "../types";
import {prisma} from "../../config"
export class RoomAminityDao {
  public  async getAllRoomAmenities() {
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
    } catch (error) {
      throw new Error("Failed to get room amenities");
    }
  }

  public  async addRoomAmenities(newAmenities: string[]) {
    try {
      const amenityData = newAmenities.map(name => ({
        amenityName: name,
        amenityType: "room" as AmenityType,
        isActive: true,
      }));

      await prisma.masterAmenity.createMany({
        data: amenityData,
        skipDuplicates: true,
      });

      return await this.getAllRoomAmenities();
    } catch (error) {
      throw new Error(`Error adding room amenities`);
    }
  }

  public  async deleteAmenities(amenityNames: string[]) {
    try {
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

      return await this.getAllRoomAmenities();
    } catch (error) {
      throw new Error(`Error deleting amenities`);
    }
  }
}
