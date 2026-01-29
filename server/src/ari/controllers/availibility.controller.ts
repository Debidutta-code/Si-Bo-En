import { getPropertyCode } from '../../pms/frontoffice/room-management/utils/property.util';
import { toUTCDate } from '../../utils';
import { CustomRequest ,PropertyCustomRequest} from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { AvailabilityServices } from '../services';
import { Response } from 'express';

export class AvailabilityController {
  public static async getCalendarAvailability(req: PropertyCustomRequest, res: Response) {
    try {
      const { propertyId, startDate, endDate, invTypeCodes } = req.query;

      if (!propertyId || !startDate || !endDate) {
        return res.status(400).json(
          errorResponse('Missing required parameters: propertyCode, startDate, endDate')
        );
      }
      const propertyCode = await getPropertyCode(propertyId as string)
      // Validate dates
      const start = toUTCDate(startDate as string);
      const end = toUTCDate(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json(errorResponse('Invalid date format. Use YYYY-MM-DD'));
      }

      if (start > end) {
        return res.status(400).json(errorResponse('Start date must be before end date'));
      }

      // Parse room type codes (comma-separated)
      const roomTypeCodes = invTypeCodes && String(invTypeCodes).length > 0
        ? String(invTypeCodes).split(',').map(code => code.trim())
        : [];

      const response = await AvailabilityServices.getCalendarAvailability(
        propertyCode as string,
        start,
        end,
        roomTypeCodes
      );

      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res.status(500).json(errorResponse('Internal server error', error?.message));
    }
  }
}
