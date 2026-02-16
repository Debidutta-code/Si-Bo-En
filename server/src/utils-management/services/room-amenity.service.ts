import { errorResponse, IApiResponse, successResponse } from "../../utils";
import { RoomAminityDao } from "../repository";

export class RoomAmenityServices {
  public static async createRoomAmenity(amenities: string[]) :Promise<IApiResponse>{
    try {
      const daoRes = await RoomAminityDao.addRoomAmenities(amenities);
      return successResponse('Aminity added successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to create category', error?.message);
    }
  }
  public static async getRoomAmenity() :Promise<IApiResponse>{
    try {
      const daoRes = await RoomAminityDao.getAllRoomAmenities();
      return successResponse('Aminity fetched Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to fetch aminity', error?.message);
    }
  }
  public static async deleteRoomAmenity(amenities: string[]) :Promise<IApiResponse>{
    try {
      const daoRes = await RoomAminityDao.deleteAmenities(amenities);
      return successResponse('Aminity Deleted Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to delete aminity', error?.message);
    }
  }
}