import { Request, Response } from "express";
import { RoomBookingService } from "../service";

export class RoomBookingController {
  public static async fetchRooms(req: Request, res: Response) {
    try {
      const { PropertyCode, startDate, endDate, guests } = req.body || {};

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

      const response = await RoomBookingService.fetchRooms({
        PropertyCode,
        startDate,
        endDate,
        guests
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
