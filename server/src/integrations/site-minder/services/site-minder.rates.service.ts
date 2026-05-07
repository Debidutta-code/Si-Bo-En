import { getCurrencyConverter, getPropertyBaseCurrency } from '../../../currency-maping/utils';
import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';
import { SiteMinderDao } from '../dao/site-minder.dao';
import { SiteMinderRateAmountNotifRQ, SiteMinderProcessResult } from '../types/site-minder.types';

// ── Reverse tax utility ───────────────────────────────────────────────────────
function reverseTax(
    amountAfterTax: number,
    rules: Array<{ priority: number; type: string; value: number }>,
    options: { skipFixed?: boolean } = {}   // 👈 add this
): number {
    if (rules.length === 0) return amountAfterTax;

    const grouped = new Map<number, Array<{ type: string; value: number }>>();

    for (const rule of rules) {
        if (!grouped.has(rule.priority)) grouped.set(rule.priority, []);
        grouped.get(rule.priority)!.push(rule);
    }

    const priorities = [...grouped.keys()].sort((a, b) => b - a);

    let amount = amountAfterTax;

    for (const priority of priorities) {
        const group = grouped.get(priority)!;

        let percentageSum = 0;
        let fixedSum = 0;

        for (const rule of group) {
            if (rule.type === 'percentage') {
                percentageSum += rule.value / 100;
            } else if (rule.type === 'fixed' && !options.skipFixed) {  // 👈 guard here
                fixedSum += rule.value;
            }
        }

        amount = (amount - fixedSum) / (1 + percentageSum);
    }

    return amount;
}

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

                // ── Tax rules for this rate plan (fetched once, reused for all amounts) ──
                const taxRules = await SiteMinderDao.getActiveTaxRulesForRatePlan(
                    ratePlanCode,
                    hotelCode
                );

                // ── Adults — one entry per occupancy level (OBP) ──────────────
                const finalBaseAmounts = rates.baseByGuestAmts.map((b, i) => ({
                    numberOfGuests: b.numberOfGuests ?? i + 1,
                    ageQualifyingCode: '10' as const,
                    amountBeforeTax: Number(reverseTax(convert(b.amountAfterTax), taxRules).toFixed(2))
                }));


                const childBaseAmount = rates.additionalGuestAmounts?.find(
                    a => String(a.ageQualifyingCode) === '8'
                )?.amount ?? 0;

                const convertedChildAmount = reverseTax(convert(childBaseAmount), taxRules, { skipFixed: true });
                const maxChildren = await SiteMinderDao.getRoomMaxChildren(roomTypeCode, hotelCode);

                const childBaseAmounts = (convertedChildAmount > 0 && maxChildren > 0)
                    ? Array.from({ length: maxChildren }, (_, i) => ({
                        numberOfGuests: i + 1,
                        ageQualifyingCode: '8' as const,
                        amountBeforeTax: convertedChildAmount * (i + 1),
                    }))
                    : [];

                // Flat single entry for additional
                const childAdditionalAmounts = (convertedChildAmount > 0 && maxChildren > 0)
                    ? [{ ageQualifyingCode: '8' as const, amount: convertedChildAmount }]
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
                        baseByGuestAmounts: [...finalBaseAmounts, ...childBaseAmounts],
                        additionalGuestAmounts: childAdditionalAmounts,
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