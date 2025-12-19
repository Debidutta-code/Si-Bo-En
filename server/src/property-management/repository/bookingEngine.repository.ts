import { prisma } from "../../config";
import { IBookingEngineConfig } from "../types";

export class BookingEngineConfigDao {
  public static async getByPropertyId(propertyId: string) {
    try {
      return await prisma.bookingEngineConfigurations.findUnique({
        where: { propertyId },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  public static async deleteByPropertyId(propertyId: string) {
    try {
      return await prisma.bookingEngineConfigurations.delete({
        where: { propertyId },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  public static async addConfig(config: IBookingEngineConfig) {
    try {
      return await prisma.bookingEngineConfigurations.create({
        data: config,
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public static async updateConfigByPropertyId(
    propertyId: string,
    config: Partial<IBookingEngineConfig>
  ) {
    try {
      return await prisma.bookingEngineConfigurations.update({
        where: { propertyId },
        data: config,
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
