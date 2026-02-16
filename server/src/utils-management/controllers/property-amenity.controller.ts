import { CustomRequest } from "../../utils/customRequest";
import { errorResponse } from "../../utils/return";
import { AminityServices, CategoryService } from "../services";
import { Response } from "express";

export class AminityController {
  public static async createAminity(req: CustomRequest, res: Response) {
    try {
      const { amenities } = req.body;
      if (!amenities || amenities.length == 0) {
        return res.status(400).json(errorResponse('Aminity is empty'));
      }
      const serRes = await AminityServices.createCategory(amenities);
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
  public static async getAmenities(req: CustomRequest, res: Response) {
    try {
      const type=req.query.type as string | "property"
      const serRes = await AminityServices.getCategory(type);
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
  public static async deleteAmenities(req: CustomRequest, res: Response) {
    try {
      const { amenities } = req.body;
      if (!amenities) {
        return res
          .status(400)
          .json(errorResponse('Aminity is required to delete'));
      }
      const serRes = await AminityServices.deleteCategory(amenities);
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