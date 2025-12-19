import { prisma } from "../../config";

export class RoomBookingRepository {
  public static async getPropertyByCode(propertyCode: string) {
    return prisma.property.findUnique({
      where: { propertyCode },
      include: {
        propertyAddress: true,
        propertyAmenities: {
          include: { amenity: true }
        },
        propertyRooms: {
          where: { isDeleted: false, available: true },
          include: {
            roomAmenities: {
              include: { amenity: true }
            }
          }
        },
        ratePlans: {
          include: {
            depositPolicy: true,
            cancellationPolicy: true,
            guaranteePolicy: true
          }
        },
        bookingEngineConfig: true
      }
    });
  }

  /* ----------------------------
     Inventory (NO date range stored)
  ----------------------------- */
  public static async getInventoryByProperty(
    propertyCode: string,
    roomTypeCode: string,
    dates: string[]
  ) {
    return prisma.inventory.findMany({
      where: {
        propertyCode,
        roomTypeCode,
        date: { in: dates },
        availability: { gt: 0 }
      }
    });
  }

  /* ----------------------------
     Charges (Day-based pricing)
  ----------------------------- */
  public static async getCharges(
    propertyCode: string,
    roomTypeCode: string,
    ratePlanCode: string,
    date: string
  ) {
   const dayStart = new Date(date);
const dayEnd = new Date(date);
dayEnd.setDate(dayEnd.getDate() + 1);

return prisma.charge.findMany({
  where: {
    propertyCode,
    roomTypeCode,
    ratePlanCode,
    date: {
      gte: dayStart,
      lt: dayEnd
    }
  },
  include: { baseGuestAmounts: true, additionalGuestAmounts: true }
});

  }
}
