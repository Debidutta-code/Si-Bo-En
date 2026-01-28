import { RatePlanRuleRepository } from '../repository';
import { errorResponse, successResponse } from '../../utils/return';
import { IRatePlanRuleCreate, IRatePlanRuleUpdate } from '../types/rateplan.type';

export class RatePlanRuleService {
  /**
   * Create a new rate plan rule
   */
  public static async createRatePlanRule(data: IRatePlanRuleCreate) {
    try {
      // Validation: Check if rate plan exists
      const ratePlanExists = await RatePlanRuleRepository.ratePlanExists(data.ratePlanId);
      if (!ratePlanExists) {
        return errorResponse('Rate plan does not exist');
      }

      // Validation: Check if rule already exists for this rate plan
      const existingRule = await RatePlanRuleRepository.getRatePlanRuleByRatePlanId(data.ratePlanId);
      if (existingRule) {
        return errorResponse('Rate plan rule already exists for this rate plan. Please update the existing rule instead.');
      }

      // Validation: minLos must be at least 1
      if (data.minLos < 1) {
        return errorResponse('Minimum length of stay must be at least 1');
      }

      // Validation: maxLos must be >= minLos if provided
      if (data.maxLos !== null && data.maxLos !== undefined && data.maxLos < data.minLos) {
        return errorResponse('Maximum length of stay must be greater than or equal to minimum length of stay');
      }

      // Validation: Date range validation
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (end < start) {
          return errorResponse('End date must be after start date');
        }
      }

      // Validation: Discount validation
      if (data.discountType && !data.discountValue) {
        return errorResponse('Discount value is required when discount type is specified');
      }

      if (data.discountValue && !data.discountType) {
        return errorResponse('Discount type is required when discount value is specified');
      }

      if (data.discountType === 'percentage' && data.discountValue && data.discountValue > 100) {
        return errorResponse('Percentage discount cannot exceed 100%');
      }

      if (data.discountValue && data.discountValue < 0) {
        return errorResponse('Discount value cannot be negative');
      }

      const response = await RatePlanRuleRepository.createRatePlanRule(data);

      if (response) {
        return successResponse('Rate plan rule created successfully', response);
      } else {
        return errorResponse('Failed to create rate plan rule');
      }
    } catch (error: any) {
      return errorResponse('Failed to create rate plan rule', error?.message);
    }
  }

  /**
   * Get rate plan rule by rate plan ID
   */
  public static async getRatePlanRuleByRatePlanId(ratePlanId: string) {
    try {
      const rule = await RatePlanRuleRepository.getRatePlanRuleByRatePlanId(ratePlanId);

      if (!rule) {
        return errorResponse('Rate plan rule not found');
      }

      return successResponse('Rate plan rule fetched successfully', rule);
    } catch (error: any) {
      return errorResponse('Failed to fetch rate plan rule', error?.message);
    }
  }

  /**
   * Update rate plan rule
   */
  public static async updateRatePlanRule(
    ratePlanId: string,
    updateData: IRatePlanRuleUpdate
  ) {
    try {
      // Check if rule exists
      const existingRule = await RatePlanRuleRepository.getRatePlanRuleByRatePlanId(ratePlanId);
      if (!existingRule) {
        return errorResponse('Rate plan rule does not exist');
      }

      // Validation: minLos must be at least 1 if provided
      if (updateData.minLos !== undefined && updateData.minLos < 1) {
        return errorResponse('Minimum length of stay must be at least 1');
      }

      // Validation: maxLos must be >= minLos if both are provided or if one is being updated
      const newMinLos = updateData.minLos !== undefined ? updateData.minLos : existingRule.minLos;
      const newMaxLos = updateData.maxLos !== undefined ? updateData.maxLos : existingRule.maxLos;

      if (newMaxLos !== null && newMaxLos < newMinLos) {
        return errorResponse('Maximum length of stay must be greater than or equal to minimum length of stay');
      }

      // Validation: Date range validation
      if (updateData.startDate !== undefined || updateData.endDate !== undefined) {
        const newStartDate = updateData.startDate !== undefined ? updateData.startDate : existingRule.startDate;
        const newEndDate = updateData.endDate !== undefined ? updateData.endDate : existingRule.endDate;

        if (newStartDate && newEndDate) {
          const start = new Date(newStartDate);
          const end = new Date(newEndDate);
          if (end < start) {
            return errorResponse('End date must be after start date');
          }
        }
      }

      // Validation: Discount validation
      const newDiscountType = updateData.discountType !== undefined ? updateData.discountType : existingRule.discountType;
      const newDiscountValue = updateData.discountValue !== undefined ? updateData.discountValue : existingRule.discountValue;

      if (newDiscountType && !newDiscountValue) {
        return errorResponse('Discount value is required when discount type is specified');
      }

      if (newDiscountValue && !newDiscountType) {
        return errorResponse('Discount type is required when discount value is specified');
      }

      if (newDiscountType === 'percentage' && newDiscountValue && newDiscountValue > 100) {
        return errorResponse('Percentage discount cannot exceed 100%');
      }

      if (newDiscountValue && newDiscountValue < 0) {
        return errorResponse('Discount value cannot be negative');
      }

      const response = await RatePlanRuleRepository.updateRatePlanRule(
        ratePlanId,
        updateData
      );

      if (response) {
        return successResponse('Rate plan rule updated successfully', response);
      } else {
        return errorResponse('Failed to update rate plan rule');
      }
    } catch (error: any) {
      return errorResponse('Failed to update rate plan rule', error?.message);
    }
  }

  /**
   * Delete rate plan rule
   */
  public static async deleteRatePlanRule(ratePlanId: string) {
    try {
      // Check if rule exists
      const existingRule = await RatePlanRuleRepository.getRatePlanRuleByRatePlanId(ratePlanId);
      if (!existingRule) {
        return errorResponse('Rate plan rule does not exist');
      }

      const response = await RatePlanRuleRepository.deleteRatePlanRule(ratePlanId);

      if (response) {
        return successResponse('Rate plan rule deleted successfully', response);
      } else {
        return errorResponse('Failed to delete rate plan rule');
      }
    } catch (error: any) {
      return errorResponse('Failed to delete rate plan rule', error?.message);
    }
  }

}