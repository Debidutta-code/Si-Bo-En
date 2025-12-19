// dao/hotelPrice.dao.ts

import {prisma} from "../../config"
import type { ICharges } from '../types/charges.type';
import type { InventoryWithRate } from "../types/inventory.types"
import { localMidnight, formatDate } from "../utils/date"


export class HotelPricesRepository {
  public static async getInventoryWithRates(
    hotelCode: string,
    roomTypeCode: string,
    ratePlanCode: string,
    startDate: Date,
    endDate: Date
  ): Promise<InventoryWithRate[]> {
    try {
      // Normalize to local midnight
      const start = localMidnight(startDate);
      const end = localMidnight(endDate);

      // Generate stay dates: [start, end)
      const stayDates: string[] = [];
      const current = new Date(start);
      while (current < end) {
        stayDates.push(formatDate(current));
        current.setDate(current.getDate() + 1);
      }
      if (stayDates.length === 0) return [];
      const charges = await prisma.charge.findMany({
        where: {
          propertyCode: hotelCode,
          roomTypeCode: roomTypeCode,
          ratePlanCode,
          date: { in: stayDates },
        },
        select: {
          id: true,
          ratePlanName: true,
          roomTypeName: true,
          baseGuestAmounts: true,
          additionalGuestAmounts:true,
          propertyCode: true,
          roomTypeCode: true,
          ratePlanCode: true,
          currencyCode: true,
          date: true,

        },
      });

      if (charges.length === 0) return [];

      // Fetch inventory
      const inventory = await prisma.inventory.findFirst({
        where: {
          propertyCode: hotelCode,
          roomTypeCode,
          ratePlans: { has: ratePlanCode },
          date: { in: stayDates }
        },
        select: {
          propertyCode: true,
          roomTypeCode: true,
          availability: true,
        },
      });

      if (!inventory) return [];

      // Map one entry per stay date
      return stayDates.map((date) => {
        const rate = charges.find((c:any) => c.date.toString().split("T")[0] === date) || null;

        return {
          inventory: {
            hotelCode: inventory.propertyCode || '',
            roomTypeCode: inventory.roomTypeCode,
            availability: {
              date,
              count: typeof inventory.availability === 'number' ? inventory.availability : 0,
            },
          },
          rate: rate as unknown as ICharges | null,
          date,
        };
      });
    } catch (error) {
      console.error('DAO Error - getInventoryWithRates:', error);
      throw error;
    }
  }
}