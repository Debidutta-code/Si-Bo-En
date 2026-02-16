import { CustomRequest } from "../../utils/customRequest";
import { errorResponse } from "../../utils/return";
import { RoomAmenityServices } from "../services";
import { Response } from "express";
export class RoomAminityControllerManagement {
  public static async createRoomAminity(req: CustomRequest, res: Response) {
    try {
      const { amenities } = req.body;
      if (!amenities || amenities.length == 0) {
        return res.status(400).json(errorResponse('Aminity is empty'));
      }
      const serRes = await RoomAmenityServices.createRoomAmenity(amenities);
      if (serRes.success) {
        return res.status(200).json(serRes);
      } else {
        return res.status(400).json(serRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async getRoomAmenities(req: CustomRequest, res: Response) {
    try {
      const serRes = await RoomAmenityServices.getRoomAmenity();
      if (serRes.success) {
        return res.status(200).json(serRes);
      } else {
        return res.status(400).json(serRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async deleteRoomAmenities(req: CustomRequest, res: Response) {
    try {
      const { amenities } = req.body;
      if (!amenities) {
        return res
          .status(400)
          .json(errorResponse('Aminity is required to delete'));
      }
      const serRes = await RoomAmenityServices.deleteRoomAmenity(amenities);
      if (serRes.success) {
        return res.status(200).json(serRes);
      } else {
        return res.status(400).json(serRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
}