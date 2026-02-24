import { prisma } from "../../../config";
import { 
  IMLOS,
  IMLOSCreate
 } from "../interfaces";

export class MLOSDao {
  public  async createRatePlanRule(
    data: IMLOSCreate
  ): Promise<IMLOS> {
    try {
      return await prisma.ratePlanRule.create({
        data: {
          ratePlanId: data.ratePlanId,
          startDate: data.startDate?data.startDate:null,
          endDate: data.endDate?data.endDate:null,
          minLos: data.minLos,
          maxLos: data.maxLos,
          discountType: data.discountType,
          discountValue: data.discountValue,
          isActive: data.isActive,
          isAutoApplied: data.isAutoApplied,
          currencyCode: data.currencyCode
        },
      });
    } catch (error) {
      throw new Error('Unknown error occurred while creating rate plan rule');
    }
  }

  public  async getRatePlanRuleByRatePlanId(
    ratePlanId: string
  ): Promise<IMLOS | null> {
    try {
      return await prisma.ratePlanRule.findUnique({
        where: { ratePlanId },
      });
    } catch (error) {
     
      throw new Error('Unknown error occurred while fetching rate plan rule');
    }
  }

  public  async getRatePlanRuleById(id: string): Promise<IMLOS | null> {
    try {
      return await prisma.ratePlanRule.findUnique({
        where: { id },
      });
    } catch (error) {
     
      throw new Error('Unknown error occurred while fetching rate plan rule');
    }
  }

  public  async updateRatePlanRule(
    ratePlanId: string,
    updateData: IMLOSCreate
  ): Promise<IMLOS> {
    try {


      return await prisma.ratePlanRule.update({
        where: { ratePlanId },
        data: {
          ...updateData
        },
      });
    } catch (error) {
      
      throw new Error('Unknown error occurred while updating rate plan rule');
    }
  }

  public  async deleteRatePlanRule(ratePlanId: string): Promise<IMLOS> {
    try {
      return await prisma.ratePlanRule.delete({
        where: { ratePlanId },
      });
    } catch (error) {
      
      throw new Error('Unknown error occurred while deleting rate plan rule');
    }
  }

  public  async ratePlanExists(ratePlanId: string): Promise<boolean> {
    try {
      const ratePlan = await prisma.ratePlan.findUnique({
        where: { id: ratePlanId },
        select: { id: true },
      });
      return !!ratePlan;
    } catch (error) {
      
      throw new Error('Unknown error occurred while checking rate plan existence');
    }
  }
public  async getRatePlanRulesByPropertyId(
  propertyId: string
): Promise<IMLOS[]> {
  try {
    return await prisma.ratePlanRule.findMany({
      where: {
        ratePlan: {
          propertyId: propertyId,
        },
      },
      include: {
        ratePlan: {
          select: {
            id: true,
            ratePlanName: true,
            ratePlanCode: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    throw new Error('Unknown error occurred while fetching rate plan rules');
  }
}
}