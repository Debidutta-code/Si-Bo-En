import { CustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { RoomAmenityServices } from '../services';
import { Response } from 'express';
export class RoomAminityController {
    private roomAmenityServices: RoomAmenityServices;
    constructor() {
        this.roomAmenityServices = new RoomAmenityServices();
    }
    public async createRoomAminity(req: CustomRequest, res: Response) {
        try {
            const { amenities } = req.body;
            if (!amenities || amenities.length == 0) {
                return res.status(400).json(errorResponse('Aminity is empty'));
            }
            const serRes =
                await this.roomAmenityServices.createRoomAmenity(amenities);
            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async getRoomAmenities(req: CustomRequest, res: Response) {
        try {
            const serRes = await this.roomAmenityServices.getRoomAmenity();
            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async deleteRoomAmenities(req: CustomRequest, res: Response) {
        try {
            const { amenities } = req.body;
            if (!amenities) {
                return res
                    .status(400)
                    .json(errorResponse('Aminity is required to delete'));
            }
            const serRes =
                await this.roomAmenityServices.deleteRoomAmenity(amenities);
            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
}
