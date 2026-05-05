import { UpdatePlanData } from '../types/utills';
import { formatDateToYYYYMMDD } from '../utils/date';
import { IPaginatedResponse } from '../../utils/return';
// import { MappedRate } from "../types/mapedRate.type"
import { IRatePlanUpdate } from '../types/rateplan.type';
import { nowUTC, toUTC } from '../../utils';
import { prisma } from '../../config';
export class RatePlanRepository {
  public static async createRatePlan(
    ratePlanName: string,
    ratePlanCode: string,
    propertyId: string,
    isB2B: boolean,
    isB2C: boolean,
    isRoomOnlyVisible: boolean
  ): Promise<any> {
    try {
      return await prisma.ratePlan.create({
        data: {
          ratePlanName,
          ratePlanCode,
          b2bAvailable: isB2B,
          b2cAvailable: isB2C,
          roomOnlyVisible: isRoomOnlyVisible,
          property: {
            connect: {
              id: propertyId
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create rate plan: ${error.message}`);
      }
      throw new Error('Unknown error occurred while creating rate plan');
    }
  }
  public static async getRatePlanByPropertyId(
    propertyId: string
  ): Promise<any[]> {
    try {
      return await prisma.ratePlan.findMany({
        where: { propertyId: propertyId },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          depositPolicy: true,
          cancellationPolicy: true,
          guaranteePolicy: true,
          ratePlanRules: true,
          Addons: true,
        },
        
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error('Failed to fetch rate plans');
    }
  }
  public static async getRatePlanByCode(ratePlanCode: string): Promise<any> {
    try {
      return await prisma.ratePlan.findUnique({
        where: { ratePlanCode },
      });
    } catch (error: any) {
      throw new Error(error?.message)
    }
  }
  public static async deleteRatePlan(ratePlanCode: string): Promise<any> {
    try {

      const inventories = await prisma.inventory.findMany({
        where: {
          ratePlans: {
            has: ratePlanCode,
          },
        },
        select: {
          id: true,
          ratePlans: true,
        },
      });

      // Step 2: Remove ratePlanCode from each inventory's ratePlans array
      const updatePromises = inventories.map((inv: any) =>
        prisma.inventory.update({
          where: { id: inv.id },
          data: {
            ratePlans: {
              set: inv.ratePlans.filter((code: string) => code !== ratePlanCode),
            },
          },
        })
      );

      await Promise.all(updatePromises);

      // Step 3: Delete the rate plan
      const deleted = await prisma.ratePlan.delete({
        where: { ratePlanCode },
      });

      return deleted;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete rate plan: ${error.message}`);
      }
      throw new Error('Unknown error occurred while deleting rate plan');
    }
  }
  public static async updateRatePlan(
    ratePlanCode: string,
    updateData: IRatePlanUpdate
  ) {
    try {
      const mappedData: any = { ...updateData };


      return await prisma.ratePlan.update({
        where: { ratePlanCode },
        data: mappedData,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update rate plan: ${error.message}`);
      }
      throw new Error('Unknown error occurred while updating rate plan');
    }
  }

  public static async getMappedRatePlanByProperty(
    propertyCode: string,
    roomTypeCode?: string,
    ratePlanCode?: string,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    resultsPerPage: number = 20
  ): Promise<IPaginatedResponse<any>> {

    const skip = (page - 1) * resultsPerPage;

    const startDateString = startDate
      ? toUTC(startDate)
      : nowUTC();

    const endDateString = endDate
      ? toUTC(endDate)
      : toUTC(
        new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      );

    try {
      // Build the where clause for charges
      const chargeWhereClause = {
        propertyCode,
        ...(roomTypeCode && { roomTypeCode }),
        ...(ratePlanCode && { ratePlanCode }),
        date: {
          gte: startDateString,
          lte: endDateString,
        },
      };

      const totalResults = await prisma.charge.count({
        where: chargeWhereClause,
      });


      const charges = await prisma.charge.findMany({
        where: chargeWhereClause,
        include: {
          baseGuestAmounts: true,
          additionalGuestAmounts: true,
        },
        skip,
        take: resultsPerPage,
        orderBy: {
          date: 'asc', // Add ordering for consistency
        },
      });

      // Step 3: Get inventory availability for each charge
      const data = await Promise.all(
        charges.map(async (charge) => {
          const inventory = await prisma.inventory.findFirst({
            where: {
              propertyCode: charge.propertyCode,
              roomTypeCode: charge.roomTypeCode,
              date: (charge.date),
            },
            select: {
              availability: true,
            },
          });

          return {
            ...charge,
            availableRooms: inventory?.availability ?? 0,
          };
        })
      );

      const totalPages = Math.ceil(totalResults / resultsPerPage);

      return {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalResults,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          resultsPerPage,
        },
      };
    } catch (error) {
      console.error('Error in getMappedRatePlanByProperty:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch mapped rate plans: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching mapped rate plans');
    }
  }

  public static async updateCharges(
    chargeId: string,
    updateData: UpdatePlanData
  ): Promise<any> {
    try {
      const { baseGuestAmounts, additionalGuestAmounts } = updateData;


      await prisma.chargeBaseByGuest.deleteMany({
        where: { chargeId },
      });

      await prisma.chargeAdditionalGuest.deleteMany({
        where: { chargeId },
      });

      // Update the charge with new base guest amounts and additional guest amounts
      const updated = await prisma.charge.update({
        where: { id: chargeId },
        data: {
          baseGuestAmounts: {
            create: baseGuestAmounts.map((guest) => ({
              numberOfGuests: guest.numberOfGuests,
              amountBeforeTax: Number(guest.amountBeforeTax),
              ageQualifyingCode: guest.ageQualifyingCode,
            })),
          },
          additionalGuestAmounts: {
            create: additionalGuestAmounts.map((guest) => ({
              ageQualifyingCode: guest.ageQualifyingCode,
              amount: guest.amount,
            })),
          },
        },
        include: {
          baseGuestAmounts: true,
          additionalGuestAmounts: true,
        },
      });

      return updated;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update charges: ${error.message}`);
      }
      throw new Error('Unknown error occurred while updating charges');
    }
  }

  public static async getRatePlanByRatePlanCode(
    ratePlanCode: string
  ): Promise<any | null> {
    try {
      return await prisma.ratePlan.findUnique({
        where: { ratePlanCode },
        include: {
          depositPolicy: true,
          cancellationPolicy: true,
          guaranteePolicy: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch rate plan: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching rate plan');
    }
  }
  public static async addTaxGroupToRatePlan(
    ratePlanCode: string,
    taxGroupId: string
  ): Promise<any> {
    try {
      // await prisma.taxGroup.findUnique({
      //   where: { id: taxGroupId },
      //   data: {
      //     ratePlanCode: ratePlanCodes
      //   }
      // })
      return await prisma.ratePlan.update({
        where: { ratePlanCode },
        data: {
          taxGroupId: taxGroupId
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to add tax group to rate plan`);
      }
      throw new Error('Unknown error occurred while adding tax group to rate plan');
    }
  }
  public static async removeTaxGroupFromRatePlan(
    ratePlanCode: string,
    taxGroupId: string
  ): Promise<any> {
    try {
      return await prisma.ratePlan.update({
        where: { ratePlanCode, taxGroupId },
        data: {
          taxGroupId: null
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to add tax group to rate plan: ${error.message}`);
      }
      throw new Error('Unknown error occurred while adding tax group to rate plan');
    }
  }
  // ✅ Updated RatePlanRepository.updateOrCreateChargesForDateRange
  public static async updateOrCreateChargesForDateRange(
    propertyCode: string,
    roomTypeCode: string,
    ratePlanCode: string,
    startDate: Date,
    endDate: Date,
    baseGuestAmounts: any[],
    additionalGuestAmounts: any[],
    currencyCode?: any
  ): Promise<{ updated: number; created: number; dates: string[] }> {
    try {
      // First, fetch the rate plan and room type names
      const ratePlan = await prisma.ratePlan.findUnique({
        where: { ratePlanCode },
        select: { ratePlanName: true },
      });

      const room = await prisma.room.findFirst({
        where: {
          roomType: roomTypeCode,
          property: { propertyCode }
        },
        select: { roomName: true },
      });

      if (!ratePlan) {
        throw new Error(`Rate plan with code ${ratePlanCode} not found`);
      }

      if (!room) {
        throw new Error(`Room type with code ${roomTypeCode} not found`);
      }

      const ratePlanName = ratePlan.ratePlanName;
      const roomTypeName = room.roomName;

      // Generate all dates in the range
      const dates: Date[] = [];
      const currentDate = new Date(startDate);
      const end = new Date(endDate);

      while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }


      // Find existing charges for these dates
      const existingCharges = await prisma.charge.findMany({
        where: {
          propertyCode,
          roomTypeCode,
          ratePlanCode,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          date: true,
        },
      });


      // Create a map of existing charge dates
      const existingDatesMap = new Map(
        existingCharges.map((charge) => [
          formatDateToYYYYMMDD(charge.date),
          charge.id,
        ])
      );

      let updatedCount = 0;
      let createdCount = 0;
      const processedDates: string[] = [];

      // Process each date
      for (const date of dates) {
        const dateString = formatDateToYYYYMMDD(date);
        const existingChargeId = existingDatesMap.get(dateString);

        if (existingChargeId) {
          // Update existing charge
          await prisma.chargeBaseByGuest.deleteMany({
            where: { chargeId: existingChargeId },
          });

          await prisma.chargeAdditionalGuest.deleteMany({
            where: { chargeId: existingChargeId },
          });

          await prisma.charge.update({
            where: { id: existingChargeId },
            data: {
              ...(currencyCode && { currencyCode }),
              baseGuestAmounts: {
                create: baseGuestAmounts.map((guest) => ({
                  numberOfGuests: guest.numberOfGuests,
                  amountBeforeTax: guest.amountBeforeTax,
                  ageQualifyingCode: guest.ageQualifyingCode,
                })),
              },
              additionalGuestAmounts: {
                create: additionalGuestAmounts.map((guest) => ({
                  ageQualifyingCode: guest.ageQualifyingCode,
                  amount: guest.amount,
                })),
              },
            },
          });

          updatedCount++;
          processedDates.push(dateString);
        } else {
          // Create new charge
          await prisma.charge.create({
            data: {
              propertyCode,
              roomTypeCode,
              ratePlanCode,
              ratePlanName, // ✅ Added
              roomTypeName, // ✅ Added
              ...(currencyCode && { currencyCode }),
              date: new Date(date),
              baseGuestAmounts: {
                create: baseGuestAmounts.map((guest) => ({
                  numberOfGuests: guest.numberOfGuests,
                  amountBeforeTax: guest.amountBeforeTax,
                  ageQualifyingCode: guest.ageQualifyingCode,
                })),
              },
              additionalGuestAmounts: {
                create: additionalGuestAmounts.map((guest) => ({
                  ageQualifyingCode: guest.ageQualifyingCode,
                  amount: guest.amount,
                })),
              },
            },
          });

          createdCount++;
          processedDates.push(dateString);
        }
      }


      return {
        updated: updatedCount,
        created: createdCount,
        dates: processedDates,
      };
    } catch (error) {
      console.error('Error in updateOrCreateChargesForDateRange:', error);
      if (error instanceof Error) {
        throw new Error(
          `Failed to update/create charges for date range: ${error.message}`
        );
      }
      throw new Error(
        'Unknown error occurred while updating/creating charges for date range'
      );
    }
  }
  public static async deleteCharges(roomType: string, propertyCode: string) {
    try {
      return await prisma.charge.deleteMany({
        where: {
          roomTypeCode: roomType,
          propertyCode: propertyCode
        }
      })
    } catch (error) {
      throw new Error("Failed to delete charges")
    }
  }
  public static async getRateplanById(ratePlanId:string){
    try {
      return await prisma.ratePlan.findUnique({
        where: {
          id: ratePlanId
        }
      })
    } catch (error) {
      throw new Error("Failed to get rate plan")
    }
  }
}


