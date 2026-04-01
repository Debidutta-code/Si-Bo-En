import { Response } from 'express';
import { CustomRequest, PropertyCustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { InventoryServices } from '../services';
import { getPropertyCode } from "../utils"
import { ICharges } from '../types';

class InventoryController {
  inventoryServices: InventoryServices;
  constructor() {
    this.inventoryServices = new InventoryServices();
  }
  public async getInventoryController(
    req: PropertyCustomRequest,
    res: Response
  ) {
    try {
      const { hotelCode, invTypeCode, startDate, endDate } = req.body;
      const currentPage = req.query.page;
      const resultPerPage = req.query.itemsPerPage;
      if (!hotelCode) {
        return res
          .status(400)
          .json(errorResponse('Hotel code is must required field'));
      }
      const serRes = await this.inventoryServices.getInventoryServices(
        hotelCode,
        Number(currentPage),
        Number(resultPerPage),
        startDate,
        endDate,
        invTypeCode
      );
      const resStatus = serRes?.success ? 200 : 400;
      return res.status(resStatus).json(serRes);
    } catch (error: any) {
      return {
        success: false,
        message: 'Error occur while getting all the inventory data',
        error: error.message,
      };
    }
  }
  public async getRoomTypeController(req: PropertyCustomRequest, res: Response) {
    try {
      const hotelCode = req.params.hotelCode;
      if (!hotelCode) {
        return res.status(400).json(errorResponse('Hotel code not found'));
      }
      const roomTypes =
        await this.inventoryServices.getAllRoomTypeService(hotelCode);
      const resStatus = roomTypes.success ? 200 : 400;
      return res.status(resStatus).json(roomTypes);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public async createNewInventory(req: PropertyCustomRequest, res: Response) {
    try {
      const { roomType, startDate, endDate, availableRooms, pushFromCalender } = req.body;
      const propertyId = req.params.propertyId;
      const propertyCode = await getPropertyCode(propertyId);

      if (
        !propertyCode ||
        !roomType ||
        !startDate ||
        !endDate ||
        !availableRooms
      ) {
        return res
          .status(400)
          .json(
            errorResponse(
              'Missing required fields to create an inventory record'
            )
          );
      }
      if (new Date(startDate) > new Date(endDate)) {
        return res
          .status(400)
          .json(errorResponse('Start Date must come before end Date'));
      }
      const serRes = await this.inventoryServices.createInventoryService(
        propertyCode,
        roomType,
        startDate,
        endDate,
        availableRooms,
        pushFromCalender
      );
      const resStatus = serRes?.success ? 200 : 400;
      return res.status(resStatus).json(serRes);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public async mapRatePlans(req: PropertyCustomRequest, res: Response) {
    try {
      const {
        ratePlanCode,
        ratePlanName,
        roomTypeCode,
        roomTypeName,
        baseByGuestAmounts,
        additionalGuestAmounts,
        currencyCode,
        startDate,
        endDate
      } = req.body;
      const propertyId = req.params.propertyId;
      const propertyCode = await getPropertyCode(propertyId);
      if (!propertyCode) {
        return res
          .status(400)
          .json(
            errorResponse('Property Not Found', "property code is not available")
          );
      }
      if (
        !roomTypeCode ||
        !ratePlanCode ||
        !baseByGuestAmounts ||
        !additionalGuestAmounts ||
        !ratePlanName ||
        !roomTypeName ||
        !currencyCode ||
        !startDate ||
        !endDate
      ) {
        return res.status(400).json(errorResponse('All fields are required'));
      }
      const serRes = await this.inventoryServices.mapRatePlanService(
        propertyId,
        propertyCode,
        roomTypeName,
        roomTypeCode,
        ratePlanName,
        ratePlanCode,
        baseByGuestAmounts,
        additionalGuestAmounts,
        currencyCode,
        startDate,
        endDate
      );
      const resStatus = serRes?.success ? 200 : 400;
      return res.status(resStatus).json(serRes);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public async getRoomAvailibility(req: PropertyCustomRequest, res: Response) {
    try {
      const { propertyId, roomType } = req.body;
      if (!propertyId || !roomType) {
        return res
          .status(400)
          .json(errorResponse('Missing required fields to get date based availability'));
      }
      const propertyCode = await getPropertyCode(propertyId);
      if (!propertyCode) {
        return res
          .status(400)
          .json(
            errorResponse('Property Not Found', "property code is not available")
          );
      }
      const serRes = await this.inventoryServices.getRoomAvailabilityService(
        propertyCode,
        roomType,
      );
      const resStatus = serRes?.success ? 200 : 400;
      return res.status(resStatus).json(serRes);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
}
export { InventoryController };
