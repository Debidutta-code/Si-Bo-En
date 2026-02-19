import { prisma } from '../../../config';
import { PromotionType } from '@prisma/client';
import { ICEbDsOftc, IDeviceSpecificPromotion, IDeviceSpecificPromotionUpdate, IEbDsOftc } from '../interfaces';

export class DeviceSpecificPromotionDao {

  public async createDeviceSpecificPromotion(
    data: ICEbDsOftc
  ): Promise<IEbDsOftc> {
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
          validTo: data.validTo ? data.validTo : null,
          discountType: data.discountType,
          discountValue: data.discountValue,
          currencyCode: data.currencyCode ? data.currencyCode : null,
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
          room: true
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create device-specific promotion: ${error.message}`);
      }
      throw new Error('Unknown error occurred while creating device-specific promotion');
    }
  }
  public  async getDeviceSpecificPromotionsByProperty(
    propertyId: string
  ): Promise<IEbDsOftc[]> {
    try {
      return await prisma.promotion.findMany({
        where: {
          propertyId,
          promotionType: "device_specific",
        },
        include: {
          property: true,
          ratePlan: true,
          room: true
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      
      throw new Error('Unknown error occurred while fetching device-specific promotions');
    }
  }

  public async getDeviceSpecificPromotionById(id: string): Promise<IEbDsOftc | null> {
    try {
      return await prisma.promotion.findUnique({
        where: {
          id,
        },
        include: {
          property: true,
          ratePlan: true,
          room: true
        },
      });
    } catch (error) {
      
      throw new Error('Unknown error occurred while fetching device-specific promotion');
    }
  }

  public async updateDeviceSpecificPromotion(
    id: string,
    updateData: IDeviceSpecificPromotionUpdate
  ): Promise<any> {
    try {
      
      return await prisma.promotion.update({
        where: { id },
        data:{
          ...updateData
        },
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

  public async deleteDeviceSpecificPromotion(id: string): Promise<any> {
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