// controllers/geoRatePlan.controller.ts

import { Response } from 'express';
import { CustomRequest, errorResponse, PropertyCustomRequest } from '../../../utils';
import { GeoRatePlanService } from '../services';


export class GeoRatePlanController {

public static async createGeoRatePlan(req: PropertyCustomRequest, res: Response) {
  try {
    const { rooms, ratePlans, restrictionType, restrictionValue, currencyCode, countryCode, isActive } = req.body;
    const propertyId = req.query.propertyId as string;

    if (!propertyId) {
      return res.status(400).json(errorResponse('Property ID is required'));
    }

    if (!ratePlans || !Array.isArray(ratePlans) || ratePlans.length === 0) {
      return res.status(400).json(errorResponse('Rate plans array is required and must not be empty'));
    }

    if (!restrictionType) {
      return res.status(400).json(errorResponse('Restriction type is required'));
    }

    const validRestrictionTypes = ['percentage', 'fixed', 'restricted'];
    if (!validRestrictionTypes.includes(restrictionType)) {
      return res.status(400).json(errorResponse('Invalid restriction type. Must be percentage, fixed, or restricted'));
    }

    if (!countryCode || !Array.isArray(countryCode) || countryCode.length === 0) {
      return res.status(400).json(errorResponse('Country code must be a non-empty array'));
    }

    // Validate ratePlans structure
    for (const ratePlan of ratePlans) {
      if (!ratePlan.id || !ratePlan.code) {
        return res.status(400).json(errorResponse('Each rate plan must have id and code'));
      }
    }

    const serviceRes = await GeoRatePlanService.createGeoRatePlanBulk({
      propertyId,
      rooms,
      ratePlans,
      restrictionType,
      restrictionValue,
      currencyCode,
      countryCode,
      isActive
    });

    const status = serviceRes.success ? 200 : 400;
    return res.status(status).json(serviceRes);
  } catch (error: any) {
    return res.status(500).json(errorResponse('Internal server error', error?.message));
  }
}

  public static async getGeoRatePlansByPropertyId(req: PropertyCustomRequest, res: Response) {
    try {
      const propertyId = req.params.propertyId;
      const { roomTypeCode, ratePlanCode, countryCode, isActive } = req.query;

      if (!propertyId) {
        return res.status(400).json(errorResponse('Property ID is not provided'));
      }

      const filters: any = {};
      if (roomTypeCode && roomTypeCode !== 'all') filters.roomTypeCode = roomTypeCode as string;
      if (ratePlanCode && ratePlanCode !== 'all') filters.ratePlanCode = ratePlanCode as string;
      if (countryCode) filters.countryCode = countryCode as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const geoRatePlans = await GeoRatePlanService.getGeoRatePlansByPropertyId(propertyId, filters);
      
      const status = geoRatePlans.success ? 200 : 400;
      return res.status(status).json(geoRatePlans);
    } catch (error: any) {
      return res.status(500).json(errorResponse('Internal Server Error', error?.message));
    }
  }

  public static async getGeoRatePlanById(req: CustomRequest, res: Response) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json(errorResponse('Geo rate plan ID is not provided'));
      }

      const geoRatePlan = await GeoRatePlanService.getGeoRatePlanById(id);
      
      const status = geoRatePlan.success ? 200 : 400;
      return res.status(status).json(geoRatePlan);
    } catch (error: any) {
      return res.status(500).json(errorResponse('Internal Server Error', error?.message));
    }
  }

  public static async updateGeoRatePlan(req: CustomRequest, res: Response) {
    try {
      const id = req.params.id;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json(errorResponse('Geo rate plan ID is not provided'));
      }

      if (updateData.countryCode && (!Array.isArray(updateData.countryCode) || updateData.countryCode.length === 0)) {
        return res.status(400).json(errorResponse('Country code must be a non-empty array'));
      }

      const response = await GeoRatePlanService.updateGeoRatePlan(id, updateData);
      
      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res.status(500).json(errorResponse('Internal Server Error', error?.message));
    }
  }

  public static async deleteGeoRatePlan(req: CustomRequest, res: Response) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json(errorResponse('Geo rate plan ID is not provided'));
      }

      const response = await GeoRatePlanService.deleteGeoRatePlan(id);
      
      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res.status(500).json(errorResponse('Internal Server Error', error?.message));
    }
  }

  public static async getGeoRatePlansByFilters(req: CustomRequest, res: Response) {
    try {
      const { propertyId, roomTypeCode, ratePlanCode, countryCode, isActive } = req.query;

      const filters: any = {};
      if (propertyId) filters.propertyId = propertyId as string;
      if (roomTypeCode) filters.roomTypeCode = roomTypeCode as string;
      if (ratePlanCode) filters.ratePlanCode = ratePlanCode as string;
      if (countryCode) filters.countryCode = countryCode as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const geoRatePlans = await GeoRatePlanService.getGeoRatePlansByFilters(filters);
      
      const status = geoRatePlans.success ? 200 : 400;
      return res.status(status).json(geoRatePlans);
    } catch (error: any) {
      return res.status(500).json(errorResponse('Internal Server Error', error?.message));
    }
  }
}