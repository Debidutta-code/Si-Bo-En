import { Response } from 'express';
import { CustomRequest, PropertyCustomRequest } from '../../utils/customRequest';
import { RoomService, RoomAminityService } from '../services';
import { errorResponse } from '../../utils/return';

export class RoomController {
  public static async createRoom(
    req: CustomRequest,
    res: Response
  ): Promise<Response> {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      const {
        roomName,
        roomType,
        totalRoom,
        roomView,
        floor,
        roomSize,
        roomUnit,
        smokingPolicy,
        maxOccupancy,
        maxNumberOfAdults,
        maxNumberOfChildren,
        numberOfBedrooms,
        numberOfLivingRoom,
        extraBed,
        description,
        image,
        available,
      } = req.body;

      if (
        !roomName ||
        !roomType ||
        !totalRoom ||
        !roomSize ||
        !maxOccupancy ||
        !image ||
        image.length == 0
      ) {
        return res
          .status(400)
          .json(errorResponse('Fill all the necessary fields'));
      }
      if (maxNumberOfAdults + maxNumberOfChildren > maxOccupancy) {
        return res
          .status(400)
          .json(
            errorResponse(
              'Max number of adults and children cannot exceed max occupancy'
            )
          );
      }
      const response = await RoomService.create({
        roomName,
        roomType,
        totalRoom,
        roomView,
        floor,
        roomSize,
        roomUnit,
        smokingPolicy,
        maxOccupancy,
        maxNumberOfAdults,
        maxNumberOfChildren,
        numberOfBedrooms,
        numberOfLivingRoom,
        extraBed,
        description,
        image: image,
        available,
        propertyId: id,
        availableRooms: totalRoom,
      });
      const statusCode = response.success ? 201 : 400;
      return res.status(statusCode).json(response);
    } catch (error: any) {
      return res.status(500).json(errorResponse('Internal server error', error?.message));
    }
  }

  public static async getRoomById(
    req: CustomRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { roomId } = req.params;
      if (!roomId) {
        return res.status(400).json(errorResponse('Room id not found'));
      }
      const response = await RoomService.findById(roomId);
      const statusCode = response.success ? 200 : 400;
      return res.status(statusCode).json(response);
    } catch (error) {
      return res.status(500).json(errorResponse('Internal server error'));
    }
  }

  public static async getAllRooms(
    req: CustomRequest,
    res: Response
  ): Promise<Response> {
    try {
      let isDeleted = false;
      if (req.user?.level == 4) {
        isDeleted = req.query.isDeleted === 'true';
      }
      const available = req.query.available === 'true';
      const response = await RoomService.findAll(isDeleted, available);
      const statusCode = response.success ? 200 : 400;
      return res.status(statusCode).json(response);
    } catch (error) {
      return res.status(500).json(errorResponse('Internal server error'));
    }
  }

  public static async updateRoom(
    req: CustomRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { roomId } = req.params;
      if (!roomId) {
        return res.status(400).json(errorResponse('Room id not found'));
      }
      const roomData = req.body;
      const response = await RoomService.update(roomId, roomData);
      const statusCode = response.success ? 200 : 400;
      return res.status(statusCode).json(response);
    } catch (error) {
      return res.status(500).json(errorResponse('Internal server error'));
    }
  }

  public static async deleteRoom(
    req: CustomRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { roomId } = req.params;

      if (!roomId) {
        return res.status(400).json(errorResponse('Room id not found'));
      }
      const response = await RoomService.delete(roomId);
      const statusCode = response.success ? 200 : 400;
      return res.status(statusCode).json(response);
    } catch (error) {
      return res.status(500).json(errorResponse('Internal server error'));
    }
  }
  public static async getAllRoomsByPropertyId(
    req: CustomRequest,
    res: Response
  ): Promise<Response> {
    try {
      const propertyId = req.params.id;
      if (!propertyId) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      const isDeleted = req.query.isDeleted ? true : false;
      const response = await RoomService.findByPropertyId(propertyId, isDeleted);
      const statusCode = response.success ? 200 : 400;
      return res.status(statusCode).json(response);
    } catch (error) {
      return res.status(500).json(errorResponse('Internal server error'));
    }
  }
  public static async getRoomsForInvSetup(
    req: CustomRequest,
    res: Response
  ): Promise<Response> {
    try {
      const propertyId = req.params.id;
      //console.log("Property ID:", propertyId);
      if (!propertyId) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      const response = await RoomService.findAvailableRoomsForInv(propertyId);
      const statusCode = response.success ? 200 : 400;
      return res.status(statusCode).json(response);
    } catch (error) {
      return res.status(500).json(errorResponse('Internal server error'));
    }
  }
  public static async add360ImageToRoom(
    req: CustomRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { roomId } = req.params;
      if (!roomId) {
        return res.status(400).json(errorResponse('Room id not found'));
      }
      const { view360Link } = req.body;
      if (!view360Link) {
        return res.status(400).json(errorResponse('360 view link is required'));
      }
      const response = await RoomService.view360ImageToRoom(roomId, view360Link);
      const statusCode = response.success ? 200 : 400;
      return res.status(statusCode).json(response);
    } catch (error) {
      return res.status(500).json(errorResponse('Internal server error'));
    }
  }
}

export class RoomAminityController {
  public static async createRoomAminityController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const roomId = req.params.roomId;
      if (!roomId) {
        return res.status(400).json(errorResponse('Room id not found'));
      }
      const { amenities } = req.body;
      if (!amenities) {
        return res
          .status(400)
          .json(
            errorResponse('Aminity is required to create aminity for property')
          );
      }

      const serviceRes = await RoomAminityService.createAminityService(
        roomId,
        amenities
      );
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async findAminityByRoomIdController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const roomId = req.params.roomId;
      if (!roomId) {
        return res.status(400).json(errorResponse('Room id not found'));
      }
      const serviceRes = await RoomAminityService.findAminityByRoomId(roomId);
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async updateAminityByPropertyIdController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const roomId = req.params.roomId;
      if (!roomId) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      const { amenities } = req.body;
      const serviceRes = await RoomAminityService.updateAminityByRoomId(
        roomId,
        amenities
      );
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async deleteAminityByPropertyIdController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const roomId = req.params.roomId;
      if (!roomId) {
        return res.status(400).json(errorResponse('Property roomId not found'));
      }
      const serviceRes = await RoomAminityService.deleteAminityByRoomId(roomId);
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
}
