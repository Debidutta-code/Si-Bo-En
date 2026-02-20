// services/ratetiger.service.ts

import jwt from 'jsonwebtoken';
import {
    RateTigerAuthResponse,
    RateTigerAvailStatusMessage,
    RateTigerHotelAvailRequest,
    RateTigerOTAHotelAvailGetRS,
    RateTigerOTAHotelAvailRS,
    RateTigerTokenPayload,
} from '../types';
import { RateTigerDao } from '../dao';
import { config } from '../../../config';
import { toGMTExpiryString } from '../utils/time.utils';

export class RateTigerService {
    public static async generateAuthToken(
        apiKey: string,
        partnerId: string
    ): Promise<RateTigerAuthResponse> {
        const jwtSecret = config.rateTigerJwtSecret || 'your-secret-key';
        const expiresIn = config.rateTigerJwtExpiresIn;

        const payload: RateTigerTokenPayload = {
            partnerId,
            apiKey,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + expiresIn,
        };

        const token = jwt.sign(payload, jwtSecret);
        return {
            access_token: token,
            expires_in: toGMTExpiryString(expiresIn),
        };
    }

    public static async getRoomTypeRatePlanMapping(
        hotelCode: string,
        requestId: string
    ): Promise<RateTigerOTAHotelAvailRS> {
        try {
            // Verify property exists
            const propertyExists = await RateTigerDao.propertyExists(hotelCode);

            if (!propertyExists) {
                return {
                    otaHotelAvailRS: {
                        hotelCode,
                        requestId,
                        success: 'false',
                        timeStamp: new Date().toISOString(),
                        error: {
                            type: 'ProcessingError',
                            errorCode: '404',
                            text: `Property with code ${hotelCode} not found`,
                        },
                    },
                };
            }

            // Get mapping data
            const mappingData =
                await RateTigerDao.getPropertyMappingData(hotelCode);
            if (!mappingData) {
                return {
                    otaHotelAvailRS: {
                        hotelCode,
                        requestId,
                        success: 'false',
                        timeStamp: new Date().toISOString(),
                        error: {
                            type: 'ProcessingError',
                            errorCode: '500',
                            text: `Failed to fetch mapping data for property ${hotelCode}`,
                        },
                    },
                };
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
                                ? ratePlan.effectiveDate
                                      .toISOString()
                                      .split('T')[0]
                                : currentDate,
                            expireDate: ratePlan.expireDate
                                ? ratePlan.expireDate
                                      .toISOString()
                                      .split('T')[0]
                                : new Date(
                                      Date.now() + 365 * 24 * 60 * 60 * 1000
                                  )
                                      .toISOString()
                                      .split('T')[0],
                            ratePlanType: '',
                            roomPricingType: '',
                        })),

                        // 2. Room Rates array (the mapping!)
                        roomRates: mappingData.roomRates.map(roomRate => ({
                            ratePlanCode: roomRate.ratePlanCode,
                            roomTypeCode: roomRate.roomTypeCode,
                            status: roomRate.status,
                        })),

