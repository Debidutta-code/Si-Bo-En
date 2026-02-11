// controllers/ratetiger.controller.ts

import { Response } from 'express';
import { errorResponse, RateTigerRequest } from '../../../utils';
import { 
  RateTigerAuthRequest,
  RateTigerOTAHotelAvailRQ 
} from '../types';
import { RateTigerService } from '../services/rate-tiger.service';

export class RateTigerController {
  
  public static async authenticate(req: RateTigerRequest, res: Response) {
    try {
      const { 'API-Key': apiKey, partner_id: partnerId } = req.body as RateTigerAuthRequest;

      const result = await RateTigerService.generateAuthToken(apiKey, partnerId);
      
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal server error', error?.message));
    }
  }

  public static async roomRatePlanPull(req: RateTigerRequest, res: Response) {
    try {
      const { otaHotelAvailRQ } = req.body as RateTigerOTAHotelAvailRQ;
      const { hotelCode, requestId } = otaHotelAvailRQ;

      const result = await RateTigerService.getRoomTypeRatePlanMapping(
        hotelCode,
        requestId
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