import { successResponse, errorResponse } from '../../utils/return';
import { IApiResponse } from '../../utils/return.types';
import { RoomDao, RoomAmenityDao } from '../repository';
import {RatePlanRepository} from "../../ari/repository/ratePlan.repository"
export class RoomService {
  public static async create(roomData: any) {
    try {
      const room = await RoomDao.findByRoomName(
        roomData.propertyId,
        roomData.roomName
      );
      if (room) {
        return errorResponse(
          `Room with Name ${roomData.roomName}  already exits for this property`
        );
      }
      const createdRoom = await RoomDao.create(roomData);
      if (createdRoom) {
        return successResponse('Room created successfully', createdRoom);
      } else {
        return errorResponse('Failed to create room');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async findById(id: string): Promise<any> {
    try {
      const room = await RoomDao.findById(id);
      if (room) {
        return successResponse('Room fetched successfully', room);
      } else {
        return errorResponse('Room not found');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async findAll(
    isDeleted: boolean,
    available: boolean
  ): Promise<any> {
    try {
      const rooms = await RoomDao.findAll(isDeleted, available);
      if (rooms) {
        return successResponse('Rooms fetched successfully', rooms);
      } else {
        return successResponse('No rooms found', []);
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async update(
    id: string,
    roomData: Partial<any>
  ): Promise<any> {
    try {
      const isExists = await RoomDao.findById(id);
      if (!isExists) {
        return errorResponse('Room Does not exists');
      }
      const updatedRoom = await RoomDao.update(id, roomData);
      if (updatedRoom) {
        return successResponse('Room updated successfully', updatedRoom);
      } else {
        return errorResponse('Room not found or failed to update');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async delete(id: string): Promise<any> {
    try {
      const room = await RoomDao.findById(id);
      if (!room) {
        return errorResponse('Room does not exists');
      }
      const property=await RoomDao.findByRoomId(id)
      const propertyCode=property?.property.propertyCode;
      if(!propertyCode){
        return errorResponse('Property code not found');
      }
      await RatePlanRepository.deleteCharges(room?.roomType,propertyCode);
      const deletedRoom = await RoomDao.delete(id);
      if (deletedRoom) {
        return successResponse('Room successfully', deletedRoom);
      } else {
        return errorResponse('Room not found or already deleted');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async findByPropertyId(propertyId: string,isDeleted:boolean=true): Promise<any> {
    try {
      const rooms = await RoomDao.getRoomsByPropertyId(propertyId,isDeleted)
      if (rooms) {
        return successResponse('Rooms fetched successfully', rooms);
      } else {
        return successResponse('No rooms found for this property', []);
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async findAvailableRoomsForInv(propertyId: string): Promise<any> {
    try {
      const rooms = await RoomDao.getAllPropertyRoomsForInvSetup(propertyId)
      if (rooms) {
        return successResponse('Available Rooms fetched successfully', rooms);
      } else {
        return successResponse('No available rooms found for this property', []);
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async view360ImageToRoom(roomId: string, link: string): Promise<IApiResponse> {
    try {
      const updatedRoom = await RoomDao.add360ViewLinkToRoom(roomId, link);
      if (updatedRoom) {
        return successResponse('360 view link added successfully', updatedRoom);
      } else {
        return errorResponse('Failed to add 360 view link');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
}
export class RoomAminityService {
  public static async createAminityService(
    roomId: string,
    amenities: Record<string, boolean>
  ) {
    try {
      //console.log("roomId", roomId, "amenities", amenities);
      const isExists = await RoomAmenityDao.existsByRoomId(roomId);
      if (isExists) {
        return errorResponse('Amenity already exists for this room');
      }
      const daoRes = await RoomAmenityDao.createAmenities(roomId, amenities);
      if (daoRes) {
        return successResponse('Room aminity created successfully', daoRes);
      } else {
        return errorResponse('Failed to add room aminity');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async findAminityByRoomId(roomId: string) {
    try {
      const daoRes = await RoomAmenityDao.getActiveAmenities(roomId);
      if (daoRes) {
        if (daoRes.length == 0) {
          return errorResponse("No Aminity available FOr this room")
        }
        return successResponse('Room Aminity fetched successfully', daoRes);
      } else {
        return errorResponse('Failed to fetch room aminity');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async updateAminityByRoomId(
    roomId: string,
    amenities: Record<string, boolean>
  ) {
    try {
      const daoRes = await RoomAmenityDao.updateByRoomId(roomId, amenities);
      if (daoRes) {
        return successResponse('Room Aminity Updated successfully', daoRes);
      } else {
        return errorResponse('Failed to update room aminity');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async deleteAminityByRoomId(roomId: string) {
    try {
      const daoRes = await RoomAmenityDao.deleteByRoomId(roomId);
      if (daoRes) {
        return successResponse('Room Aminity deleted successfully', daoRes);
      } else {
        return errorResponse('Failed to fetch room aminity');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
}
