import prisma from '../../config/prisma.client';
import { formatDateToYYYYMMDD } from '../utils/date';

export class AvailabilityRepository {
  public static async getPropertyByCode(propertyCode: string, roomTypeCodes: string[] = []) {
    try {
      const roomFilter = roomTypeCodes.length > 0
        ? {
            isDeleted: false,
            available: true,
            roomType: { in: roomTypeCodes },
          }
        : {
            isDeleted: false,
            available: true,
          };

      return await prisma.property.findUnique({
        where: { propertyCode },
        include: {
          propertyRooms: {
            where: roomFilter,
          },
          ratePlans: {
            include: {
              taxGroup: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch property: ${error.message}`);
      }
      throw new Error('Unknown error occurred');
    }
  }

  public static async getInventoryForDateRange(
    propertyCode: string,
    startDate: Date,
    endDate: Date,
    roomTypeCodes: string[] = []
  ) {
    try {
      const startDateStr = formatDateToYYYYMMDD(startDate);
      const endDateStr = formatDateToYYYYMMDD(endDate);

      const whereClause: any = {
        propertyCode,
        date: {
          gte: startDateStr,
          lte: endDateStr,
        },
      };

      if (roomTypeCodes.length > 0) {
        whereClause.roomTypeCode = { in: roomTypeCodes };
      }

      return await prisma.inventory.findMany({
        where: whereClause,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch inventory: ${error.message}`);
      }
      throw new Error('Unknown error occurred');
    }
  }

  public static async getChargesForDateRange(
    propertyCode: string,
    startDate: Date,
    endDate: Date,
    roomTypeCodes: string[] = []
  ) {
    try {
      const whereClause: any = {
        propertyCode,
        date: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (roomTypeCodes.length > 0) {
        whereClause.roomTypeCode = { in: roomTypeCodes };
      }

      return await prisma.charge.findMany({
        where: whereClause,
        include: {
          baseGuestAmounts: true,
          additionalGuestAmounts: true,
        },
        orderBy: {
          date: 'asc',
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch charges: ${error.message}`);
      }
      throw new Error('Unknown error occurred');
    }
  }

  public static async getReservationsForDateRange(
    propertyCode: string,
    startDate: Date,
    endDate: Date,
    roomTypeCodes: string[] = []
  ) {
    try {
      const whereClause: any = {
        propertyCode,
        bookingStatus: {
          in: ['confirmed', 'pending'],
        },
        OR: [
          {
            checkInDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            checkOutDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            AND: [
              { checkInDate: { lte: startDate } },
              { checkOutDate: { gte: endDate } },
            ],
          },
        ],
      };

      if (roomTypeCodes.length > 0) {
        whereClause.roomTypeCode = { in: roomTypeCodes };
      }

      return await prisma.reservation.findMany({
        where: whereClause,
        select: {
          roomTypeCode: true,
          checkInDate: true,
          checkOutDate: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch reservations: ${error.message}`);
      }
      throw new Error('Unknown error occurred');
    }
  }
}