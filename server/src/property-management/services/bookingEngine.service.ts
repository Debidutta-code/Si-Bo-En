import { BookingEngineConfigDao } from "../repository/bookingEngine.repository";
import { IBookingEngineConfig } from "../types/index";
import { successResponse, errorResponse } from "../../utils/return";

export class BookingEngineService {
  public static async getConfigByPropertyId(propertyId: string) {
    try {
      const config = await BookingEngineConfigDao.getByPropertyId(propertyId);
      if (config) {
        return successResponse(
          "Booking engine config fetched successfully",
          config
        );
      }
      return errorResponse("Booking engine config not found");
    } catch (error: any) {
      return errorResponse(
        "Error fetching booking engine config",
        error?.message
      );
    }
  }

  public static async addConfig(config: IBookingEngineConfig) {
    try {
      const created = await BookingEngineConfigDao.addConfig(config);
      if (created) {
        return successResponse(
          "Booking engine config added successfully",
          created
        );
      }
      return errorResponse("Failed to add booking engine config");
    } catch (error: any) {
      return errorResponse(
        "Error adding booking engine config",
        error?.message
      );
    }
  }

  public static async updateConfigByPropertyId(
    propertyId: string,
    config: Partial<IBookingEngineConfig>
  ) {
    try {
      const updated = await BookingEngineConfigDao.updateConfigByPropertyId(
        propertyId,
        config
      );
      if (updated) {
        return successResponse(
          "Booking engine config updated successfully",
          updated
        );
      }
      return errorResponse("Failed to update booking engine config");
    } catch (error: any) {
      return errorResponse(
        "Error updating booking engine config",
        error?.message
      );
    }
  }
    public static async deleteByPropertyId(propertyId: string) {
    try {
      const config = await BookingEngineConfigDao.deleteByPropertyId(propertyId);
      if (config) {
        return successResponse(
          "Booking engine config deleted successfully"
        );
      }
      return errorResponse("Booking engine config not found");
    } catch (error: any) {
      return errorResponse(
        "something went wrong while deleting ...",
        error?.message
      );
    }
  }
}
