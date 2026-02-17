import { prisma } from '../../../config';
import { IGeoRatePlanCreate, IGeoRatePlanUpdate, IGeoRatePlanFilter } from '../interfaces';

export class GeoRatePlanDao {

// Add this new method to your existing GeoRatePlanDao class

public static async createGeoRatePlan(dataArray: IGeoRatePlanCreate[]): Promise<any[]> {
  try {
    const createdRecords = await prisma.$transaction(
      dataArray.map((data) =>
        prisma.geoRatePlan.create({
          data: {
            propertyId: data.propertyId,
            roomId: data.roomId || null,
            roomType: data.roomType || null,
            ratePlanId: data.ratePlanId,
            ratePlanCode: data.ratePlanCode,
            restrictionType: data.restrictionType,
            restrictionValue: data.restrictionValue || null,
            currencyCode: data.currencyCode || null,
            countryCode: data.countryCode,
            isActive: data.isActive ?? true,
            isAutoApplied: data.isAutoApplied
          },
          include: {
            property: {
              select: {
                propertyName: true,
                propertyCode: true
              }
            },
            room: {
              select: {
                roomName: true,
                roomType: true
              }
            },
            ratePlan: {
              select: {
                ratePlanName: true,
                ratePlanCode: true
              }
            }
          }
        })
      )
    );

    return createdRecords;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create geo rate plans in bulk: ${error.message}`);
    }
    throw new Error('Unknown error occurred while creating geo rate plans in bulk');
  }
}
  public static async getGeoRatePlansByPropertyId(
    propertyId: string,
    filters?: IGeoRatePlanFilter
  ): Promise<any[]> {
    try {
      const whereClause: any = {
        propertyId,
        isActive: true
      };

      if (filters?.roomTypeCode) {
        whereClause.roomType = filters.roomTypeCode;
      }

      if (filters?.ratePlanCode) {
        whereClause.ratePlanCode = filters.ratePlanCode;
      }

      if (filters?.countryCode) {
        whereClause.countryCode = {
          has: filters.countryCode
        };
      }

      if (filters?.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }

      return await prisma.geoRatePlan.findMany({
        where: whereClause,
        include: {
          property: {
            select: {
              propertyName: true,
              propertyCode: true
            }
          },
          room: {
            select: {
              roomName: true,
              roomType: true
            }
          },
          ratePlan: {
            select: {
              ratePlanName: true,
              ratePlanCode: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch geo rate plans: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching geo rate plans');
    }
  }

  public static async getGeoRatePlanById(id: string): Promise<any | null> {
    try {
      return await prisma.geoRatePlan.findUnique({
        where: { id },
        include: {
          property: {
            select: {
              propertyName: true,
              propertyCode: true
            }
          },
          room: {
            select: {
              roomName: true,
              roomType: true
            }
          },
          ratePlan: {
            select: {
              ratePlanName: true,
              ratePlanCode: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch geo rate plan: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching geo rate plan');
    }
  }

  public static async updateGeoRatePlan(
    id: string,
    updateData: IGeoRatePlanUpdate
  ): Promise<any> {
    try {
      const dataToUpdate: any = { ...updateData };

      // If roomId is being updated, fetch new room details
      if (updateData.roomId) {
        const room = await prisma.room.findUnique({
          where: { id: updateData.roomId },
          select: { roomType: true, roomName: true }
        });

        if (!room) {
          throw new Error('Room not found');
        }

        dataToUpdate.roomType = room.roomType;
        dataToUpdate.roomName = room.roomName;
      }

      // If ratePlanId is being updated, fetch new rate plan details
      if (updateData.ratePlanId) {
        const ratePlan = await prisma.ratePlan.findUnique({
          where: { id: updateData.ratePlanId },
          select: { ratePlanCode: true, ratePlanName: true }
        });

        if (!ratePlan) {
          throw new Error('Rate plan not found');
        }

        dataToUpdate.ratePlanCode = ratePlan.ratePlanCode;
        dataToUpdate.ratePlanName = ratePlan.ratePlanName;
      }

      return await prisma.geoRatePlan.update({
        where: { id },
        data: dataToUpdate,
        include: {
          property: {
            select: {
              propertyName: true,
              propertyCode: true
            }
          },
          room: {
            select: {
              roomName: true,
              roomType: true
            }
          },
          ratePlan: {
            select: {
              ratePlanName: true,
              ratePlanCode: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update geo rate plan: ${error.message}`);
      }
      throw new Error('Unknown error occurred while updating geo rate plan');
    }
  }

  public static async deleteGeoRatePlan(id: string): Promise<any> {
    try {
      return await prisma.geoRatePlan.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete geo rate plan: ${error.message}`);
      }
      throw new Error('Unknown error occurred while deleting geo rate plan');
    }
  }

  public static async getGeoRatePlansByFilters(
    filters: IGeoRatePlanFilter
  ): Promise<any[]> {
    try {
      const whereClause: any = {
        isActive: true
      };

      if (filters.propertyId) {
        whereClause.propertyId = filters.propertyId;
      }

      if (filters.roomTypeCode) {
        whereClause.roomType = filters.roomTypeCode;
      }

      if (filters.ratePlanCode) {
        whereClause.ratePlanCode = filters.ratePlanCode;
      }

      if (filters.countryCode) {
        whereClause.countryCode = {
          has: filters.countryCode
        };
      }

      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }

      return await prisma.geoRatePlan.findMany({
        where: whereClause,
        include: {
          property: {
            select: {
              propertyName: true,
              propertyCode: true
            }
          },
          room: {
            select: {
              roomName: true,
              roomType: true
            }
          },
          ratePlan: {
            select: {
              ratePlanName: true,
              ratePlanCode: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch geo rate plans: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching geo rate plans');
    }
  }
}