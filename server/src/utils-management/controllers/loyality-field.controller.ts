import { CustomRequest } from "../../utils/customRequest";
import { errorResponse } from "../../utils/return";
import { LoyaltyGuestFields } from "../services";
import { Response } from "express";
export class LoyaltyGuestFieldControllers {
  public static async getLoyaltyGuestFields(req: CustomRequest, res: Response) {
    try {
      const serRes = await LoyaltyGuestFields.getLoyaltyGuestFields();
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

  public static async createLoyaltyGuestFields(req: CustomRequest, res: Response) {
    try {
      const fields = req.body.fields;
      if (!fields) {
        return res
          .status(400)
          .json(errorResponse('Fields are required to create Loyalty Guest Fields'));
      }
      const serRes = await LoyaltyGuestFields.createLoyaltyGuestFields(fields);
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

  public static async deleteLoyaltyGuestFields(req: CustomRequest, res: Response) {
    try {
      const fields = req.params.id;
      if (!fields) {
        return res
          .status(400)
          .json(errorResponse('Fields are required to delete Loyalty Guest Fields'));
      }
      const serRes = await LoyaltyGuestFields.deleteLoyaltyGuestFields(fields);
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