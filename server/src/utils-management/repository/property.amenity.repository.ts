import {prisma} from "../../config";
import {AmenityType} from "../types";
export class PropertyAminityDao {
  public  async getAllPropertyAmenities(type: string = "property") {
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
    } catch (error) {
      throw new Error("Failed to get property amenities");
    }
  }

  public  async addPropertyAmenities(newAmenities: string[]) {
    try {
      const amenityData = newAmenities.map(name => ({
        amenityName: name.toLocaleLowerCase(),
        amenityType: "property" as AmenityType,
        isActive: true,
      }));

      await prisma.masterAmenity.createMany({
        data: amenityData,
        skipDuplicates: true, // Skip if amenityName already exists (unique constraint)
      });

      return await this.getAllPropertyAmenities();
    } catch (error) {
      throw new Error(`Error adding property amenities`);
    }
  }

  public  async deletePropertyAmenities(amenityNames: string[]) {
    try {
      const result = await prisma.masterAmenity.deleteMany({
        where: {
          amenityName: { in: amenityNames },
          amenityType: "property",
        },
      });

      if (result.count === 0) {
        throw new Error('No property amenities found to delete');
      }

      return await this.getAllPropertyAmenities();
    } catch (error) {
      throw new Error(`Error deleting amenities`);
    }
  }
}