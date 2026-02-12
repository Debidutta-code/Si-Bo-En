// controllers/inventory-update.controller.ts

import { Response } from 'express';
import { errorResponse, RateTigerRequest } from '../../../utils';
import { RateTigerInventoryUpdateRQ } from '../types/inventory-update.types';
import { InventoryUpdateService } from '../services/inventory-update.service';
import { RateTigerValidation } from '../validations/request.validation';

export class InventoryUpdateController {

  public static async inventoryUpdate(req: RateTigerRequest, res: Response) {
    try {
      const validationError = RateTigerValidation.validateInventoryUpdate(req.body);
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }

      const result = await InventoryUpdateService.processInventoryUpdate(
        req.body as RateTigerInventoryUpdateRQ
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