import { getPropertyCode } from '../../pms/frontoffice/room-management/utils/property.util';
import { toUTCDate } from '../../utils';
import { PropertyCustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { AvailabilityServices } from '../services';
import { Request, Response } from 'express';

export class AvailabilityController {
  public static async getCalendarAvailability(req: Request, res: Response) {
    try {
      // ✅ Read from body instead of query
      const { propertyId, startDate, endDate, roomTypeCodes = [], ratePlanCodes = [] } = req.body;

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

      // ✅ Arrays come clean from body - no parsing needed!
      const parsedRoomTypeCodes = Array.isArray(roomTypeCodes) 
        ? roomTypeCodes.map(code => String(code).trim())
        : [];
      
      const parsedRatePlanCodes = Array.isArray(ratePlanCodes)
        ? ratePlanCodes.map(code => String(code).trim())
        : [];

      // console.log('🔍 Controller - Filters:', { 
      //   roomTypeCodes: parsedRoomTypeCodes, 
      //   ratePlanCodes: parsedRatePlanCodes 
      // });

      const response = await AvailabilityServices.getCalendarAvailability(
        propertyCode as string,
        start,
        end,
        parsedRoomTypeCodes,
        parsedRatePlanCodes
      );

      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res.status(500).json(errorResponse('Internal server error', error?.message));
    }
  }
}