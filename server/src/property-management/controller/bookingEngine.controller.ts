import { Request, Response } from "express";
import { BookingEngineService } from "../services";
import { errorResponse } from "../../utils/return";
import { PropertyCustomRequest } from "../../utils";

export class BookingEngineController {
  public static async getConfigByPropertyId(req: PropertyCustomRequest, res: Response) {
    try {
      const propertyId = req.params.id;
      if (!propertyId)
        return res.status(400).json(errorResponse("Property id not found"));

      const response = await BookingEngineService.getConfigByPropertyId(
        propertyId
      );
      const status = response.success ? 200 : 404;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse("Internal Server Error", error?.message));
    }
  }

  public static async addConfig(req: PropertyCustomRequest, res: Response) {
    try {
      const propertyId = req.params.id;
      const { primaryColor, secondaryColor, tertiaryColor, buttonTextColor, bannerImage, logo } =
        req.body;

      if (!propertyId)
        return res
          .status(400)
          .json(errorResponse("Insufficient property details"));

      if (!primaryColor || !secondaryColor || !tertiaryColor || !buttonTextColor)
        return res
          .status(400)
          .json(errorResponse("All color fields are required"));

      const response = await BookingEngineService.addConfig({
        propertyId,
        primaryColor,
        secondaryColor,
        tertiaryColor,
        buttonTextColor,
        bannerImage,
        logo,
      });

      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse("Internal Server Error", error?.message));
    }
  }

  public static async updateConfigByPropertyId(req: PropertyCustomRequest, res: Response) {
    try {
      const propertyId = req.params.id;
      const { primaryColor, secondaryColor, tertiaryColor, bannerImage, logo } =
        req.body;

      if (!propertyId)
        return res
          .status(400)
          .json(errorResponse("Insufficient property details"));

      const response = await BookingEngineService.updateConfigByPropertyId(
        propertyId,
        { primaryColor, secondaryColor, tertiaryColor, bannerImage, logo }
      );

      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse("Internal Server Error", error?.message));
    }
  }
  public static async deleteByPropertyId(req: PropertyCustomRequest, res: Response) {
    try {
      const propertyId = req.params.id;
      if (!propertyId)
        return res.status(400).json(errorResponse("Property id not found"));

      const response = await BookingEngineService.deleteByPropertyId(
        propertyId
      );
      const status = response.success ? 200 : 404;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse("Internal Server Error", error?.message));
    }
  }
}
