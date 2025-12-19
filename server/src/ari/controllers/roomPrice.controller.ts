import { CustomRequest } from '../../utils/customRequest';
import { Response } from 'express';
import { RoomRentCalculationService } from '../services';
import { errorResponse } from '../../utils/return';
export class RoomRentCalculationController {
  public static async getRoomRentController(req: CustomRequest, res: Response) {
    try {
      const {
        propertyId,
        invTypeCode,
        startDate,
        endDate,
        noOfChildren,
        noOfAdults,
        noOfRooms,
        ratePlanCode,
      } = req.body;

      // Validate required fields
      if (!propertyId) {
        return res.status(400).json(errorResponse('Property is not chosen'));
      }
      if (!invTypeCode) {
        return res.status(400).json(errorResponse('Room type is not chosen'));
      }
      if (!ratePlanCode) {
        return res.status(400).json(errorResponse('Rate plan is not chosen'));
      }
      if (!startDate) {
        return res.status(400).json(errorResponse('Start date is not chosen'));
      }
      if (!endDate) {
        return res.status(400).json(errorResponse('End date is not chosen'));
      }

      // Convert and validate guest counts
      const adults = Number(noOfAdults) || 0;
      const children = Number(noOfChildren) || 0;
      const rooms = Number(noOfRooms) || 1;

      if (adults < 1) {
        return res.status(400).json(errorResponse('At least 1 adult is required'));
      }
      if (children < 0) {
        return res.status(400).json(errorResponse("Number of children can't be less than 0"));
      }
      if (rooms < 1) {
        return res.status(400).json(errorResponse('At least 1 room is required'));
      }

      const response = await RoomRentCalculationService.getRoomRentService(
        propertyId,
        invTypeCode,
        new Date(startDate),
        new Date(endDate),
        ratePlanCode,
        children,
        adults,
        rooms
      );

      if (response.success) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (error: any) {
      console.error('Error in getRoomRentController:', error);
      return res.status(500).json(
        errorResponse('Internal server error', error?.message)
      );
    }
  }
}