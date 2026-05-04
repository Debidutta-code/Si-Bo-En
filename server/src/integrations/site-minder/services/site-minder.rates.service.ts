import { getCurrencyConverter, getPropertyBaseCurrency } from '../../../currency-maping/utils';
import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';
import { SiteMinderDao } from '../dao/site-minder.dao';
import { SiteMinderRateAmountNotifRQ, SiteMinderProcessResult } from '../types/site-minder.types';

export class SiteMinderRatesService {

    public static async processRatesUpdate(
        payload: SiteMinderRateAmountNotifRQ
    ): Promise<SiteMinderProcessResult> {
        const { hotelCode, rateAmountMessages } = payload;

        try {
            // 1. Validate property exists + get propertyId for currency lookup
            const property = await SiteMinderDao.getProperty(hotelCode);
            if (!property) {
                return {
                    success: false,
                    errors: [{ type: 3, code: 392, text: `Property ${hotelCode} not found` }],
                };
            }

            const { propertyId } = property;

            for (const message of rateAmountMessages) {
                const { statusApplicationControl, rates } = message;
                const { start, end, invTypeCode: roomTypeCode, ratePlanCode } = statusApplicationControl;

                if (!ratePlanCode) continue;

                // 2. Validate rate plan and room type exist
                const ratePlanName = await SiteMinderDao.getRatePlanName(ratePlanCode);
                if (!ratePlanName) {
                    return {
                        success: false,
                        errors: [{ type: 12, code: 325, text: `Rate plan ${ratePlanCode} not found` }],
                    };
                }

                const roomTypeName = await SiteMinderDao.getRoomTypeName(roomTypeCode, hotelCode);
                if (!roomTypeName) {
                    return {
                        success: false,
                        errors: [{ type: 12, code: 321, text: `Room type ${roomTypeCode} not found for property ${hotelCode}` }],
                    };
                }

                // 3. Detect incoming currency — if absent treat as base currency (no conversion)
                const incomingCurrency = rates.baseByGuestAmts.find(b => b.currencyCode)?.currencyCode as CurrencyCode | undefined;

                // 4. Single Redis + DB lookup — multiplier reused for all amounts below
                const fromCurrency = incomingCurrency ?? await getPropertyBaseCurrency(propertyId);
                const { convert, baseCurrency } = await getCurrencyConverter(propertyId, fromCurrency);

                // 5. OBP — each element is a separate occupancy level (1, 2, 3...)
                // NumberOfGuests should always be present from SiteMinder, i+1 is just a safety fallback
                const finalBaseAmounts = rates.baseByGuestAmts.map((b, i) => ({
                    numberOfGuests: b.numberOfGuests ?? i + 1,
                    amountBeforeTax: convert(b.amountAfterTax),
                }));

                // 6. Extra child only in OBP (no extra adult)
                const finalAdditionalAmounts = rates.additionalGuestAmounts?.map(a => ({
                    ageQualifyingCode: a.ageQualifyingCode,
                    amount: convert(a.amount),
                })) ?? [];

                // 7. Expand date range day by day and upsert charge per date
                const startDate = new Date(start);
                const endDate = new Date(end);
                const currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    await SiteMinderDao.upsertCharge({
                        propertyCode: hotelCode,
                        roomTypeCode,
                        ratePlanCode,
                        ratePlanName,
                        roomTypeName,
                        date: new Date(currentDate),
                        currencyCode: baseCurrency,
                        baseByGuestAmounts: finalBaseAmounts,
                        additionalGuestAmounts: finalAdditionalAmounts,
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                errors: [{ type: 3, text: error?.message ?? 'Failed to process rate update' }],
            };
        }
    }
}