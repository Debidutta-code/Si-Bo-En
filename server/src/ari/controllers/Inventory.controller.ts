import { Response } from 'express';
import { CustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { InventoryServices } from '../services';
import {getPropertyCode} from "../utils"
import { ICharges } from '../types';
class InventoryController {
  public static async getInventoryController(
    req: CustomRequest,
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
      const serRes = await InventoryServices.getInventoryServices(
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
  public static async getRoomTypeController(req: CustomRequest, res: Response) {
    try {
      const hotelCode = req.params.hotelCode;
      if (!hotelCode) {
        return res.status(400).json(errorResponse('Hotel code not found'));
      }
      const roomTypes =
        await InventoryServices.getAllRoomTypeService(hotelCode);
      const resStatus = roomTypes.success ? 200 : 400;
      return res.status(resStatus).json(roomTypes);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async createNewInventory(req: CustomRequest, res: Response) {
    try {

      const { roomType, startDate, endDate, availableRooms } = req.body;
      const propertyId=req.params.propertyId;
      const propertyCode=await getPropertyCode(propertyId);

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
          .json(errorResponse('Start Date comes must after end Date'));
      }
      const serRes = await InventoryServices.createInventoryService(
        propertyCode,
          roomType,
        startDate,
        endDate,
        availableRooms
      );
      const resStatus = serRes?.success ? 200 : 400;
      return res.status(resStatus).json(serRes);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async mapRatePlans(req: CustomRequest, res: Response) {
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
      const propertyId=req.params.propertyId;
      const propertyCode=await getPropertyCode(propertyId);
      if (!propertyCode) {
        return res
          .status(400)
          .json(
            errorResponse('Property Not Found',"property code is not available")
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
      const serRes = await InventoryServices.mapRatePlanService(
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
}
// export class AllHotelsController {
//   static async allHotels(owner_id: string, role: string, email: string) {
//     try {
//       const response = await AllHotels.getAllHotelsByRole(owner_id, role, email);

//       if (response) {
//         return {
//           success: true,
//           message: "Data fetched successfully",
//           data: response,
//           count: response.length
//         };
//       } else {
//         return {
//           success: false,
//           message: "Something error occurred while fetching data"
//         };
//       }
//     } catch (error: any) {
//       return {
//         success: false,
//         message: "Something error occurred while fetching data",
//         error: error?.message
//       };
//     }
//   }
// }
export { InventoryController };
