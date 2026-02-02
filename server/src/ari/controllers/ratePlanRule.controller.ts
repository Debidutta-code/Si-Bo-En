import { CustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import  {RatePlanRuleService}  from '../services';
import { Response } from 'express';

export class RatePlanRuleController {
  /**
   * Create a new rate plan rule
   * POST /api/rate-plan-rules
   */
  public static async createRatePlanRule(req: CustomRequest, res: Response) {
    try {
      const {
        ratePlanId,
        startDate,
        endDate,
        minLos,
        maxLos,
        discountType,
        discountValue,
        isActive,
      } = req.body;

      // Validation: Required fields
      if (!ratePlanId) {
        return res.status(400).json(errorResponse('Rate plan ID is required'));
      }

      if (minLos === undefined || minLos === null) {
        return res.status(400).json(errorResponse('Minimum length of stay is required'));
      }

      if (isActive === undefined || isActive === null) {
        return res.status(400).json(errorResponse('Active status is required'));
      }

      // Validation: Field types
      if (typeof minLos !== 'number') {
        return res.status(400).json(errorResponse('Minimum length of stay must be a number'));
      }

      if (maxLos !== null && maxLos !== undefined && typeof maxLos !== 'number') {
        return res.status(400).json(errorResponse('Maximum length of stay must be a number'));
      }

      if (typeof isActive !== 'boolean') {
        return res.status(400).json(errorResponse('Active status must be a boolean'));
      }

      // Validation: Discount type enum
      if (discountType && !['percentage', 'flat'].includes(discountType)) {
        return res.status(400).json(
          errorResponse('Discount type must be either percentage or flat')
        );
      }

      if (discountValue !== null && discountValue !== undefined && typeof discountValue !== 'number') {
        return res.status(400).json(errorResponse('Discount value must be a number'));
      }

      const ruleData = {
        ratePlanId,
        startDate: startDate || null,
        endDate: endDate || null,
        minLos,
        maxLos: maxLos || null,
        discountType: discountType || null,
        discountValue: discountValue || null,
        isActive,
      };

      const serRes = await RatePlanRuleService.createRatePlanRule(ruleData);
      const status = serRes.success ? 201 : 400;
      return res.status(status).json(serRes);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal server error', error?.message));
    }
  }

  /**
   * Get rate plan rule by rate plan ID
   * GET /api/rate-plan-rules/:ratePlanId
   */
  public static async getRatePlanRuleByRatePlanId(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const ratePlanId = req.params.ratePlanId;

      if (!ratePlanId) {
        return res
          .status(400)
          .json(errorResponse('Rate plan ID is required'));
      }

      const response = await RatePlanRuleService.getRatePlanRuleByRatePlanId(ratePlanId);
      const status = response.success ? 200 : 404;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }

  /**
   * Update rate plan rule
   * PUT /api/rate-plan-rules/:ratePlanId
   */
  public static async updateRatePlanRule(req: CustomRequest, res: Response) {
    try {
      const ratePlanId = req.params.ratePlanId;
      const updateData = req.body;

      if (!ratePlanId) {
        return res
          .status(400)
          .json(errorResponse('Rate plan ID is required'));
      }

      // Validation: Field types if provided
      if (updateData.minLos !== undefined && typeof updateData.minLos !== 'number') {
        return res.status(400).json(errorResponse('Minimum length of stay must be a number'));
      }

      if (updateData.maxLos !== undefined && updateData.maxLos !== null && typeof updateData.maxLos !== 'number') {
        return res.status(400).json(errorResponse('Maximum length of stay must be a number'));
      }

      if (updateData.isActive !== undefined && typeof updateData.isActive !== 'boolean') {
        return res.status(400).json(errorResponse('Active status must be a boolean'));
      }

      // Validation: Discount type enum
      if (updateData.discountType && !['percentage', 'flat'].includes(updateData.discountType)) {
        return res.status(400).json(
          errorResponse('Discount type must be either percentage or flat')
        );
      }

      if (updateData.discountValue !== undefined && updateData.discountValue !== null && typeof updateData.discountValue !== 'number') {
        return res.status(400).json(errorResponse('Discount value must be a number'));
      }

      const response = await RatePlanRuleService.updateRatePlanRule(
        ratePlanId,
        updateData
      );
      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }


  public static async deleteRatePlanRule(req: CustomRequest, res: Response) {
    try {
      const ratePlanId = req.params.ratePlanId;

      if (!ratePlanId) {
        return res
          .status(400)
          .json(errorResponse('Rate plan ID is required'));
      }

      const response = await RatePlanRuleService.deleteRatePlanRule(ratePlanId);
      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }


}