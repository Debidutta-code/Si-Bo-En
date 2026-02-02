import { getPropertyCode } from '../../pms/frontoffice/room-management/utils/property.util';
import { toUTCDate } from '../../utils';
import { CustomRequest ,PropertyCustomRequest} from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { AvailabilityServices } from '../services';
import { Response } from 'express';

export class AvailabilityController {
  public static async getCalendarAvailability(req: PropertyCustomRequest, res: Response) {
    try {
      // ✅ ADD: ratePlanCode parameter
      const { propertyId, startDate, endDate, invTypeCodes, roomTypeCode, ratePlanCode } = req.query;

      if (!propertyId || !startDate || !endDate) {
        return res.status(400).json(
          errorResponse('Missing required parameters: propertyId, startDate, endDate')
        );
      }
      
      const propertyCode = await getPropertyCode(propertyId as string);
      
      // Validate dates
      const start = toUTCDate(startDate as string);
      const end = toUTCDate(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json(errorResponse('Invalid date format. Use YYYY-MM-DD'));
      }

      if (start > end) {
        return res.status(400).json(errorResponse('Start date must be before end date'));
      }

      // Parse room type codes
      let roomTypeCodes: string[] = [];
      
      if (roomTypeCode) {
        roomTypeCodes = [String(roomTypeCode).trim()];
      } else if (invTypeCodes && String(invTypeCodes).length > 0) {
        roomTypeCodes = String(invTypeCodes).split(',').map(code => code.trim());
      }

      // ✅ ADD: Parse rate plan codes
      let ratePlanCodes: string[] = [];
      
      if (ratePlanCode && String(ratePlanCode).length > 0) {
        ratePlanCodes = String(ratePlanCode).split(',').map(code => code.trim());
      }

      console.log('🔍 Controller - Filters:', { roomTypeCodes, ratePlanCodes });

      const response = await AvailabilityServices.getCalendarAvailability(
        propertyCode as string,
        start,
        end,
        roomTypeCodes,
        ratePlanCodes // ✅ ADD: Pass rate plan codes
      );

      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res.status(500).json(errorResponse('Internal server error', error?.message));
    }
  }
}