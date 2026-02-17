
import { PromotionType } from '@prisma/client';
import { IDeviceSpecificPromotion, IDeviceSpecificPromotionUpdate } from '../interfaces';
import { errorResponse, successResponse } from '../../../utils';
import { DeviceSpecificPromotionDao } from '../dao';

export class DeviceSpecificPromotionService {
  /**
   * Create a device-specific promotion
   */
  public static async createDeviceSpecificPromotion(
    data: IDeviceSpecificPromotion
  ) {
    try {
      // Validate that promotionType is device_specific
      if (data.promotionType !== PromotionType.device_specific) {
        return errorResponse('Invalid promotion type for device-specific promotion');
      }

      // Validate required fields
      if (!data.deviceType || data.deviceType.length === 0) {
        return errorResponse('At least one device type is required for device-specific promotion');
      }

      if (!data.ratePlanId || !data.ratePlanCode) {
        return errorResponse('Rate plan ID and code are required');
      }

      // Create the promotion
      const promotion = await DeviceSpecificPromotionDao.createDeviceSpecificPromotion(data);

      if (promotion) {
        return successResponse('Device-specific promotion created successfully', promotion);
      } else {
        return errorResponse('Failed to create device-specific promotion');
      }
    } catch (error: any) {
      return errorResponse(
        'Failed to create device-specific promotion',
        error?.message
      );
    }
  }

  /**
   * Get all device-specific promotions by property
   */
  public static async getDeviceSpecificPromotionsByProperty(propertyId: string) {
    try {
      const promotions = await DeviceSpecificPromotionDao.getDeviceSpecificPromotionsByProperty(propertyId);

      return successResponse(
        'Device-specific promotions fetched successfully',
        promotions
      );
    } catch (error: any) {
      return errorResponse(
        'Failed to fetch device-specific promotions',
        error?.message
      );
    }
  }

  /**
   * Get device-specific promotion by ID
   */
  public static async getDeviceSpecificPromotionById(id: string) {
    try {
      const promotion = await DeviceSpecificPromotionDao.getDeviceSpecificPromotionById(id);

      if (!promotion) {
        return errorResponse('Device-specific promotion not found');
      }

      return successResponse('Device-specific promotion fetched successfully', promotion);
    } catch (error: any) {
      return errorResponse(
        'Failed to fetch device-specific promotion',
        error?.message
      );
    }
  }

  /**
   * Update device-specific promotion
   */
  public static async updateDeviceSpecificPromotion(id: string, updateData: IDeviceSpecificPromotionUpdate) {
    try {
      const existingPromotion = await DeviceSpecificPromotionDao.getDeviceSpecificPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Device-specific promotion not found');
      }

      if (updateData.validFrom && updateData.validTo) {
        if (updateData.validFrom > updateData.validTo) {
          return errorResponse('Valid from date must be before valid to date');
        }
      }

      const updatedPromotion = await DeviceSpecificPromotionDao.updateDeviceSpecificPromotion(id, updateData);

      if (updatedPromotion) {
        return successResponse('Device-specific promotion updated successfully', updatedPromotion);
      } else {
        return errorResponse('Failed to update device-specific promotion');
      }
    } catch (error: any) {
      return errorResponse(
        'Failed to update device-specific promotion',
        error?.message
      );
    }
  }

  /**
   * Delete device-specific promotion
   */
  public static async deleteDeviceSpecificPromotion(id: string) {
    try {
      const existingPromotion = await DeviceSpecificPromotionDao.getDeviceSpecificPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Device-specific promotion not found');
      }

      const deletedPromotion = await DeviceSpecificPromotionDao.deleteDeviceSpecificPromotion(id);

      if (deletedPromotion) {
        return successResponse('Device-specific promotion deleted successfully', deletedPromotion);
      } else {
        return errorResponse('Failed to delete device-specific promotion');
      }
    } catch (error: any) {
      return errorResponse(
        'Failed to delete device-specific promotion',
        error?.message
      );
    }
  }

  /**
   * Toggle device-specific promotion status
   */
  public static async toggleDeviceSpecificPromotionStatus(id: string, isActive: boolean) {
    try {
      const existingPromotion = await DeviceSpecificPromotionDao.getDeviceSpecificPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Device-specific promotion not found');
      }

      const updatedPromotion = await DeviceSpecificPromotionDao.updateDeviceSpecificPromotion(id, { ...existingPromotion, isActive });

      if (updatedPromotion) {
        return successResponse(
          `Device-specific promotion ${isActive ? 'activated' : 'deactivated'} successfully`,
          updatedPromotion
        );
      } else {
        return errorResponse('Failed to update device-specific promotion status');
      }
    } catch (error: any) {
      return errorResponse(
        'Failed to update device-specific promotion status',
        error?.message
      );
    }
  }
}