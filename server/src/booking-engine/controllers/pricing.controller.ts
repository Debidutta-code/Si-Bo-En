import {
    errorResponse,
    getDeviceInfo,
    getGeoLocationDetails,
    PropertyRequest,
    toUTC,
} from '../../utils';
import { PricingService } from '../service';
import { Response } from 'express';
import { ISelectedAddonsS } from '../types';
export class PricingController {
    private pricingService: PricingService;
    constructor() {
        this.pricingService = new PricingService();
    }
    public async getRoomRentController(
        req: PropertyRequest,
        res: Response
    ): Promise<Response> {
        try {
            const {
                invTypeCode,
                startDate,
                endDate,
                noOfChildren,
                noOfAdults,
                noOfRooms,
                ratePlanCode,
                addons,
                promotions,
                guestEmail,
            } = req.body;

            const propertyCode = req.property?.propertyCode;
            const propertyId = req.property?.id;

            if (!propertyCode ||!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property is not chosen'));
            }
            if (!invTypeCode) {
                return res
                    .status(400)
                    .json(errorResponse('Room type is not chosen'));
            }
            if (!ratePlanCode) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan is not chosen'));
            }
            if (!startDate) {
                return res
                    .status(400)
                    .json(errorResponse('Start date is not chosen'));
            }
            if (!endDate) {
                return res
                    .status(400)
                    .json(errorResponse('End date is not chosen'));
            }

            // Convert and validate guest counts
            const adults = Number(noOfAdults) || 0;
            const children = Number(noOfChildren) || 0;
            const rooms = Number(noOfRooms) || 1;

            if (adults < 1) {
                return res
                    .status(400)
                    .json(errorResponse('At least 1 adult is required'));
            }
            if (children < 0) {
                return res
                    .status(400)
                    .json(
                        errorResponse("Number of children can't be less than 0")
                    );
            }
            if (rooms < 1) {
                return res
                    .status(400)
                    .json(errorResponse('At least 1 room is required'));
            }

            const geoDetails = getGeoLocationDetails(req);
            const userCountryCode =
                geoDetails.country !== 'Unknown'
                    ? geoDetails.country
                    : undefined;

            const deviceInfo = getDeviceInfo(req);
            const detectedDeviceType = deviceInfo.deviceType;

            

            const response =await this.pricingService.getRoomRentService(
                propertyCode,
                propertyId,
                invTypeCode,
                toUTC(startDate),
                toUTC(endDate),
                ratePlanCode,
                rooms,
                adults,
                children,
                guestEmail,
                userCountryCode,
                detectedDeviceType,
                promotions,
                addons
            );

            return res.status(response  .success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Internal server error', error?.message)
                    );
            }
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }
}
