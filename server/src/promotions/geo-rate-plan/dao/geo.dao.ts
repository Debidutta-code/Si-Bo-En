import { prisma } from '../../../config';
import { IGeoRatePlanCreate, IGeoRatePlan, IGeoRatePlanFilter, restrictionTypeAction } from '../interfaces';

export class GeoRatePlanDao {


  public async createGeoRatePlan(dataArray: IGeoRatePlanCreate[]): Promise<IGeoRatePlan[]> {
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
              restrictionTypeAction: data.restrictionTypeAction
            },
            include: {
              room: {
                select: {
                  id: true,
                  roomName: true,
                  roomType: true
                }
              },
              ratePlan: {
                select: {
                  id: true,
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
      throw new Error('Unknown error occurred while creating geo rate plans in bulk');
    }
  }
  public async getGeoRatePlansByPropertyId(
    propertyId: string,
    filters?: IGeoRatePlanFilter
  ): Promise<IGeoRatePlan[]> {
    try {
      const whereClause: any = {
        propertyId,
      };
      if (filters?.roomTypeCode) {
        whereClause.roomType = filters.roomTypeCode;
      }
      if (filters?.ratePlanCode) {
        whereClause.ratePlan = {
          ratePlanCode: filters.ratePlanCode
        };
      }
      return await prisma.geoRatePlan.findMany({
        where: whereClause,
        include: {

          room: {
            select: {
              id: true,
              roomName: true,
              roomType: true
            }
          },
          ratePlan: {
            select: {
              id: true,
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

      throw new Error('Unknown error occurred while fetching geo rate plans');
    }
  }

  public async getGeoRatePlanById(id: string): Promise<IGeoRatePlan | null> {
    try {
      return await prisma.geoRatePlan.findUnique({
        where: { id },
        include: {

          room: {
            select: {
              id: true,
              roomName: true,
              roomType: true
            }
          },
          ratePlan: {
            select: {
              id: true,
              ratePlanName: true,
              ratePlanCode: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error('Unknown error occurred while fetching geo rate plan');
    }
  }

  public async updateGeoRatePlan(
    id: string,
    updateData: IGeoRatePlanCreate
  ): Promise<IGeoRatePlan> {
    try {
      return await prisma.geoRatePlan.update({
        where: { id },
        data: updateData,
        include: {
          room: {
            select: {
              id: true,
              roomName: true,
              roomType: true
            }
          },
          ratePlan: {
            select: {
              id: true,
              ratePlanName: true,
              ratePlanCode: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error('Unknown error occurred while updating geo rate plan');
    }
  }

  public async deleteGeoRatePlan(id: string): Promise<IGeoRatePlanCreate> {
    try {
      return await prisma.geoRatePlan.delete({
        where: { id }
      });
    } catch (error) {

      throw new Error('Unknown error occurred while deleting geo rate plan');
    }
  }
  public async checkDuplicates(
    propertyId: string,
    countryCode: string[],
    combinations: { roomId: string | null; ratePlanId: string }[]
  ): Promise<{ roomId: string | null; ratePlanId: string }[]> {
    try {
      const existing = await prisma.geoRatePlan.findMany({
        where: {
          propertyId,
          countryCode:{
            hasSome:countryCode
          },
          OR: combinations.map(c => ({
            roomId: c.roomId,
            ratePlanId: c.ratePlanId
          }))
        },
        select: {
          roomId: true,
          ratePlanId: true,
          ratePlanCode: true,
          roomType: true
        }
      });

      return existing.map(e => ({ roomId: e.roomId, ratePlanId: e.ratePlanId }));
    } catch (error) {
      throw new Error('Unknown error occurred while checking duplicate geo rate plans');
    }
  }
}