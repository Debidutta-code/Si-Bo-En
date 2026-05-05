import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';
import { PriceUpdateDao } from '../dao/price-update.dao';
import {
    RateTigerPriceUpdateRQ,
    RateTigerPriceUpdateRS,
} from '../types/price-update.types';

export class PriceUpdateService {
    public static async processPriceUpdate(
        body: RateTigerPriceUpdateRQ
    ): Promise<RateTigerPriceUpdateRS> {
        const { rateAmountMessages } = body;
        const { hotelCode, requestId, rateAmountMessage } = rateAmountMessages;

        try {
            const propertyExists =
                await PriceUpdateDao.propertyExists(hotelCode);
            if (!propertyExists) {
                return {
                    otaRateAmountNotifRS: {
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

            for (const message of rateAmountMessage) {
                const { statusApplicationControl, rates } = message;
                const {
                    start,
                    end,
                    invTypeCode: roomTypeCode,
                    ratePlanCode,
                } = statusApplicationControl;

                // Extract baseByGuestAmts and additionalGuestAmts from rates array
                let baseByGuestAmts: any[] = [];
                let additionalGuestAmts: any[] = [];

                for (const rateItem of rates) {
                    if ('baseByGuestAmts' in rateItem) {
                        baseByGuestAmts = rateItem.baseByGuestAmts;
                    }
                    if ('additionalGuestAmts' in rateItem) {
                        additionalGuestAmts = rateItem.additionalGuestAmts;
                    }
                }

                // Get currency from first base amount
                const currencyCode =
                    (baseByGuestAmts[0]?.currencyCode as CurrencyCode) ??
                    'AED';

                // Parse adult amounts (ageQualifyingCode '10' with numberOfGuests)
                const adultAmounts = baseByGuestAmts
                    .filter(
                        bg =>
                            bg.ageQualifyingCode === '10' && bg.numberOfGuests
                    )
                    .map(bg => ({
                        numberOfGuests: parseInt(bg.numberOfGuests),
                        ageQualifyingCode: bg.ageQualifyingCode,
                        amountBeforeTax: parseFloat(
                            bg.amountBeforeTax ?? bg.amountAfterTax
                        ),
                    }));

                // Parse child amounts (ageQualifyingCode '8')
                // If numberOfGuests is present use it, otherwise auto-assign sequentially (1, 2, 3...)
                const childAmounts = baseByGuestAmts
                    .filter(bg => bg.ageQualifyingCode === '8')
                    .map((bg, index) => ({
                        numberOfGuests: bg.numberOfGuests
                            ? parseInt(bg.numberOfGuests)
                            : index + 1,
                        ageQualifyingCode: bg.ageQualifyingCode,
                        amountBeforeTax: parseFloat(
                            bg.amountBeforeTax ?? bg.amountAfterTax
                        ),
                    }));

                const parsedBaseAmounts = [...adultAmounts, ...childAmounts];

                const parsedAdditionalAmounts = additionalGuestAmts.map(
                    ag => ({
                        ageQualifyingCode: ag.ageQualifyingCode,
                        amount: parseFloat(ag.amount),
                    })
                );

                const startDate = new Date(start);
                const endDate = new Date(end);
                const currentDate = new Date(startDate);
                const ratePlanName = await PriceUpdateDao.getRatePlanName(ratePlanCode);
                if(!ratePlanName){
                    return {
                        otaRateAmountNotifRS: {
                            hotelCode,
                            requestId,
                            success: 'false',
                            timeStamp: new Date().toISOString(),
                            error: {
                                type: 'ProcessingError',
                                errorCode: '404',
                                text: `Rate plan with code ${ratePlanCode} not found`,
                            },
                        },
                    };
                }
                const roomTypeName = await PriceUpdateDao.getRoomTypeName(roomTypeCode, hotelCode);
                if(!roomTypeName){
                    return {
                        otaRateAmountNotifRS: {
                            hotelCode,
                            requestId,
                            success: 'false',
                            timeStamp: new Date().toISOString(),
                            error: {
                                type: 'ProcessingError',
                                errorCode: '404',
                                text: `Room type with code ${roomTypeCode} not found`,
                            },
                        },
                    };
                }
                while (currentDate <= endDate) {
                    // await PriceUpdateDao.upsertCharge({
                    //     propertyCode: hotelCode,
                    //     roomTypeCode,
                    //     ratePlanCode,
                    //     ratePlanName,
                    //     roomTypeName,
                    //     date: new Date(currentDate),
                    //     currencyCode,
                    //     baseByGuestAmounts: parsedBaseAmounts,
                    //     additionalGuestAmounts: parsedAdditionalAmounts,
                    // });

                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }

            return {
                otaRateAmountNotifRS: {
                    hotelCode,
                    requestId,
                    success: 'true',
                    timeStamp: new Date().toISOString(),
                },
            };
        } catch (error: any) {
            return {
                otaRateAmountNotifRS: {
                    hotelCode,
                    requestId,
                    success: 'false',
                    timeStamp: new Date().toISOString(),
                    error: {
                        type: 'ProcessingError',
                        errorCode: '500',
                        text:
                            error?.message || 'Failed to process price update',
                    },
                },
            };
        }
    }
}