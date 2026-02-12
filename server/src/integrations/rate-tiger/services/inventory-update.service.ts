// services/inventory-update.service.ts

import { IApiResponse, errorResponse, successResponse } from '../../../utils';
import { InventoryUpdateDao } from '../dao/inventory-update.dao';
import {
  RateTigerInventoryUpdateRQ,
  RateTigerInventoryUpdateRS
} from '../types/inventory-update.types';

export class InventoryUpdateService {

  public static async processInventoryUpdate(
    body: RateTigerInventoryUpdateRQ
  ): Promise<IApiResponse<RateTigerInventoryUpdateRS>> {
    const { otaHotelAvailNotifRQ } = body;
    const { hotelCode, requestId, availStatusMessages } = otaHotelAvailNotifRQ;

    try {
      const propertyExists = await InventoryUpdateDao.propertyExists(hotelCode);
      if (!propertyExists) {
        return errorResponse(`Property with code ${hotelCode} not found`);
      }

      for (const message of availStatusMessages) {
        const {
          invTypeCode: roomTypeCode,
          ratePlanCode,
          bookingLimit,
          lengthOfStay,
          restrictionStatus
        } = message;

        // Parse MinLOS / MaxLOS from lengthOfStay array
        let minLos: number | undefined;
        let maxLos: number | undefined;

        if (lengthOfStay && lengthOfStay.length > 0) {
          for (const los of lengthOfStay) {
            if (los.minMaxMessageType === 'SetMinLOS') {
              minLos = parseInt(los.time);
            }
            if (los.minMaxMessageType === 'SetMaxLOS') {
              maxLos = parseInt(los.time);
            }
          }
        }

        // Parse restrictions from restrictionStatus array
        let isSaleStopped: boolean | undefined;
        let isClosedToArrival: boolean | undefined;
        let isClosedToDeparture: boolean | undefined;
        let minAdvanceBookingDays: number | undefined;
        let maxAdvanceBookingDays: number | undefined;

        if (restrictionStatus && restrictionStatus.length > 0) {
          for (const restriction of restrictionStatus) {
            // Handle status+restriction objects
            if (restriction.restriction === 'Master') {
              isSaleStopped = restriction.status === 'Close';
            }
            if (restriction.restriction === 'Arrival') {
              isClosedToArrival = restriction.status === 'Close';
            }
            if (restriction.restriction === 'Departure') {
              isClosedToDeparture = restriction.status === 'Close';
            }

            // Handle cutoff object (4th object with no restriction field)
            if (restriction.minAdvanceBookingOffSet) {
              // Parse "P2D" → 2
              minAdvanceBookingDays = parseInt(
                restriction.minAdvanceBookingOffSet.replace('P', '').replace('D', '')
              );
            }
            if (restriction.maxAdvanceBookingOffSet) {
              maxAdvanceBookingDays = parseInt(
                restriction.maxAdvanceBookingOffSet.replace('P', '').replace('D', '')
              );
            }
          }
        }

        // Expand date range day by day — delta mode
        const startDate = new Date(message.start);
        const endDate = new Date(message.end);
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          await InventoryUpdateDao.upsertInventoryAndRestrictions({
            propertyCode: hotelCode,
            roomTypeCode,
            ratePlanCode: ratePlanCode ?? '',
            date: new Date(currentDate),
            bookingLimit: bookingLimit !== undefined
              ? parseInt(bookingLimit)
              : undefined,
            isSaleStopped,
            isClosedToArrival,
            isClosedToDeparture,
            minAdvanceBookingDays,
            maxAdvanceBookingDays,
            minLos,
            maxLos
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      const response: RateTigerInventoryUpdateRS = {
        otaHotelAvailNotifRS: {
          hotelCode,
          requestId,
          success: 'true',
          timeStamp: new Date().toISOString()
        }
      };

      return successResponse('Inventory update processed successfully', response);
    } catch (error: any) {
      return errorResponse('Failed to process inventory update', error?.message);
    }
  }
}