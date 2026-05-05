import { Response } from 'express';
import { PropertyCustomRequest } from '../../../utils/customRequest';
import { errorResponse } from '../../../utils/return';
import { DeviceSpecificPromotionService } from '../services';
import { CustomRequest } from '../../../utils/customRequest';
import { ICEbDsOftc, PromotionType } from '../interfaces';

export class DeviceSpecificPromotionController {
  deviceSpecificPromotionService: DeviceSpecificPromotionService;

  constructor() {
    this.deviceSpecificPromotionService = new DeviceSpecificPromotionService();
  }

  public async createDeviceSpecificPromotion(req: PropertyCustomRequest, res: Response): Promise<Response> {
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
        isAutoApplied,
        isActive
      }: ICEbDsOftc = req.body;
      // Basic validation
      if (!promotionName || !propertyId || !discountType || !discountValue) {
        return res.status(400).json(
          errorResponse('Promotion name, property ID, discount type, and discount value are required')
        );
      }

      if (!validFrom) {
        return res.status(400).json(errorResponse('Promotion applicable start date is required'));
      }

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
        promotionType: 'device_specific' as PromotionType,
        discountType,
        discountValue,
        currencyCode,
        validFrom: new Date(validFrom),
        validTo: validTo ? new Date(validTo) : null,
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
        isAutoApplied,
        isActive
      };

      const result = await this.deviceSpecificPromotionService.createDeviceSpecificPromotion({
        ...promotionData,
        roomId: null,
        advanceBookingDays: null,
        roomType: null
      });
      const status = result.success ? 201 : 400;
      return res.status(status).json(result);
    } catch (error) {
      if (error instanceof Error) {

        return res.status(500).json(
          errorResponse('Internal server error', error?.message)
        );
      }
      return res.status(500).json(
        errorResponse('Internal server error')
      );
    }
  }


  public async getDeviceSpecificPromotionsByProperty(req: PropertyCustomRequest, res: Response) {
    try {
      const propertyId = req.params.propertyId;

      if (!propertyId) {
        return res.status(400).json(errorResponse('Property ID is required'));
      }

      const result = await this.deviceSpecificPromotionService.getDeviceSpecificPromotionsByProperty(propertyId);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  public async getDeviceSpecificPromotionById(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      const result = await this.deviceSpecificPromotionService.getDeviceSpecificPromotionById(promotionId);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  public async updateDeviceSpecificPromotion(req: CustomRequest, res: Response) {
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

      const result = await this.deviceSpecificPromotionService.updateDeviceSpecificPromotion(promotionId, updateData);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }

  public async deleteDeviceSpecificPromotion(req: CustomRequest, res: Response) {
    try {
      const promotionId = req.params.promotionId;

      if (!promotionId) {
        return res.status(400).json(errorResponse('Promotion ID is required'));
      }

      const result = await this.deviceSpecificPromotionService.deleteDeviceSpecificPromotion(promotionId);
      const status = result.success ? 200 : 400;
      return res.status(status).json(result);
    } catch (error: any) {
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }


}