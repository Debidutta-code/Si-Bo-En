import { CustomRequest, errorResponse } from "../../utils";
import { Response } from "express";
import { PropertyDetailsService } from "../service";
import { PropertyDetailsInterceptor } from "../../multi-language/interceptors/booking-engine/property-details.interceptor";

export class PropertyDetailsController {
    private propertyDetailsService: PropertyDetailsService;

    constructor() {
        this.propertyDetailsService = new PropertyDetailsService();
    }

    public async getPropertyDetailsController(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const propertyCode = req.params.propertyCode;

            // Read locale from Accept-Language header (same pattern as fetchRooms)
            const locale =
                (req.headers["accept-language"] as string | undefined)
                    ?.slice(0, 2)
                    .toLowerCase() || "en";

            let propertyDetails =
                await this.propertyDetailsService.getPropertyDetailsByCode(
                    propertyCode
                );

            // Apply translations if locale is not English
            propertyDetails = await PropertyDetailsInterceptor.intercept(
                propertyDetails,
                locale
            );

            const status = propertyDetails.success ? 200 : 400;
            return res.status(status).json(propertyDetails);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse("Internal server error", error?.message));
            }
            return res.status(500).json(errorResponse("Internal server error"));
        }
    }
}