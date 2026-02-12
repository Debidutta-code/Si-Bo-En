// dao/price-pull.dao.ts

import { prisma } from '../../../config';
import { PricePullChargeResult } from '../types/price-pull.types';

export class PricePullDao {

  public static async getChargesForRatePlan(
    propertyCode: string,
    ratePlanCode: string,
    startDate: Date,
    endDate: Date
  ): Promise<PricePullChargeResult[]> {
    try {
      const charges = await prisma.charge.findMany({
        where: {
          propertyCode,
          ratePlanCode,
          date: {
            gte: startDate,
            lte: endDate
          },
          isAvailable: true
        },
        select: {
          ratePlanCode: true,
          roomTypeCode: true,
          currencyCode: true,
          date: true,
          baseGuestAmounts: {
            select: {
              numberOfGuests: true,
              amountBeforeTax: true
            },
            orderBy: { numberOfGuests: 'asc' }
          },
          additionalGuestAmounts: {
            select: {
              ageQualifyingCode: true,
              amount: true
            }
          }
        },
        orderBy: { date: 'asc' }
      });

      return charges.map(charge => ({
        ratePlanCode: charge.ratePlanCode,
        roomTypeCode: charge.roomTypeCode,
        currencyCode: charge.currencyCode,
        date: charge.date,
        baseByGuestAmounts: charge.baseGuestAmounts.map(bg => ({
          numberOfGuests: bg.numberOfGuests,
          amountBeforeTax: Number(bg.amountBeforeTax)
        })),
        additionalGuestAmounts: charge.additionalGuestAmounts.map(ag => ({
          ageQualifyingCode: ag.ageQualifyingCode,
          amount: Number(ag.amount)
        }))
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch charges for rate plan: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public static async propertyExists(propertyCode: string): Promise<boolean> {
    try {
      const property = await prisma.property.findUnique({
        where: { propertyCode },
        select: { id: true }
      });
      return !!property;
    } catch (error) {
      throw new Error('Failed to verify property existence');
    }
  }
}