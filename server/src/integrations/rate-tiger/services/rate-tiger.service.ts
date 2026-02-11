// services/ratetiger.service.ts

import jwt from 'jsonwebtoken';
import {
  RateTigerAuthResponse,
  RateTigerOTAHotelAvailRS,
  RateTigerTokenPayload
} from '../types';
import { errorResponse, successResponse, IApiResponse } from '../../../utils';
import { RateTigerDao } from '../dao';
import { config } from '../../../config';

export class RateTigerService {

  public static async generateAuthToken(
    apiKey: string,
    partnerId: string
  ): Promise<IApiResponse<RateTigerAuthResponse>> {
    try {
      const jwtSecret = config.rateTigerJwtSecret || 'your-secret-key';
      const expiresIn = config.rateTigerJwtExpiresIn;
      

      const payload: RateTigerTokenPayload = {
        partnerId,
        apiKey,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn
      };

      const token = jwt.sign(payload, jwtSecret);

      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);

      const response: RateTigerAuthResponse = {
        access_token: token,
        expires_in: expiryDate.toISOString()
      };

      return successResponse('Authentication token generated successfully', response);
    } catch (error: any) {
      return errorResponse('Failed to generate authentication token', error?.message);
    }
  }

  /**
   * Get room types and rate plans for a property
   */
  public static async getRoomTypeRatePlanMapping(
    hotelCode: string,
    requestId: string
  ): Promise<IApiResponse<RateTigerOTAHotelAvailRS>> {
    try {
      // Verify property exists
      const propertyExists = await RateTigerDao.propertyExists(hotelCode);
      
      if (!propertyExists) {
        return errorResponse(`Property with code ${hotelCode} not found`);
      }

      // Get mapping data
      const mappingData = await RateTigerDao.getPropertyMappingData(hotelCode);
      if (!mappingData) {
        return errorResponse(`Failed to fetch mapping data for property ${hotelCode}`);
      }

      // Get current date for timestamp
      const currentDate = new Date().toISOString().split('T')[0];

      // Format response in RateTiger OTA format
      const response: RateTigerOTAHotelAvailRS = {
        otaHotelAvailRS: {
          hotelCode: mappingData.propertyCode,
          requestId: requestId,
          roomStays: {
            // 1. Rate Plans array
            ratePlans: mappingData.ratePlans.map(ratePlan => ({
              ratePlanCode: ratePlan.ratePlanCode,
              ratePlanName: ratePlan.ratePlanName,
              effectiveDate: ratePlan.effectiveDate 
                ? ratePlan.effectiveDate.toISOString().split('T')[0] 
                : currentDate,
              expireDate: ratePlan.expireDate 
                ? ratePlan.expireDate.toISOString().split('T')[0] 
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              ratePlanType: '',
              roomPricingType: ''
            })),
            
            // 2. Room Rates array (the mapping!)
            roomRates: mappingData.roomRates.map(roomRate => ({
              ratePlanCode: roomRate.ratePlanCode,
              roomTypeCode: roomRate.roomTypeCode,
              status: roomRate.status
            })),
            
            // 3. Room Types array
            roomTypes: mappingData.roomTypes.map(roomType => ({
              defaultOccupancy: "1", // You can customize this based on your logic
              maxAdultOccupancy: roomType.maxNumberOfAdults.toString(),
              minAdultOccupancy: "1",
              roomName: roomType.roomTypeName,
              roomTypeCode: roomType.roomTypeCode
            }))
          },
          success: "true",
          timeStamp: currentDate
        }
      };
      return successResponse('Room type and rate plan mapping retrieved successfully', response);
    } catch (error: any) {
      return errorResponse('Failed to get room type and rate plan mapping', error?.message);
    }
  }
}