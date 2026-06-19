// services/price-update.service.ts

import { getCurrencyConverter, getPropertyBaseCurrency } from '../../../currency-maping/utils';
import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';
import { PriceUpdateDao } from '../dao/price-update.dao';
import {
    RateTigerPriceUpdateRQ,
    RateTigerPriceUpdateRS,
} from '../types/price-update.types';
import { ServiceLogger, LogBuilder } from '../../../logs/services/service-log.service';

const logger = new ServiceLogger('RateTigerPriceUpdate');

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

export class PriceUpdateService {
    public static async processPriceUpdate(
        body: RateTigerPriceUpdateRQ,
        passedLog?: LogBuilder
    ): Promise<RateTigerPriceUpdateRS> {
        const { rateAmountMessages } = body;
        const { hotelCode, requestId, rateAmountMessage } = rateAmountMessages;

        const log = passedLog ?? logger.start('processPriceUpdate', requestId);
        if (!passedLog) {
            log.setIncoming(body);
        }

        try {
            // ── Repo: propertyExists ──────────────────────────────────────────
            const t0 = Date.now();
            let property: { id: string } | null = null;
            try {
                const exists = await PriceUpdateDao.propertyExists(hotelCode);
                property = exists ? await PriceUpdateDao.getPropertyMeta(hotelCode) : null;
                log.addRepoCall({
                    repoName: 'PriceUpdateDao',
                    method: 'propertyExists',
                    input: { hotelCode },
                    response: { exists, property },
                    success: !!property,
                    durationMs: Date.now() - t0,
                });
            } catch (err: any) {
                log.addRepoCall({
                    repoName: 'PriceUpdateDao',
                    method: 'propertyExists',
                    input: { hotelCode },
                    success: false,
                    durationMs: Date.now() - t0,
                    error: { message: err?.message },
                });
                throw err;
            }

            if (!property) {
                log.pushMessage(`Property ${hotelCode} not found`, 'error');
                const response: RateTigerPriceUpdateRS = {
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
                log.setServiceResponse({ success: false, message: `Property ${hotelCode} not found` });
                if (!passedLog) log.save();
                return response;
            }

            log.pushMessage(`Property found: ${hotelCode}`, 'info');

            // ── Check integration config: does RT send amountAfterTax or amountBeforeTax? ──
            const t_cfg = Date.now();
            const integrationConfig = await PriceUpdateDao.getRateTigerIntegrationConfig(hotelCode);
            log.addRepoCall({
                repoName: 'PriceUpdateDao',
                method: 'getRateTigerIntegrationConfig',
                input: { hotelCode },
                response: integrationConfig ||{},
                success: true,
                durationMs: Date.now() - t_cfg,
            });

             const amountsIncludeTax = integrationConfig?.amountAfterTax ?? false;
            log.pushMessage(
                `Integration amountsIncludeTax=${amountsIncludeTax}`,
                'info'
            );

            for (const message of rateAmountMessage) {
                const { statusApplicationControl, rates } = message;
                const {
                    start,
                    end,
                    invTypeCode: roomTypeCode,
                    ratePlanCode,
                } = statusApplicationControl;

                let baseByGuestAmts: any[] = [];
                let additionalGuestAmts: any[] = [];
                for (const rateItem of rates) {
                    if ('baseByGuestAmts' in rateItem) baseByGuestAmts = rateItem.baseByGuestAmts;
                    if ('additionalGuestAmts' in rateItem) additionalGuestAmts = rateItem.additionalGuestAmts;
                }

                // ── Repo: getRatePlanName ─────────────────────────────────────
                let ratePlanName: string | undefined;
                const t1 = Date.now();
                try {
                    ratePlanName = await PriceUpdateDao.getRatePlanName(ratePlanCode);
                    log.addRepoCall({
                        repoName: 'PriceUpdateDao',
                        method: 'getRatePlanName',
                        input: { ratePlanCode },
                        response: { ratePlanName: ratePlanName ?? null },
                        success: !!ratePlanName,
                        durationMs: Date.now() - t1,
                    });
                } catch (err: any) {
                    log.addRepoCall({
                        repoName: 'PriceUpdateDao',
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
                    const response: RateTigerPriceUpdateRS = {
                        otaRateAmountNotifRS: {
                            hotelCode, requestId,
                            success: 'false',
                            timeStamp: new Date().toISOString(),
                            error: { type: 'ProcessingError', errorCode: '404', text: `Rate plan ${ratePlanCode} not found` },
                        },
                    };
                    log.setServiceResponse({ success: false, message: `Rate plan ${ratePlanCode} not found` });
                    if (!passedLog) log.save();
                    return response;
                }

                // ── Repo: getRoomTypeName ─────────────────────────────────────
                let roomTypeName: string | undefined;
                const t2 = Date.now();
                try {
                    roomTypeName = await PriceUpdateDao.getRoomTypeName(roomTypeCode, hotelCode);
                    log.addRepoCall({
                        repoName: 'PriceUpdateDao',
                        method: 'getRoomTypeName',
                        input: { roomTypeCode, hotelCode },
                        response: { roomTypeName: roomTypeName ?? null },
                        success: !!roomTypeName,
                        durationMs: Date.now() - t2,
                    });
                } catch (err: any) {
                    log.addRepoCall({
                        repoName: 'PriceUpdateDao',
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
                    const response: RateTigerPriceUpdateRS = {
                        otaRateAmountNotifRS: {
                            hotelCode, requestId,
                            success: 'false',
                            timeStamp: new Date().toISOString(),
                            error: { type: 'ProcessingError', errorCode: '404', text: `Room type ${roomTypeCode} not found` },
                        },
                    };
                    log.setServiceResponse({ success: false, message: `Room type ${roomTypeCode} not found` });
                    if (!passedLog) log.save();
                    return response;
                }

                // ── Tax rules + currency conversion ───────────────────────────
                let taxRules: Array<{ priority: number; type: string; value: number }> = [];
                if (amountsIncludeTax) {
                    const t3 = Date.now();
                    taxRules = await PriceUpdateDao.getActiveTaxRulesForRatePlan(ratePlanCode, hotelCode);
                    log.addRepoCall({
                        repoName: 'PriceUpdateDao',
                        method: 'getActiveTaxRulesForRatePlan',
                        input: { ratePlanCode, hotelCode },
                        response: { count: taxRules.length, taxRules },
                        success: true,
                        durationMs: Date.now() - t3,
                    });
                }

                const incomingCurrency = baseByGuestAmts.find((b: any) => b.currencyCode)?.currencyCode as CurrencyCode | undefined;
                const fromCurrency = incomingCurrency ?? await getPropertyBaseCurrency(property.id);
                const { convert, baseCurrency } = await getCurrencyConverter(property.id, fromCurrency);

                // ── Resolve amountBeforeTax for adults ───────────────────────
                const adultAmounts = baseByGuestAmts
                    .filter((bg: any) => bg.ageQualifyingCode === '10' && bg.numberOfGuests)
                    .map((bg: any) => {
                        const rawAmount = parseFloat(bg.amountAfterTax ?? bg.amountBeforeTax ?? '0');
                        const hasAmountAfterTax = bg.amountAfterTax !== undefined;
                        const hasAmountBeforeTax = bg.amountBeforeTax !== undefined;
                        
                        let shouldBacktrack = false;
                        if (hasAmountBeforeTax) {
                            shouldBacktrack = false;
                        } else if (hasAmountAfterTax) {
                            if (integrationConfig?.amountBeforeTax) {
                                shouldBacktrack = false;
                            } else if (integrationConfig?.amountAfterTax) {
                                shouldBacktrack = true;
                            } else {
                                shouldBacktrack = amountsIncludeTax;
                            }
                        } else {
                            shouldBacktrack = false;
                        }

                        const amountBeforeTax = shouldBacktrack
                            ? Number(reverseTax(convert(rawAmount), taxRules).toFixed(2))
                            : Number(convert(rawAmount).toFixed(2));

                        return {
                            numberOfGuests: parseInt(bg.numberOfGuests),
                            ageQualifyingCode: bg.ageQualifyingCode,
                            amountBeforeTax,
                        };
                    });

                // ── Resolve amountBeforeTax for children ─────────────────────
                const childAmounts = baseByGuestAmts
                    .filter((bg: any) => bg.ageQualifyingCode === '8')
                    .map((bg: any, index: number) => {
                        const rawAmount = parseFloat(bg.amountAfterTax ?? bg.amountBeforeTax ?? '0');
                        const hasAmountAfterTax = bg.amountAfterTax !== undefined;
                        const hasAmountBeforeTax = bg.amountBeforeTax !== undefined;
                        
                        let shouldBacktrack = false;
                        if (hasAmountBeforeTax) {
                            shouldBacktrack = false;
                        } else if (hasAmountAfterTax) {
                            if (integrationConfig?.amountBeforeTax) {
                                shouldBacktrack = false;
                            } else if (integrationConfig?.amountAfterTax) {
                                shouldBacktrack = true;
                            } else {
                                shouldBacktrack = amountsIncludeTax;
                            }
                        } else {
                            shouldBacktrack = false;
                        }

                        const amountBeforeTax = shouldBacktrack
                            ? Number(reverseTax(convert(rawAmount), taxRules, { skipFixed: true }).toFixed(2))
                            : Number(convert(rawAmount).toFixed(2));

                        return {
                            numberOfGuests: bg.numberOfGuests ? parseInt(bg.numberOfGuests) : index + 1,
                            ageQualifyingCode: bg.ageQualifyingCode,
                            amountBeforeTax,
                        };
                    });

                const parsedBaseAmounts = [...adultAmounts, ...childAmounts];

                const parsedAdditionalAmounts = additionalGuestAmts.map((ag: any) => {
                    const rawAmount = parseFloat(ag.amount ?? '0');
                    let shouldBacktrack = false;
                    if (integrationConfig?.amountBeforeTax) {
                        shouldBacktrack = false;
                    } else if (integrationConfig?.amountAfterTax) {
                        shouldBacktrack = true;
                    } else {
                        shouldBacktrack = amountsIncludeTax;
                    }

                    const amount = shouldBacktrack
                        ? Number(reverseTax(convert(rawAmount), taxRules, { skipFixed: true }).toFixed(2))
                        : Number(convert(rawAmount).toFixed(2));

                    return {
                        ageQualifyingCode: ag.ageQualifyingCode,
                        amount,
                    };
                });

                // ── Upsert charges day by day ─────────────────────────────────
                const startDate = new Date(start);
                const endDate = new Date(end);
                const currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    await PriceUpdateDao.upsertCharge({
                        propertyCode: hotelCode,
                        roomTypeCode,
                        ratePlanCode,
                        ratePlanName,
                        roomTypeName,
                        date: new Date(currentDate),
                        currencyCode: baseCurrency as CurrencyCode,
                        baseByGuestAmounts: parsedBaseAmounts,
                        additionalGuestAmounts: parsedAdditionalAmounts,
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                log.pushMessage(
                    `Upserted prices for ${ratePlanCode}/${roomTypeCode} ${start} → ${end}`,
                    'info'
                );
            }

            const response: RateTigerPriceUpdateRS = {
                otaRateAmountNotifRS: {
                    hotelCode,
                    requestId,
                    success: 'true',
                    timeStamp: new Date().toISOString(),
                },
            };

            log.setServiceResponse({ success: true, message: 'Price update processed successfully' });
            if (!passedLog) log.save();
            return response;

        } catch (error: any) {
            log.setError(error);
            if (!passedLog) log.save();

            return {
                otaRateAmountNotifRS: {
                    hotelCode,
                    requestId,
                    success: 'false',
                    timeStamp: new Date().toISOString(),
                    error: {
                        type: 'ProcessingError',
                        errorCode: '500',
                        text: error?.message || 'Failed to process price update',
                    },
                },
            };
        }
    }
}