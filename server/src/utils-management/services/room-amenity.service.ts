import { errorResponse, IApiResponse, successResponse } from '../../utils';
import { RoomAminityDao } from '../repository';

export class RoomAmenityServices {
    private roomAminityDao: RoomAminityDao;
    constructor() {
        this.roomAminityDao = new RoomAminityDao();
    }
    public async createRoomAmenity(amenities: string[]): Promise<IApiResponse> {
        try {
            const daoRes =
                await this.roomAminityDao.addRoomAmenities(amenities);
            return successResponse('Aminity added successfully', daoRes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create category',
                    error?.message
                );
            }
            return errorResponse('Failed to create category', 'Unknown error');
        }
    }
    public async getRoomAmenity(): Promise<IApiResponse> {
        try {
            const daoRes = await this.roomAminityDao.getAllRoomAmenities();
            return successResponse('Aminity fetched Successfully', daoRes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch aminity', error?.message);
            }
            return errorResponse('Failed to fetch aminity', 'Unknown error');
        }
    }
    public async deleteRoomAmenity(amenities: string[]): Promise<IApiResponse> {
        try {
            const daoRes = await this.roomAminityDao.deleteAmenities(amenities);
            return successResponse('Aminity Deleted Successfully', daoRes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete aminity',
                    error?.message
                );
            }
            return errorResponse('Failed to delete aminity', 'Unknown error');
        }
    }
}
