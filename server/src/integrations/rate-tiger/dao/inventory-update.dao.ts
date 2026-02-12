// dao/inventory-update.dao.ts

import { prisma } from '../../../config';
import { InventoryUpsertParams } from '../types/inventory-update.types';

export class InventoryUpdateDao {

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

  public static async upsertInventoryAndRestrictions(
    params: InventoryUpsertParams
  ): Promise<void> {
    const {
      propertyCode,
      roomTypeCode,
      ratePlanCode,
      date,
      bookingLimit,
      isSaleStopped,
      isClosedToArrival,
      isClosedToDeparture,
      minAdvanceBookingDays,
      maxAdvanceBookingDays
    } = params;

    // 1. Upsert Inventory (availability count) — at roomType level
    if (bookingLimit !== undefined) {
      const existingInventory = await prisma.inventory.findFirst({
        where: { propertyCode, roomTypeCode, date },
        select: { id: true }
      });

      if (existingInventory) {
        await prisma.inventory.update({
          where: { id: existingInventory.id },
          data: { availability: bookingLimit }
        });
      } else {
        await prisma.inventory.create({
          data: {
            propertyCode,
            roomTypeCode,
            date,
            availability: bookingLimit,
            ratePlans: [ratePlanCode]
          }
        });
      }
    }

    // 2. Upsert Charge restrictions — at roomType + ratePlan level
    const hasRestrictions =
      isSaleStopped !== undefined ||
      isClosedToArrival !== undefined ||
      isClosedToDeparture !== undefined ||
      minAdvanceBookingDays !== undefined ||
      maxAdvanceBookingDays !== undefined;

    if (hasRestrictions) {
      const existingCharge = await prisma.charge.findFirst({
        where: { propertyCode, roomTypeCode, ratePlanCode, date },
        select: { id: true }
      });

      const restrictionData = {
        ...(isSaleStopped !== undefined && { isSaleStopped }),
        ...(isClosedToArrival !== undefined && { isClosedToArrival }),
        ...(isClosedToDeparture !== undefined && { isClosedToDeparture }),
        ...(minAdvanceBookingDays !== undefined && { minAdvanceBookingDays }),
        ...(maxAdvanceBookingDays !== undefined && { maxAdvanceBookingDays })
      };

      if (existingCharge) {
        // Delta update — only update what was sent
        await prisma.charge.update({
          where: { id: existingCharge.id },
          data: restrictionData
        });
      } else {
        // Create new charge with just restriction data
        // Price fields will be filled when price update comes in
        await prisma.charge.create({
          data: {
            propertyCode,
            roomTypeCode,
            ratePlanCode,
            ratePlanName: ratePlanCode,
            roomTypeName: roomTypeCode,
            date,
            ...restrictionData
          }
        });
      }
    }

    // 3. Upsert RatePlanRule for MinLOS/MaxLOS
    if (params.minLos !== undefined || params.maxLos !== undefined) {
      const existingRule = await prisma.ratePlanRule.findFirst({
        where: {
          ratePlan: {
            ratePlanCode,
            property: { propertyCode }
          }
        },
        select: { id: true }
      });

      if (existingRule) {
        await prisma.ratePlanRule.update({
          where: { id: existingRule.id },
          data: {
            ...(params.minLos !== undefined && { minLos: params.minLos }),
            ...(params.maxLos !== undefined && { maxLos: params.maxLos })
          }
        });
      }
      // If no rule exists we don't create one —
      // RatePlanRule requires a ratePlanId which needs a proper lookup
      // RT only sends updates so rule should already exist
    }
  }
}