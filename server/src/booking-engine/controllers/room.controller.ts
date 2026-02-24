import { Request, Response } from "express";
import { RoomBookingService } from "../service";
import { PropertyRequest } from "../../utils";
import { getGeoLocationDetails } from "../../utils/get-location.utils";
import { getDeviceInfo } from "../../utils/device-type.util";
import console from "console";

export class RoomBookingController {
  public static async fetchRooms(req: PropertyRequest, res: Response) {
    try {
      const { PropertyCode, startDate, endDate, guests, promocode } = req.body || {};

      // 🔐 Required payload validation
      if (
        !PropertyCode ||
        !startDate ||
        !endDate ||
        !guests ||
        typeof guests.adults !== "number" ||
        typeof guests.children !== "number" ||
        typeof guests.rooms !== "number"
      ) {
        return res.status(400).json({
          status: "error",
          message: "Invalid or missing request payload",
        });
      }

      // Extract country code from geo-location
      const geoDetails = await getGeoLocationDetails(req);
      const countryCode = geoDetails.country;
      // console.log(countryCode)
      const deviceInfo = getDeviceInfo(req);
      const deviceType = deviceInfo.deviceType as "mobile" | "tablet" | "desktop";
      console.log(deviceType)

      // Detect device type from user agent

      const response = await RoomBookingService.fetchRooms({
        PropertyCode,
        startDate,
        endDate,
        guests,
        countryCode,
        deviceType,
        promocode
      });

      const status = response.success ? 200 : 400;
      return res.status(status).json(response);

    } catch (error: any) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error?.message
      });
    }
  }
}