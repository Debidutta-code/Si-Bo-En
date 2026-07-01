import {
    CustomRequest,
    errorResponse,
    getDeviceInfo,
    getGeoLocationDetails,
    toUTC,
} from '../../utils';
import { PricingService } from '../service';
import { Response } from 'express';
import { PricingInterceptor } from '../../multi-language/interceptors/pricing/pricing.interceptor';
export class PricingController {
    private pricingService: PricingService;
    constructor() {
        this.pricingService = new PricingService();
    }
    public async getRoomRentController(
        req: CustomRequest,
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
                parsedAddons,
                promotions,
                email,
                promoCode,
                includedAddons,
                childAges,
                guestDistribution,
                applyLoyaltyDiscount,
                customizableDeals,
                agencyId
            } = req.body;
            const propertyId = req.property?.id;

            if (!propertyId) {
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
            const adults = Number(noOfAdults);
            const children = Number(noOfChildren);
            const rooms = Number(noOfRooms);

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

            const geoDetails = await getGeoLocationDetails(req);
            const userCountryCode =
                geoDetails.country !== 'Unknown'
                    ? geoDetails.country
                    : undefined;

            const deviceInfo = getDeviceInfo(req);
            const detectedDeviceType = deviceInfo.deviceType;

            let response = await this.pricingService.getRoomRentService(
                propertyId,
                invTypeCode,
                toUTC(startDate),
                toUTC(endDate),
                ratePlanCode,
                rooms,
                adults,
                guestDistribution,
                includedAddons ? includedAddons : [],
                children ? children : 0,
                childAges,
                userCountryCode ? userCountryCode : '',
                detectedDeviceType ? detectedDeviceType : '',
                promotions ? promotions : [],
                parsedAddons ? parsedAddons : [],
                promoCode,
                applyLoyaltyDiscount ? email : '',
                customizableDeals,
                agencyId
            );

            const locale = req.headers['accept-language']?.slice(0, 2) || 'en';
            response = await PricingInterceptor.interceptPricing(response, locale);

            return res.status(response.success ? 200 : 400).json(response);
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