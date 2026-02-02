// services/geoRatePlan.service.ts

import { errorResponse, successResponse } from '../../../utils';
import { GeoRatePlanDao } from '../dao';
import { IBulkCreateResponse, IGeoRatePlanBulkInput, IGeoRatePlanCreate, IGeoRatePlanFilter, IGeoRatePlanUpdate } from '../interfaces';

export class GeoRatePlanService {
// Add this new method to your existing GeoRatePlanService class

public static async createGeoRatePlanBulk(data: IGeoRatePlanBulkInput) {
  try {
    if (!data.ratePlans || data.ratePlans.length === 0) {
      return errorResponse('At least one rate plan is required');
    }

    if (!data.countryCode || data.countryCode.length === 0) {
      return errorResponse('At least one country code is required');
    }

    // Validate restriction type and value
    if (data.restrictionType === 'percentage' && data.restrictionValue) {
      if (data.restrictionValue < 0 || data.restrictionValue > 100) {
        return errorResponse('Percentage restriction value must be between 0 and 100');
      }
    }

    if (data.restrictionType === 'fixed' && !data.currencyCode) {
      return errorResponse('Currency code is required for fixed restriction type');
    }

    // Set restrictionValue to null if type is 'restricted'
    let finalRestrictionValue = data.restrictionValue;
    if (data.restrictionType === 'restricted') {
      finalRestrictionValue = null;
    }

    // Generate all combinations of rooms x ratePlans
    const geoRatePlanData: IGeoRatePlanCreate[] = [];
    
    for (const room of data.rooms) {
      for (const ratePlan of data.ratePlans) {
        geoRatePlanData.push({
          propertyId: data.propertyId,
          roomId: room.id,
          roomType: room.type,
          ratePlanId: ratePlan.id,
          ratePlanCode: ratePlan.code,
          restrictionType: data.restrictionType,
          restrictionValue: finalRestrictionValue,
          currencyCode: data.currencyCode,
          countryCode: data.countryCode,
          isActive: data.isActive ?? true,
        });
      }
    }

    // Create all records in a transaction
    const createdRecords = await GeoRatePlanDao.createGeoRatePlan(geoRatePlanData);

    const response: IBulkCreateResponse = {
      totalCreated: createdRecords.length,
      createdRecords: createdRecords,
      summary: {
        totalRooms: data.rooms.length,
        totalRatePlans: data.ratePlans.length,
        totalCombinations: geoRatePlanData.length,
      }
    };

    return successResponse(
      `Successfully created ${createdRecords.length} geo rate plan records`,
      response
    );
  } catch (error: any) {
    return errorResponse('Failed to create geo rate plans', error?.message);
  }
}
  public static async getGeoRatePlansByPropertyId(
    propertyId: string,
    filters?: IGeoRatePlanFilter
  ) {
    try {
      const geoRatePlans = await GeoRatePlanDao.getGeoRatePlansByPropertyId(
        propertyId,
        filters
      );

      return successResponse('Geo rate plans fetched successfully', geoRatePlans);
    } catch (error: any) {
      return errorResponse('Failed to fetch geo rate plans', error?.message);
    }
  }

  public static async getGeoRatePlanById(id: string) {
    try {
      const geoRatePlan = await GeoRatePlanDao.getGeoRatePlanById(id);

      if (!geoRatePlan) {
        return errorResponse('Geo rate plan not found');
      }

      return successResponse('Geo rate plan fetched successfully', geoRatePlan);
    } catch (error: any) {
      return errorResponse('Failed to fetch geo rate plan', error?.message);
    }
  }

  public static async updateGeoRatePlan(id: string, updateData: IGeoRatePlanUpdate) {
    try {
      // Check if geo rate plan exists
      const exists = await GeoRatePlanDao.getGeoRatePlanById(id);
      if (!exists) {
        return errorResponse('Geo rate plan not found');
      }

      // Validate restriction value based on type if being updated
      if (updateData.restrictionType === 'percentage' && updateData.restrictionValue) {
        if (updateData.restrictionValue < 0 || updateData.restrictionValue > 100) {
          return errorResponse('Percentage restriction value must be between 0 and 100');
        }
      }

      if (updateData.restrictionType === 'fixed' && !updateData.currencyCode) {
        return errorResponse('Currency code is required for fixed restriction type');
      }

      if (updateData.restrictionType === 'restricted') {
        updateData.restrictionValue = null;
      }

      const response = await GeoRatePlanDao.updateGeoRatePlan(id, updateData);

      if (response) {
        return successResponse('Geo rate plan updated successfully', response);
      } else {
        return errorResponse('Failed to update geo rate plan');
      }
    } catch (error: any) {
      return errorResponse('Failed to update geo rate plan', error?.message);
    }
  }

  public static async deleteGeoRatePlan(id: string) {
    try {
      const exists = await GeoRatePlanDao.getGeoRatePlanById(id);
      if (!exists) {
        return errorResponse('Geo rate plan not found');
      }

      const response = await GeoRatePlanDao.deleteGeoRatePlan(id);

      if (response) {
        return successResponse('Geo rate plan deleted successfully', response);
      } else {
        return errorResponse('Failed to delete geo rate plan');
      }
    } catch (error: any) {
      return errorResponse('Failed to delete geo rate plan', error?.message);
    }
  }

  public static async getGeoRatePlansByFilters(filters: IGeoRatePlanFilter) {
    try {
      const geoRatePlans = await GeoRatePlanDao.getGeoRatePlansByFilters(filters);

      return successResponse('Geo rate plans fetched successfully', geoRatePlans);
    } catch (error: any) {
      return errorResponse('Failed to fetch geo rate plans', error?.message);
    }
  }
}