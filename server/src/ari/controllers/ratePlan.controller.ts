import { CustomRequest, PropertyCustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { RatePlanServices } from '../services';
import { Response } from 'express';
import getPropertyIdFromPropertyId from "../utils/getPropertyCodeFromPropertyId"
export class RatePlanController {
  public static async createRatePlan(req: PropertyCustomRequest, res: Response) {
    try {
      const { ratePlanName,b2bAvailable,b2cAvailable,minimumLengthOfStay,maximumLengthOfStay } = req.body;
      const propertyId = req.query.propertyId as string;
      if (!ratePlanName || !propertyId) {
        return res.status(400).json(errorResponse('All fields are required'));
      }
      if(typeof b2bAvailable !== 'boolean' || typeof b2cAvailable !== 'boolean' ){
        return res.status(400).json(errorResponse('B2B and B2C availability must be boolean values'));
      }
      if(minimumLengthOfStay<1){
        return res.status(400).json(errorResponse('Minimum length of stay must be at least 1'));
      }
      if(maximumLengthOfStay && maximumLengthOfStay < minimumLengthOfStay){
        return res.status(400).json(errorResponse('Maximum length of stay must be greater than or equal to minimum length of stay'));
      }
      const serRes = await RatePlanServices.createRatePlan(
        ratePlanName,
        propertyId,
        b2bAvailable,
        b2cAvailable,
        minimumLengthOfStay,
        maximumLengthOfStay
      );
      const status = serRes.success ? 200 : 400;
      return res.status(status).json(serRes);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal server error', error?.message));
    }
  }
  public static async getRatePlansByPropertyIdController(
    req: PropertyCustomRequest,
    res: Response
  ) {
    try {
      const propertyId = req.params.propertyId;
      if (!propertyId) {
        return res
          .status(400)
          .json(errorResponse('Property ID is not provided'));
      }
      const ratePlans =
        await RatePlanServices.getAllRatePlanByPropertyId(propertyId);
      const status = ratePlans.success ? 200 : 400;
      return res.status(status).json(ratePlans);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async updateRatePlan(req: CustomRequest, res: Response) {
    try {
      const ratePlanCode = req.params.ratePlanCode;
      const updateData = req.body;
      if (!ratePlanCode) {
        return res
          .status(400)
          .json(
            errorResponse(
              'Rate Plan code is not provided, go back and try again.'
            )
          );
      }
      const response = await RatePlanServices.updateRatePlan(
        ratePlanCode,
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
  public static async deleteRatePlan(req: CustomRequest, res: Response) {
    try {
      const ratePlanCode = req.params.ratePlanCode;
      if (!ratePlanCode) {
        return res
          .status(400)
          .json(
            errorResponse(
              'Rate Plan code is not provided, go back and try again.'
            )
          );
      }
      const response = await RatePlanServices.deleteRatePlan(ratePlanCode);
      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async getMappedRatePlanByHotel(
    req: CustomRequest,
    res: Response
  ) {
    try {
      if(!req.body.propertyId){
        return res.status(400).json(errorResponse('Property ID is not provided'));
      }
      const hotelCode = await getPropertyIdFromPropertyId(req.body.propertyId);
      if(!hotelCode){
        return res.status(400).json(errorResponse('Hotel code is not provided'));
      }
      const {  roomTypeCode, ratePlanCode, startDate, endDate } =
        req.body;
      const page = Number(req.query?.page) || 1;
      const resultPerPage = 20;
      const response = await RatePlanServices.getMappedRatePlanByHotel(
        hotelCode,
        roomTypeCode && roomTypeCode,
        ratePlanCode && ratePlanCode,
        startDate && new Date(startDate),
        endDate && new Date(endDate),
        page && page,
        resultPerPage && resultPerPage
      );
      if (response.success) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal server Error', error?.message));
    }
  }
  public static async updateMappedRatePlan(req: CustomRequest, res: Response) {
    try {
      const { id, baseGuestAmounts, additionalGuestAmounts } = req.body;
      if (!id) {
        return res.status(400).json(errorResponse('Charge ID is required'));
      }
      if (!baseGuestAmounts || baseGuestAmounts.length === 0) {
        return res.status(400).json(errorResponse('Base Guest Amounts are required'));
      }
      const response = await RatePlanServices.updateMappedRatePlan(
        id,
        { baseGuestAmounts, additionalGuestAmounts: additionalGuestAmounts || [] }
      );
      const statusCode = response.success ? 200 : 400;
      return res.status(statusCode).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal server Error', error?.message));
    }
  }
  public static async addTaxGroupToRatePlan(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const { ratePlanCode, taxGroupId } = req.body;
      if (!ratePlanCode || !taxGroupId) {
        return res
          .status(400)
          .json(errorResponse('Rate Plan code and Tax Group ID are required'));
      }
      const response = await RatePlanServices.addTaxGroupToRatePlan(
        ratePlanCode,
        taxGroupId
      );
      const statusCode = response.success ? 200 : 400;
      return res.status(statusCode).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal server Error', error?.message));
    }
  }
  public static async removeTaxGroupFromRatePlan(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const { ratePlanCode, taxGroupId } = req.body;
      if (!ratePlanCode || !taxGroupId) {
        return res
          .status(400)
          .json(errorResponse('Rate Plan code and Tax Group ID are required'));
      }
      const response = await RatePlanServices.addTaxGroupToRatePlan(
        ratePlanCode,
        taxGroupId
      );
      const statusCode = response.success ? 200 : 400;
      return res.status(statusCode).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal server Error', error?.message));
    }
  }
  // ✅ Add to RatePlanController
public static async updateOrCreateRatePlanCharges(req: CustomRequest, res: Response) {
  try {
    const { 
      propertyCode, 
      roomTypeCode, 
      ratePlanCode, 
      startDate, 
      endDate,
      baseGuestAmounts,
      additionalGuestAmounts 
    } = req.body;

    // Validation
    if (!propertyCode || !roomTypeCode || !ratePlanCode || !startDate || !endDate) {
      return res.status(400).json(
        errorResponse('Property code, room type, rate plan, start date and end date are required')
      );
    }

    if (!baseGuestAmounts || baseGuestAmounts.length === 0) {
      return res.status(400).json(
        errorResponse('Base guest amounts are required')
      );
    }

    const response = await RatePlanServices.updateOrCreateRatePlanCharges(
      propertyCode,
      roomTypeCode,
      ratePlanCode,
      new Date(startDate),
      new Date(endDate),
      baseGuestAmounts,
      additionalGuestAmounts || []
    );

    const statusCode = response.success ? 200 : 400;
    return res.status(statusCode).json(response);
  } catch (error: any) {
    return res
      .status(500)
      .json(errorResponse('Internal server Error', error?.message));
  }
}
}
