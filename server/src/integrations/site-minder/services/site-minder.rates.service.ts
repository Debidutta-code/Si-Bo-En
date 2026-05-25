import { getCurrencyConverter, getPropertyBaseCurrency } from '../../../currency-maping/utils';
import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';
import { SiteMinderDao } from '../dao/site-minder.dao';
import { SiteMinderRateAmountNotifRQ, SiteMinderProcessResult } from '../types/site-minder.types';
import { ServiceLogger, LogBuilder } from '../../../logs/services/service-log.service';

const logger = new ServiceLogger('SiteMinderARI');

function reverseTax(
    amountAfterTax: number,
    rules: Array<{ priority: number; type: string; value: number }>,
    options: { skipFixed?: boolean } = {}
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
            if (rule.type === 'percentage') percentageSum += rule.value / 100;
            else if (rule.type === 'fixed' && !options.skipFixed) fixedSum += rule.value;
        }
        amount = (amount - fixedSum) / (1 + percentageSum);
    }
    return amount;
}

export class SiteMinderRatesService {

    public static async processRatesUpdate(
        payload: SiteMinderRateAmountNotifRQ,
        rawXml: string,
        log: LogBuilder
    ): Promise<SiteMinderProcessResult> {
        const { hotelCode, rateAmountMessages } = payload;

        try {
            // ── Repo: getProperty ─────────────────────────────────────────────
            let property: any;
            const t0 = Date.now();
            try {
                property = await SiteMinderDao.getProperty(hotelCode);
                log.addRepoCall({
                    repoName: 'SiteMinderDao',
                    method: 'getProperty',
                    input: { hotelCode },
                    response: property ?? null,
                    success: !!property,
                    durationMs: Date.now() - t0,
                });
            } catch (err: any) {
                log.addRepoCall({
                    repoName: 'SiteMinderDao',
                    method: 'getProperty',
                    input: { hotelCode },
                    success: false,
                    durationMs: Date.now() - t0,
                    error: { message: err?.message },
                });
                throw err;
            }

            if (!property) {
                log.pushMessage(`Property ${hotelCode} not found`, 'error');
                return {
                    success: false,
                    errors: [{ type: 3, code: 392, text: `Property ${hotelCode} not found` }],
                };
            }

            log.pushMessage(`Property found: ${property.propertyCode}`, 'info');
            const { propertyId, propertyCode } = property;

            for (const message of rateAmountMessages) {
                const { statusApplicationControl, rates } = message;
                const { start, end, invTypeCode: roomTypeCode, ratePlanCode } = statusApplicationControl;

                if (!ratePlanCode) continue;

                // ── Repo: getRatePlanName ─────────────────────────────────────
                let ratePlanName: any;
                const t1 = Date.now();
                try {
                    ratePlanName = await SiteMinderDao.getRatePlanName(ratePlanCode);
                    log.addRepoCall({
                        repoName: 'SiteMinderDao',
                        method: 'getRatePlanName',
                        input: { ratePlanCode },
                        response: { ratePlanName: ratePlanName ?? null },
                        success: !!ratePlanName,
                        durationMs: Date.now() - t1,
                    });
                } catch (err: any) {
                    log.addRepoCall({
                        repoName: 'SiteMinderDao',
                        method: 'getRatePlanName',
                        input: { ratePlanCode },
                        success: false,
                        durationMs: Date.now() - t1,
                        error: { message: err?.message },
                    });
                    throw err;
                }

                if (!ratePlanName) {
                    log.pushMessage(`Rate plan ${ratePlanCode} not found`, 'error');
                    return {
                        success: false,
                        errors: [{ type: 12, code: 325, text: `Rate plan ${ratePlanCode} not found` }],
                    };
                }

                // ── Repo: getRoomTypeName ─────────────────────────────────────
                let roomTypeName: any;
                const t2 = Date.now();
                try {
                    roomTypeName = await SiteMinderDao.getRoomTypeName(roomTypeCode, propertyCode);
                    log.addRepoCall({
                        repoName: 'SiteMinderDao',
                        method: 'getRoomTypeName',
                        input: { roomTypeCode, hotelCode },
                        response: { roomTypeName: roomTypeName ?? null },
                        success: !!roomTypeName,
                        durationMs: Date.now() - t2,
                    });
                } catch (err: any) {
                    log.addRepoCall({
                        repoName: 'SiteMinderDao',
                        method: 'getRoomTypeName',
                        input: { roomTypeCode, hotelCode },
                        success: false,
                        durationMs: Date.now() - t2,
                        error: { message: err?.message },
                    });
                    throw err;
                }

                if (!roomTypeName) {
                    log.pushMessage(`Room type ${roomTypeCode} not found`, 'error');
                    return {
                        success: false,
                        errors: [{ type: 12, code: 321, text: `Room type ${roomTypeCode} not found for property ${hotelCode}` }],
                    };
                }

                const t3 = Date.now();
                const taxRules = await SiteMinderDao.getActiveTaxRulesForRatePlan(ratePlanCode, propertyCode);
                log.addRepoCall({
                    repoName: 'SiteMinderDao',
                    method: 'getActiveTaxRulesForRatePlan',
                    input: { ratePlanCode, hotelCode },
                    response: { count: taxRules?.length ?? 0, taxRules },
                    success: true,
                    durationMs: Date.now() - t3,
                });

                const incomingCurrency = rates.baseByGuestAmts.find(b => b.currencyCode)?.currencyCode as CurrencyCode | undefined;
                const fromCurrency = incomingCurrency ?? await getPropertyBaseCurrency(propertyId);
                const { convert, baseCurrency } = await getCurrencyConverter(propertyId, fromCurrency);

                const finalBaseAmounts = rates.baseByGuestAmts.map((b, i) => ({
                    numberOfGuests: b.numberOfGuests ?? i + 1,
                    ageQualifyingCode: '10' as const,
                    amountBeforeTax: Number(reverseTax(convert(b.amountAfterTax), taxRules).toFixed(2)),
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

                const childAdditionalAmounts = (convertedChildAmount > 0 && maxChildren > 0)
                    ? [{ ageQualifyingCode: '8' as const, amount: convertedChildAmount }]
                    : [];

                log.pushMessage(
                    `Upserting rates: roomType=${roomTypeCode} ratePlan=${ratePlanCode} ${start} → ${end}`,
                    'info',
                    { roomTypeCode, ratePlanCode, start, end, baseCurrency, finalBaseAmounts, childBaseAmounts }
                );

                // ── Repo: upsertCharge (per day) ──────────────────────────────
                const startDate = new Date(start);
                const endDate = new Date(end);
                const currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    const t4 = Date.now();
                    const upsertInput = {
                        propertyCode, roomTypeCode, ratePlanCode, ratePlanName,
                        roomTypeName, date: new Date(currentDate), currencyCode: baseCurrency,
                        baseByGuestAmounts: [...finalBaseAmounts, ...childBaseAmounts],
                        additionalGuestAmounts: childAdditionalAmounts,
                    };
                    try {
                        await SiteMinderDao.upsertCharge(upsertInput);
                        log.addRepoCall({
                            repoName: 'SiteMinderDao',
                            method: 'upsertCharge',
                            input: upsertInput,
                            response: { upserted: true },
                            success: true,
                            durationMs: Date.now() - t4,
                        });
                    } catch (err: any) {
                        log.addRepoCall({
                            repoName: 'SiteMinderDao',
                            method: 'upsertCharge',
                            input: upsertInput,
                            success: false,
                            durationMs: Date.now() - t4,
                            error: { message: err?.message },
                        });
                        throw err;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }

            return { success: true };

        } catch (error: any) {
            log.setError(error);
            return {
                success: false,
                errors: [{ type: 3, text: error?.message ?? 'Failed to process rate update' }],
            };
        }
    }
}