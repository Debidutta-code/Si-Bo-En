import { prisma } from '../../../config';
import { PromotionType } from '@prisma/client';
import { IDeviceSpecificPromotion, IDeviceSpecificPromotionUpdate } from '../interfaces';

export class DeviceSpecificPromotionDao {
  /**
   * Create a device-specific promotion
   */
  public static async createDeviceSpecificPromotion(
    data: IDeviceSpecificPromotion
  ): Promise<any> {
    try {
      return await prisma.promotion.create({
        data: {
          promotionName: data.promotionName,
          propertyId: data.propertyId,
          promotionType: data.promotionType,
          ratePlanId: data.ratePlanId,
          ratePlanCode: data.ratePlanCode,
          deviceType: data.deviceType,
          validFrom: data.validFrom,
          validTo: data.validTo || null,
          DiscountType: data.discountType,
          DiscountValue: data.discountValue,
          currencyCode: data.currencyCode || null,
          monApplicable: data.monApplicable,
          tueApplicable: data.tueApplicable,
          wedApplicable: data.wedApplicable,
          thuApplicable: data.thuApplicable,
          friApplicable: data.friApplicable,
          satApplicable: data.satApplicable,
          sunApplicable: data.sunApplicable,
          isAutoApplied: data.isAutoApplied
        },
        include: {
          property: true,
          ratePlan: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create device-specific promotion: ${error.message}`);
      }
      throw new Error('Unknown error occurred while creating device-specific promotion');
    }
  }

  /**
   * Get all device-specific promotions by property
   */
  public static async getDeviceSpecificPromotionsByProperty(
    propertyId: string
  ): Promise<any[]> {
    try {
      return await prisma.promotion.findMany({
        where: {
          propertyId,
          promotionType: PromotionType.device_specific,
        },
        include: {
          property: true,
          ratePlan: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch device-specific promotions: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching device-specific promotions');
    }
  }

  /**
   * Get device-specific promotion by ID
   */
  public static async getDeviceSpecificPromotionById(id: string): Promise<any | null> {
    try {
      return await prisma.promotion.findFirst({
        where: {
          id,
          promotionType: PromotionType.device_specific,
        },
        include: {
          property: true,
          ratePlan: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch device-specific promotion: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching device-specific promotion');
    }
  }

  /**
   * Update device-specific promotion
   */
  public static async updateDeviceSpecificPromotion(
    id: string,
    updateData: IDeviceSpecificPromotionUpdate
  ): Promise<any> {
    try {
      const data: any = {};

      if (updateData.promotionName) data.promotionName = updateData.promotionName;
      if (updateData.validFrom) data.validFrom = updateData.validFrom;
      if (updateData.validTo !== undefined) data.validTo = updateData.validTo;
      if (updateData.discountType) data.DiscountType = updateData.discountType;
      if (updateData.discountValue !== undefined) data.DiscountValue = updateData.discountValue;
      if (updateData.currencyCode !== undefined) data.currencyCode = updateData.currencyCode;
      if (updateData.deviceType) data.deviceType = updateData.deviceType;
      if (updateData.monApplicable !== undefined) data.monApplicable = updateData.monApplicable;
      if (updateData.tueApplicable !== undefined) data.tueApplicable = updateData.tueApplicable;
      if (updateData.wedApplicable !== undefined) data.wedApplicable = updateData.wedApplicable;
      if (updateData.thuApplicable !== undefined) data.thuApplicable = updateData.thuApplicable;
      if (updateData.friApplicable !== undefined) data.friApplicable = updateData.friApplicable;
      if (updateData.satApplicable !== undefined) data.satApplicable = updateData.satApplicable;
      if (updateData.sunApplicable !== undefined) data.sunApplicable = updateData.sunApplicable;
      if (updateData.isActive !== undefined) data.isActive = updateData.isActive;
      data.isAutoApplied = updateData.isAutoApplied;
      return await prisma.promotion.update({
        where: { id },
        data,
        include: {
          property: true,
          ratePlan: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update device-specific promotion: ${error.message}`);
      }
      throw new Error('Unknown error occurred while updating device-specific promotion');
    }
  }

  /**
   * Delete device-specific promotion
   */
  public static async deleteDeviceSpecificPromotion(id: string): Promise<any> {
    try {
      return await prisma.promotion.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete device-specific promotion: ${error.message}`);
      }
      throw new Error('Unknown error occurred while deleting device-specific promotion');
    }
  }
}