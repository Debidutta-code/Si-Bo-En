import { RatePlanRepository } from '../repository';
import { errorResponse, successResponse } from '../../utils/return';
import { generateRatePlanCode, getPropertyCode } from '../utils';
import { UpdatePlanData, } from '../types/utills';
import { IRatePlanUpdate } from '../types/rateplan.type';

export class RatePlanServices {
  public static async createRatePlan(
    ratePlanName: string,
    propertyId: string,
    isB2B: boolean,
    isB2C: boolean,
    minimumLengthOfStay: number,
    maximumLengthOfStay?: number
  ) {
    try {
      const ratePlanCode = await generateRatePlanCode();
      const response = await RatePlanRepository.createRatePlan(
        ratePlanName,
        ratePlanCode,
        propertyId,
        isB2B,
        isB2C,
        minimumLengthOfStay,
        maximumLengthOfStay
      );
      if (response) {
        return successResponse('RatePlan created successfully', response);
      } else {
        return errorResponse(`Failed to create ${ratePlanName} RatePlan`);
      }
    } catch (error: any) {
      return errorResponse(
        `Failed to create ${ratePlanName} RatePlan`,
        error?.message
      );
    }
  }
  public static async getAllRatePlanByPropertyId(propertyId: string) {
    try {
      const ratePlans = await RatePlanRepository.getRatePlanByPropertyId(propertyId);

      return successResponse('RatePlans fetched successfully', ratePlans);
    } catch (error: any) {
      return errorResponse('Failed to get RatePlans', error?.message);
    }
  }
  public static async deleteRatePlan(ratePlanCode: string) {
    try {
      const isExist = await RatePlanRepository.getRatePlanByRatePlanCode(ratePlanCode);
      if (!isExist) {
        return errorResponse('Rate Plan does not exists');
      }
      const response = await RatePlanRepository.deleteRatePlan(ratePlanCode);
      console.log(response);
      if (response) {
        return successResponse('RatePlan deleted successfully', response);
      } else {
        return errorResponse(`Failed to delete RatePlan`);
      }
    } catch (error: any) {
      return errorResponse(`Failed to delete RatePlan`, error?.message);
    }
  }
  public static async updateRatePlan(
    ratePlanCode: string,
    updateData: IRatePlanUpdate
  ) {
    try {
      const isExist = await RatePlanRepository.getRatePlanByRatePlanCode(ratePlanCode);
      if (!isExist) {
        return errorResponse('Rate Plan does not exists');
      }
      const response = await RatePlanRepository.updateRatePlan(
        ratePlanCode,
        updateData
      );
      if (response) {
        return successResponse('RatePlan updated successfully', response);
      } else {
        return errorResponse(`Failed to update RatePlan`);
      }
    } catch (error: any) {
      return errorResponse(`Failed to update RatePlan`, error?.message);
    }
  }
  public static async getMappedRatePlanByHotel(
    hotelCode: string,
    invTypeCode?: string,
    ratePlanCode?: string,
    startDate?: Date,
    endDate?: Date,
    page?: number,
    resultPerPage?: number
  ) {
    try {
      const ratePlans = await RatePlanRepository.getMappedRatePlanByProperty(
        hotelCode,
        invTypeCode && invTypeCode,
        ratePlanCode && ratePlanCode,
        startDate && startDate,
        endDate && endDate,
        page && page,
        resultPerPage && resultPerPage
      );
      if (ratePlans) {
        return successResponse('Rate plans retrieved successfully', ratePlans);
      } else {
        return errorResponse('Failed to get mapped rate plans');
      }
    } catch (error: any) {
      return errorResponse(`Failed to get mapped RatePlan`, error?.message);
    }
  }
  public static async updateMappedRatePlan(chargeId: string, ratePlanData: UpdatePlanData) {
    try {
      const updatedRatePlan = await RatePlanRepository.updateCharges(chargeId, ratePlanData);
      if (updatedRatePlan) {
        return successResponse(
          'Rate plan updated successfully',
          updatedRatePlan
        );
      } else {
        return errorResponse('Failed to update');
      }
    } catch (error: any) {
      return errorResponse('Failed to update', error?.message);
    }
  }
  public static async addTaxGroupToRatePlan(
    ratePlanCode: string,
    taxGroupId: string
  ) {
    try {
      const response = await RatePlanRepository.addTaxGroupToRatePlan(
        ratePlanCode,
        taxGroupId
      );
      if (response) {
        return successResponse('Tax group added to rate plan successfully', response);
      } else {
        return errorResponse(`Failed to add tax group to rate plan`);
      }
    } catch (error: any) {
      return errorResponse(
        `Failed to add tax group to rate plan`,
        error?.message
      );
    }
  }
  public static async removeTaxGroupFromRatePlan(
    ratePlanCode: string,
    taxGroupId: string
  ) {
    try {
      const response = await RatePlanRepository.removeTaxGroupFromRatePlan(
        ratePlanCode,
        taxGroupId
      );
      if (response) {
        return successResponse('Tax group removed from rate plan successfully', response);
      } else {
        return errorResponse(`Failed to remove tax group from rate plan`);
      }
    } catch (error: any) {
      return errorResponse(
        `Failed to remove tax group from rate plan`,
        error?.message
      );
    }
  }
  // ✅ Add to RatePlanServices
public static async updateOrCreateRatePlanCharges(
  propertyCode: string,
  roomTypeCode: string,
  ratePlanCode: string,
  startDate: Date,
  endDate: Date,
  baseGuestAmounts: any[],
  additionalGuestAmounts: any[]
) {
  try {
    const result = await RatePlanRepository.updateOrCreateChargesForDateRange(
      propertyCode,
      roomTypeCode,
      ratePlanCode,
      startDate,
      endDate,
      baseGuestAmounts,
      additionalGuestAmounts
    );

    if (result) {
      return successResponse(
        `Successfully updated/created charges for ${result.updated} existing dates and created ${result.created} new dates`,
        result
      );
    } else {
      return errorResponse('Failed to update/create rate plan charges');
    }
  } catch (error: any) {
    return errorResponse(
      'Failed to update/create rate plan charges',
      error?.message
    );
  }
}
}
