import { Response } from 'express';
import { PropertyCustomRequest } from '../../../utils/customRequest';
import { errorResponse } from '../../../utils/return';
import { DeviceSpecificPromotionService } from '../services';
import { CustomRequest } from '../../../utils/customRequest';

export class DeviceSpecificPromotionController {
  /**
   * Create a device-specific promotion
   */
  public static async createDeviceSpecificPromotion(req: PropertyCustomRequest, res: Response) {
    try {
      const { 
        promotionName,
        propertyId,
        discountType,
        discountValue,
        currencyCode,
        validFrom,
        validTo,
        deviceType,
        ratePlanId,
        ratePlanCode,
        monApplicable,
        tueApplicable,
        wedApplicable,
        thuApplicable,
        friApplicable,
        satApplicable,
        sunApplicable,
      } = req.body;

      // Basic validation
      if (!promotionName || !propertyId || !discountType || discountValue === undefined) {
        return res.status(400).json(
          errorResponse('Promotion name, property ID, discount type, and discount value are required')
        );
      }

      if (!validFrom) {
        return res.status(400).json(errorResponse('Valid from date is required'));
      }

      // Device-specific validation
      if (!deviceType || deviceType.length === 0) {
        return res.status(400).json(
          errorResponse('At least one device type is required for device-specific promotion')
        );
      }

      if (!ratePlanId || !ratePlanCode) {
        return res.status(400).json(
          errorResponse('Rate plan ID and code are required for device-specific promotion')
        );
      }

      const promotionData = {
        promotionName,
        propertyId,
        promotionType: 'device_specific' as const,
        discountType,
        discountValue,
        currencyCode,
        validFrom: new Date(validFrom),
        validTo: validTo ? new Date(validTo) : undefined,
        deviceType,
        ratePlanId,
        ratePlanCode,
        monApplicable: monApplicable ?? true,
        tueApplicable: tueApplicable ?? true,
        wedApplicable: wedApplicable ?? true,
        thuApplicable: thuApplicable ?? true,
        friApplicable: friApplicable ?? true,
        satApplicable: satApplicable ?? true,
        sunApplicable: sunApplicable ?? true,
      };

      const result = await DeviceSpecificPromotionService.createDeviceSpecificPromotion(promotionData);
      const status = result.success ? 201 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Get all device-specific promotions by property
   */
  public static async getDeviceSpecificPromotionsByProperty(req: PropertyCustomRequest, res: Response) {
    try {
      const propertyId = req.params.propertyId;

      if (!propertyId) {
        return res.status(400).json(errorResponse('Property ID is required'));
      }

      const result = await DeviceSpecificPromotionService.getDeviceSpecificPromotionsByProperty(propertyId);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Get device-specific promotion by ID
   */
  public static async getDeviceSpecificPromotionById(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      const result = await DeviceSpecificPromotionService.getDeviceSpecificPromotionById(promotionId);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Update device-specific promotion
   */
  public static async updateDeviceSpecificPromotion(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;
      const updateData = req.body;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      // Convert date strings to Date objects if present
      if (updateData.validFrom) {
        updateData.validFrom = new Date(updateData.validFrom);
      }
      if (updateData.validTo) {
        updateData.validTo = new Date(updateData.validTo);
      }

      const result = await DeviceSpecificPromotionService.updateDeviceSpecificPromotion(promotionId, updateData);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Delete device-specific promotion
   */
  public static async deleteDeviceSpecificPromotion(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      const result = await DeviceSpecificPromotionService.deleteDeviceSpecificPromotion(promotionId);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  /**
   * Toggle device-specific promotion status
   */
  public static async toggleDeviceSpecificPromotionStatus(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;
      const { isActive } = req.body;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      if (typeof isActive !== 'boolean') {
        return res.status(400).json(errorResponse('isActive must be a boolean value'));
      }

      const result = await DeviceSpecificPromotionService.toggleDeviceSpecificPromotionStatus(promotionId, isActive);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }
}