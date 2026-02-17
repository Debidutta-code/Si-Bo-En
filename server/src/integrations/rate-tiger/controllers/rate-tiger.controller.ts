// controllers/ratetiger.controller.ts

import { Response } from 'express';
import { errorResponse, RateTigerRequest } from '../../../utils';
import {
  RateTigerAuthRequest,
  RateTigerOTAHotelAvailRQ,
  RateTigerOTAHotelAvailGetRQ
} from '../types';
import { RateTigerService } from '../services/rate-tiger.service';
import { RateTigerValidation } from '../validations/request.validation';
import { PriceUpdateService } from '../services/price-update.service';
import { config } from '../../../config';
import { decodeBasicAuth } from '../validations/basicauth.utils';

export class RateTigerController {

  // In RateTigerController

public static async authenticate(req: RateTigerRequest, res: Response) {
  try {
    // 1. Decode BasicAuth header (RateTiger sends this)
    const authHeader = req.headers['basicauth'] as string 
                    ?? req.headers['authorization'] as string;

    if (!authHeader) {
      return res.status(401).json({ 
        status: 'ERROR', 
        message: 'Missing BasicAuth header' 
      });
    }

    const credentials = decodeBasicAuth(authHeader);
    if (!credentials) {
      return res.status(401).json({ 
        status: 'ERROR', 
        message: 'Invalid BasicAuth format' 
      });
    }

    // 2. Validate the username:password against YOUR stored credentials
    if (
      credentials.username !== config.rateTigerUsername ||
      credentials.password !== config.rateTigerPassword
    ) {
      return res.status(401).json({ 
        status: 'ERROR', 
        message: 'Invalid credentials' 
      });
    }

    // 3. Now grab API-Key and partner_id from body
    const { 'API-Key': apiKey, partner_id: partnerId } = req.body as RateTigerAuthRequest;

    if (!apiKey || !partnerId) {
      return res.status(400).json({ 
        status: 'ERROR', 
        message: 'Missing API-Key or partner_id in body' 
      });
    }

    // 4. Generate YOUR token and return it
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
      // Validate
      const validationError = RateTigerValidation.validateRoomRatePlanPull(req.body);
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }

      const { otaHotelAvailRQ } = req.body as RateTigerOTAHotelAvailRQ;
      const { hotelCode, requestId } = otaHotelAvailRQ;

      const result = await RateTigerService.getRoomTypeRatePlanMapping(hotelCode, requestId);

      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal server error', error?.message));
    }
  }

  public static async inventoryPull(req: RateTigerRequest, res: Response) {
    try {
      // Validate
      const validationError = RateTigerValidation.validateInventoryPull(req.body);
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }

      const { otaHotelAvailGetRQ } = req.body as RateTigerOTAHotelAvailGetRQ;
      const { hotelCode, requestId, hotelAvailRequest } = otaHotelAvailGetRQ;

      const result = await RateTigerService.getInventoryPull(
        hotelCode,
        requestId,
        hotelAvailRequest
      );

      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal server error', error?.message));
    }
  }
  // Add to controllers/ratetiger.controller.ts

public static async priceUpdate(req: RateTigerRequest, res: Response) {
  try {
    const validationError = RateTigerValidation.validatePriceUpdate(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const result = await PriceUpdateService.processPriceUpdate(req.body);

    const status = result.success ? 200 : 400;
    return res.status(status).json(result);
  } catch (error: any) {
    return res
      .status(500)
      .json(errorResponse('Internal server error', error?.message));
  }
}
}