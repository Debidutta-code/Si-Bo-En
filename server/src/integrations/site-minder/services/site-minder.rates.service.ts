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

                // ── Currency conversion ───────────────────────────────────────
                const incomingCurrency = rates.baseByGuestAmts.find(b => b.currencyCode)?.currencyCode as CurrencyCode | undefined;
                const fromCurrency = incomingCurrency ?? await getPropertyBaseCurrency(propertyId);
                const { convert, baseCurrency } = await getCurrencyConverter(propertyId, fromCurrency);

                // ── Adults — one entry per occupancy level (OBP) ──────────────
                const finalBaseAmounts = rates.baseByGuestAmts.map((b, i) => ({
                    numberOfGuests: b.numberOfGuests ?? i + 1,
                    amountBeforeTax: convert(b.amountAfterTax),
                }));

                // ── Children — multiply base child amount by child position ────
                // SiteMinder sends ONE AdditionalGuestAmount for child (AgeQualifyingCode="8")
                // We expand it per child slot: child1=amount, child2=amount×2, etc.
                const childBaseAmount = rates.additionalGuestAmounts?.find(
                    a => a.ageQualifyingCode === '8'
                )?.amount ?? 0;

                const convertedChildAmount = convert(childBaseAmount);

                // Get max children = maxOccupancy - maxNumberOfAdults from DB
                const maxChildren = await SiteMinderDao.getRoomMaxChildren(roomTypeCode, hotelCode);

                // Build child additional amounts — only if child amount exists and room supports children
                const finalAdditionalAmounts = (convertedChildAmount > 0 && maxChildren > 0)
                    ? Array.from({ length: maxChildren }, (_, i) => ({
                        ageQualifyingCode: '8',
                        numberOfGuests: i + 1,
                        amount: convertedChildAmount * (i + 1), // child1=50, child2=100
                    }))
                    : [];

                // ── Upsert per day ────────────────────────────────────────────
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