
import { ICEbDsOftc, IDeviceSpecificPromotion, IDeviceSpecificPromotionUpdate } from '../interfaces';
import { errorResponse, IApiResponse, successResponse } from '../../../utils';
import { DeviceSpecificPromotionDao } from '../dao';

export class DeviceSpecificPromotionService {
  deviceSpecificPromotionDao: DeviceSpecificPromotionDao;

  constructor() {
    this.deviceSpecificPromotionDao = new DeviceSpecificPromotionDao();
  }

  public async createDeviceSpecificPromotion(
    data: ICEbDsOftc
  ): Promise<IApiResponse> {
    try {


      // Validate required fields
      if (!data.deviceType || data.deviceType.length === 0) {
        return errorResponse('At least one device type is required for device-specific promotion');
      }

      if (!data.ratePlanId || !data.ratePlanCode) {
        return errorResponse('Rate plan ID and code are required');
      }

      // Create the promotion
      const promotion = await this.deviceSpecificPromotionDao.createDeviceSpecificPromotion(data);

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

  public async getDeviceSpecificPromotionsByProperty(propertyId: string) {
    try {
      const promotions = await this.deviceSpecificPromotionDao.getDeviceSpecificPromotionsByProperty(propertyId);

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
  public async getDeviceSpecificPromotionById(id: string) {
    try {
      const promotion = await this.deviceSpecificPromotionDao.getDeviceSpecificPromotionById(id);

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
  public async updateDeviceSpecificPromotion(id: string, updateData: IDeviceSpecificPromotionUpdate) {
    try {
      const existingPromotion = await this.deviceSpecificPromotionDao.getDeviceSpecificPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Device-specific promotion not found');
      }

      if (updateData.validFrom && updateData.validTo) {
        if (updateData.validFrom > updateData.validTo) {
          return errorResponse('Valid from date must be before valid to date');
        }
      }

      const updatedPromotion = await this.deviceSpecificPromotionDao.updateDeviceSpecificPromotion(id, updateData);

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
  public async deleteDeviceSpecificPromotion(id: string) {
    try {
      const existingPromotion = await this.deviceSpecificPromotionDao.getDeviceSpecificPromotionById(id);
      if (!existingPromotion) {
        return errorResponse('Device-specific promotion not found');
      }

      const deletedPromotion = await this.deviceSpecificPromotionDao.deleteDeviceSpecificPromotion(id);

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


}