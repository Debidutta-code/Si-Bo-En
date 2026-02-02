import { prisma } from "../../../config";
import { IMLOSCreate, IMLOSUpdate } from "../interfaces";

export class MLOSDao {
  /**
   * Create a new rate plan rule
   */
  public static async createRatePlanRule(
    data: IMLOSCreate
  ): Promise<any> {
    try {
      return await prisma.ratePlanRule.create({
        data: {
          ratePlanId: data.ratePlanId,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          minLos: data.minLos,
          maxLos: data.maxLos,
          discountType: data.discountType,
          discountValue: data.discountValue,
          isActive: data.isActive,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create rate plan rule: ${error.message}`);
      }
      throw new Error('Unknown error occurred while creating rate plan rule');
    }
  }

  /**
   * Get rate plan rule by rate plan ID
   */
  public static async getRatePlanRuleByRatePlanId(
    ratePlanId: string
  ): Promise<any | null> {
    try {
      return await prisma.ratePlanRule.findUnique({
        where: { ratePlanId },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch rate plan rule: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching rate plan rule');
    }
  }

  /**
   * Get rate plan rule by ID
   */
  public static async getRatePlanRuleById(id: string): Promise<any | null> {
    try {
      return await prisma.ratePlanRule.findUnique({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch rate plan rule: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching rate plan rule');
    }
  }

  /**
   * Update rate plan rule
   */
  public static async updateRatePlanRule(
    ratePlanId: string,
    updateData: IMLOSUpdate
  ): Promise<any> {
    try {
      const dataToUpdate: any = {};

      if (updateData.startDate !== undefined) {
        dataToUpdate.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
      }
      if (updateData.endDate !== undefined) {
        dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
      }
      if (updateData.minLos !== undefined) {
        dataToUpdate.minLos = updateData.minLos;
      }
      if (updateData.maxLos !== undefined) {
        dataToUpdate.maxLos = updateData.maxLos;
      }
      if (updateData.discountType !== undefined) {
        dataToUpdate.discountType = updateData.discountType;
      }
      if (updateData.discountValue !== undefined) {
        dataToUpdate.discountValue = updateData.discountValue;
      }
      if (updateData.isActive !== undefined) {
        dataToUpdate.isActive = updateData.isActive;
      }

      return await prisma.ratePlanRule.update({
        where: { ratePlanId },
        data: dataToUpdate,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update rate plan rule: ${error.message}`);
      }
      throw new Error('Unknown error occurred while updating rate plan rule');
    }
  }

  /**
   * Delete rate plan rule
   */
  public static async deleteRatePlanRule(ratePlanId: string): Promise<any> {
    try {
      return await prisma.ratePlanRule.delete({
        where: { ratePlanId },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete rate plan rule: ${error.message}`);
      }
      throw new Error('Unknown error occurred while deleting rate plan rule');
    }
  }

  /**
   * Check if rate plan exists
   */
  public static async ratePlanExists(ratePlanId: string): Promise<boolean> {
    try {
      const ratePlan = await prisma.ratePlan.findUnique({
        where: { id: ratePlanId },
        select: { id: true },
      });
      return !!ratePlan;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to check rate plan existence: ${error.message}`);
      }
      throw new Error('Unknown error occurred while checking rate plan existence');
    }
  }
/**
 * Get all rate plan rules by property ID
 */
public static async getRatePlanRulesByPropertyId(
  propertyId: string
): Promise<any[]> {
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
    if (error instanceof Error) {
      throw new Error(`Failed to fetch rate plan rules: ${error.message}`);
    }
    throw new Error('Unknown error occurred while fetching rate plan rules');
  }
}
}