                        // 3. Room Types array
                        roomTypes: mappingData.roomTypes.map(roomType => ({
                            defaultOccupancy: '1',
                            maxAdultOccupancy:
                                roomType.maxNumberOfAdults.toString(),
                            minAdultOccupancy: '1',
                            roomName: roomType.roomTypeName,
                            roomTypeCode: roomType.roomTypeCode,
                        })),
                    },
                    success: 'true',
                    timeStamp: currentDate,
                },
            };
            return response;
        } catch (error: any) {
            return {
                otaHotelAvailRS: {
                    hotelCode,
                    requestId,
                    success: 'false',
                    timeStamp: new Date().toISOString(),
                    error: {
                        type: 'ProcessingError',
                        errorCode: '500',
                        text:
                            error?.message ||
                            'Failed to get room type and rate plan mapping',
                    },
                },
            };
        }
    }

    public static async getInventoryPull(
        hotelCode: string,
        requestId: string,
        hotelAvailRequests: RateTigerHotelAvailRequest[]
    ): Promise<RateTigerOTAHotelAvailGetRS> {
        try {
            const propertyExists = await RateTigerDao.propertyExists(hotelCode);
            if (!propertyExists) {
                return {
                    otaHotelAvailGetRS: {
                        requestId,
                        timeStamp: new Date().toISOString(),
                        hotelCode,
                        success: 'false',
                        error: {
                            type: 'ProcessingError',
                            errorCode: '404',
                            text: `Property with code ${hotelCode} not found`,
                        },
                    },
                };
            }

            const availStatusMessages: RateTigerAvailStatusMessage[] = [];

            for (const request of hotelAvailRequests) {
                const startDate = new Date(request.start);
                const endDate = new Date(request.end);
                const { roomTypeCode, ratePlanCode } = request;

                // 1. Get MinLOS/MaxLOS rule
                let losRule = null;
                if (request.sendLengthsOfStay && ratePlanCode) {
                    losRule = await RateTigerDao.getRatePlanRules(
                        hotelCode,
                        ratePlanCode,
                        startDate,
                        endDate
                    );
                }

                // 2. Get combined daily data
                const dailyData =
                    await RateTigerDao.getDailyInventoryAndRestrictions(
                        hotelCode,
                        roomTypeCode,
                        ratePlanCode ?? '',
                        startDate,
                        endDate
                    );

                if (dailyData.length === 0) continue;

                // 3. Group consecutive days with identical values
                const groups = RateTigerService.groupDailyData(
                    dailyData,
                    request.sendBookingLimit ?? false,
                    request.sendAllRestrictions ?? false
                );

                // 4. Build one availStatusMessage per group
                for (const group of groups) {
                    const message: RateTigerAvailStatusMessage = {
                        start: group.start,
                        end: group.end,
                        invTypeCode: roomTypeCode,
                        ratePlanCode: ratePlanCode,
                    };

                    if (request.sendBookingLimit) {
                        message.bookingLimit = group.availability.toString();
                    }

                    if (request.sendLengthsOfStay && losRule) {
                        message.lengthOfStay = [
                            {
                                minMaxMessageType: 'SetMinLOS',
                                time: losRule.minLos.toString(),
                                timeUnit: 'Day',
                            },
                        ];
                        if (losRule.maxLos) {
                            message.lengthOfStay.push({
                                minMaxMessageType: 'SetMaxLOS',
                                time: losRule.maxLos.toString(),
                                timeUnit: 'Day',
                            });
                        }
                    }

                    if (request.sendAllRestrictions) {
                        message.restrictionStatus = [
                            {
                                status: group.isSaleStopped ? 'Close' : 'Open',
                                restriction: 'Master',
                            },
                            {
                                status: group.isClosedToArrival
                                    ? 'Close'
                                    : 'Open',
                                restriction: 'Arrival',
                            },
                            {
                                status: group.isClosedToDeparture
                                    ? 'Close'
                                    : 'Open',
                                restriction: 'Departure',
                            },
                        ];
                    }

                    availStatusMessages.push(message);
                }
            }

            const response: RateTigerOTAHotelAvailGetRS = {
                otaHotelAvailGetRS: {
                    requestId,
                    timeStamp: new Date().toISOString(),
                    hotelCode,
                    success: 'true',
                    availStatusMessages,
                },
            };

            return response;
        } catch (error: any) {
            return {
                otaHotelAvailGetRS: {
                    requestId,
                    timeStamp: new Date().toISOString(),
                    hotelCode,
                    success: 'false',
                    error: {
                        type: 'ProcessingError',
                        errorCode: '500',
                        text: error?.message || 'Failed to get inventory pull',
                    },
                },
            };
        }
    }

    private static groupDailyData(
        dailyData: Array<{
            date: Date;
            availability: number;
            isSaleStopped: boolean;
            isClosedToArrival: boolean;
            isClosedToDeparture: boolean;
        }>,
        checkAvailability: boolean,
        checkRestrictions: boolean
    ): Array<{
        start: string;
        end: string;
        availability: number;
        isSaleStopped: boolean;
        isClosedToArrival: boolean;
        isClosedToDeparture: boolean;
    }> {
        if (dailyData.length === 0) return [];

        const groups: Array<{
            start: string;
            end: string;
            availability: number;
            isSaleStopped: boolean;
            isClosedToArrival: boolean;
            isClosedToDeparture: boolean;
        }> = [];

        let currentGroup = {
            start: dailyData[0].date.toISOString().split('T')[0],
            end: dailyData[0].date.toISOString().split('T')[0],
            availability: dailyData[0].availability,
            isSaleStopped: dailyData[0].isSaleStopped,
            isClosedToArrival: dailyData[0].isClosedToArrival,
            isClosedToDeparture: dailyData[0].isClosedToDeparture,
        };

        for (let i = 1; i < dailyData.length; i++) {
            const day = dailyData[i];
            const dateStr = day.date.toISOString().split('T')[0];

            const availabilityMatches =
                !checkAvailability ||
                day.availability === currentGroup.availability;

            const restrictionsMatch =
                !checkRestrictions ||
                (day.isSaleStopped === currentGroup.isSaleStopped &&
                    day.isClosedToArrival === currentGroup.isClosedToArrival &&
                    day.isClosedToDeparture ===
                        currentGroup.isClosedToDeparture);

            if (availabilityMatches && restrictionsMatch) {
                currentGroup.end = dateStr;
            } else {
                groups.push(currentGroup);
                currentGroup = {
                    start: dateStr,
                    end: dateStr,
                    availability: day.availability,
                    isSaleStopped: day.isSaleStopped,
                    isClosedToArrival: day.isClosedToArrival,
                    isClosedToDeparture: day.isClosedToDeparture,
                };
            }
        }

        groups.push(currentGroup);
        return groups;
    }
}
