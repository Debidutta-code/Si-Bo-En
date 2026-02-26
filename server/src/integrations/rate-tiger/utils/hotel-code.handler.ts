import { Response } from 'express';
import { RateTigerRequest } from '../../../utils';
import { RTIntegrationDao } from '../dao/rt-integration.dao';

function extractRtHotelCode(body: any): string | null {
    return (
        body?.otaHotelAvailRQ?.hotelCode ??
        body?.otaHotelAvailGetRQ?.hotelCode ??
        body?.otaHotelRatePlanRQ?.hotelCode ??
        body?.rateAmountMessages?.hotelCode ??
        body?.otaHotelAvailNotifRQ?.hotelCode ??
        null
    );
}

function replacePropertyCodeInResponse(
    payload: any,
    propertyCode: string,
    rtHotelCode: string
): any {
    if (typeof payload === 'string') {
        return payload === propertyCode ? rtHotelCode : payload;
    }

    if (Array.isArray(payload)) {
        return payload.map(item =>
            replacePropertyCodeInResponse(item, propertyCode, rtHotelCode)
        );
    }

    if (payload !== null && typeof payload === 'object') {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(payload)) {
            result[key] = replacePropertyCodeInResponse(
                value,
                propertyCode,
                rtHotelCode
            );
        }
        return result;
    }

    return payload;
}

type ARIHandler = (req: RateTigerRequest, res: Response) => Promise<any>;

export function withHotelCodeConversion(handler: ARIHandler): ARIHandler {
    return async (req: RateTigerRequest, res: Response) => {
        console.log(
            'request body from rate tiger:',
            JSON.stringify(req.body, null, 2)
        ); const rtHotelCode = extractRtHotelCode(req.body);

        if (!rtHotelCode) {
            return res.status(400).json({
                success: false,
                message: 'Missing hotelCode in request body',
            });
        }

        const propertyInfo =
            await RTIntegrationDao.getPropertyCodeByRTCode(rtHotelCode);

        if (!propertyInfo) {
            return res.status(404).json({
                success: false,
                message: `No property found for RateTiger hotel code: ${rtHotelCode}`,
            });
        }

        const { propertyCode } = propertyInfo;

        req.rateTiger = {
            ...(req.rateTiger ?? { partnerId: '', apiKey: '' }),
            propertyCode,
            rtHotelCode,
        };

        const originalJson = res.json.bind(res);
        res.json = (body: any) => {
            const transformed = replacePropertyCodeInResponse(
                body,
                propertyCode,
                rtHotelCode
            );
            return originalJson(transformed);
        };

        return handler(req, res);
    };
}
