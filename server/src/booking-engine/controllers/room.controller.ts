import { Response } from 'express';
import { RoomBookingService } from '../service';
import { PropertyRequest } from '../../utils';
import { getGeoLocationDetails } from '../../utils/get-location.utils';
import { getDeviceInfo } from '../../utils/device-type.util';
import { BookingEngineRoomsInterceptor } from '../../multi-language/interceptors/booking-engine/booking-engine-rooms.interceptor';

export class RoomBookingController {
  public static async getCalendarPrices(req: PropertyRequest, res: Response) {
    try {
      const { propertyCode, startDate, endDate } = req.body || {};

      if (!propertyCode || !startDate || !endDate) {
        return res.status(400).json({
          status: "error",
          message: "Invalid or missing propertyCode, startDate, or endDate",
        });
      }

      const response = await RoomBookingService.getCalendarPrices(propertyCode, startDate, endDate);
      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error?.message,
      });
    }
  }

  public static async fetchRooms(req: PropertyRequest, res: Response) {
    try {
      const { propertyCode, startDate, endDate, guests, promocode } = req.body || {};

            if (
                !propertyCode ||
                !startDate ||
                !endDate ||
                !guests ||
                typeof guests.adults !== 'number' ||
                typeof guests.children !== 'number' ||
                typeof guests.rooms !== 'number'
            ) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid or missing request payload',
                });
            }
            const geoDetails = await getGeoLocationDetails(req);
            const countryCode = geoDetails.country;
            const deviceInfo = getDeviceInfo(req);
            const deviceType = deviceInfo.deviceType as
                | 'mobile'
                | 'tablet'
                | 'desktop';

            const locale =
                (req.headers['accept-language'] as string | undefined)
                    ?.slice(0, 2)
                    .toLowerCase() || 'en';

            let response = await RoomBookingService.fetchRooms({
                propertyCode,
                startDate,
                endDate,
                guests,
                countryCode,
                deviceType,
                promocode,
            });

            response = await BookingEngineRoomsInterceptor.intercept(response, locale);

            const status = response.success ? 200 : 400;
            return res.status(status).json(response);
        } catch (error: any) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                error: error?.message,
            });
        }
    }
}
