// services/price-update.service.ts

import { IApiResponse, errorResponse, successResponse } from '../../../utils';
import { PriceUpdateDao } from '../dao/price-update.dao';
import { RateTigerPriceUpdateRQ, RateTigerPriceUpdateRS } from '../types/price-update.types';
import { CurrencyCode } from '@prisma/client';

export class PriceUpdateService {

  public static async processPriceUpdate(
    body: RateTigerPriceUpdateRQ
  ): Promise<IApiResponse<RateTigerPriceUpdateRS>> {
    const { rateAmountMessages } = body;
    const { hotelCode, requestId, rateAmountMessage } = rateAmountMessages;

    try {
      const propertyExists = await PriceUpdateDao.propertyExists(hotelCode);
      if (!propertyExists) {
        return errorResponse(`Property with code ${hotelCode} not found`);
      }

      for (const message of rateAmountMessage) {
        const { statusApplicationControl, rates } = message;
        const {
          start,
          end,
          invTypeCode: roomTypeCode,
          ratePlanCode
        } = statusApplicationControl;

        // Extract baseByGuestAmts and additionalGuestAmts from rates array
        // The spec sends them as separate objects inside the rates array
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
        const currencyCode = (baseByGuestAmts[0]?.currencyCode as CurrencyCode) ?? CurrencyCode.USD;

        // Parse base guest amounts (adult prices, numberOfGuests 1–6)
        const parsedBaseAmounts = baseByGuestAmts
          .filter(bg => bg.ageQualifyingCode === '10' && bg.numberOfGuests)
          .map(bg => ({
            numberOfGuests: parseInt(bg.numberOfGuests),
            amountBeforeTax: parseFloat(bg.amountBeforeTax ?? bg.amountAfterTax)
          }));

        // Parse additional guest amounts (extra adult + extra child)
        const parsedAdditionalAmounts = additionalGuestAmts.map(ag => ({
          ageQualifyingCode: ag.ageQualifyingCode,
          amount: parseFloat(ag.amount)
        }));

        // Expand date range day by day and upsert each date
        const startDate = new Date(start);
        const endDate = new Date(end);
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          await PriceUpdateDao.upsertCharge({
            propertyCode: hotelCode,
            roomTypeCode,
            ratePlanCode,
            date: new Date(currentDate),
            currencyCode,
            baseByGuestAmounts: parsedBaseAmounts,
            additionalGuestAmounts: parsedAdditionalAmounts
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      const response: RateTigerPriceUpdateRS = {
        otaRateAmountNotifRS: {
          hotelCode,
          requestId,
          success: 'true',
          timeStamp: new Date().toISOString()
        }
      };

      return successResponse('Price update processed successfully', response);
    } catch (error: any) {
      return errorResponse('Failed to process price update', error?.message);
    }
  }
  
}