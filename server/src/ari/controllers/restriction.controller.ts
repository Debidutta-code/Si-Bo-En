// src/modules/restrictions/controllers/restriction.controller.ts

import { Response } from 'express';
import { RestrictionServices } from '../services/restriction.services';
import { IRestrictionRequest } from '../types/restriction.types';
import { CustomRequest, PropertyCustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';

export class RestrictionController {
  public static async applyRestrictions(req: PropertyCustomRequest, res: Response) {
    try {
      const restrictionData: IRestrictionRequest = req.body;

      // Validation
      if (!restrictionData.propertyCode) {
        return res.status(400).json(errorResponse('Property code is required'));
      }

      if (
        !restrictionData.restrictionType ||
        !['CTA', 'CTD'].includes(restrictionData.restrictionType)
      ) {
        return res
          .status(400)
          .json(
            errorResponse('Valid restriction type (CTA or CTD) is required')
          );
      }

      if (!restrictionData.dates || restrictionData.dates.length === 0) {
        return res
          .status(400)
          .json(errorResponse('At least one date is required'));
      }

      if (typeof restrictionData.isActive !== 'boolean') {
        return res
          .status(400)
          .json(errorResponse('isActive must be a boolean'));
      }

      // Must have either global rate plans or room restrictions
      if (
        (!restrictionData.globalRatePlans ||
          restrictionData.globalRatePlans.length === 0) &&
        (!restrictionData.roomRestrictions ||
          restrictionData.roomRestrictions.length === 0)
      ) {
        return res
          .status(400)
          .json(
            errorResponse(
              'Must specify either globalRatePlans or roomRestrictions'
            )
          );
      }

      const response = await RestrictionServices.applyRestrictions(
        restrictionData
      );
      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal server error', error?.message));
    }
  }

  public static async getRestrictions(req: PropertyCustomRequest, res: Response) {
    try {
      const { propertyCode } = req.params;
      const { startDate, endDate, restrictionType } = req.query;

      if (!propertyCode) {
        return res.status(400).json(errorResponse('Property code is required'));
      }

      // Validate restrictionType if provided
      if (
        restrictionType &&
        !['CTA', 'CTD'].includes(restrictionType as string)
      ) {
        return res
          .status(400)
          .json(errorResponse('Restriction type must be CTA or CTD'));
      }

      const response = await RestrictionServices.getRestrictions(
        propertyCode,
        startDate as string,
        endDate as string,
        restrictionType as 'CTA' | 'CTD'
      );

      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal server error', error?.message));
    }
  }
}