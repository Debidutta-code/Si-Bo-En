// controllers/price-pull.controller.ts

import { Response } from 'express';
import { errorResponse, RateTigerRequest } from '../../../utils';
import { RateTigerOTAHotelRatePlanRQ } from '../types/price-pull.types';
import { PricePullService } from '../services/price-pull.service';
import { RateTigerValidation } from '../validations/request.validation';

export class PricePullController {

  public static async pricePull(req: RateTigerRequest, res: Response) {
    try {
      const validationError = RateTigerValidation.validatePricePull(req.body);
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }

      const { otaHotelRatePlanRQ } = req.body as RateTigerOTAHotelRatePlanRQ;
      const { hotelCode, requestId, ratePlans } = otaHotelRatePlanRQ;

      const result = await PricePullService.getPricePull(
        hotelCode,
        requestId,
        ratePlans
      );

      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal server error', error?.message));
    }
  }
}