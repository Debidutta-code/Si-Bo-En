import { Response } from 'express';
import {
    CustomRequest,
    PropertyCustomRequest,
} from '../../utils/customRequest';
import { RoomService, RoomAminityService } from '../services';
import { errorResponse } from '../../utils/return';

export class RoomController {
    private roomService: RoomService;
    constructor() {
        this.roomService = new RoomService();
    }
    public async createRoom(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const id = req.params.id;
            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Property id not found'));
            }
            const {
                roomName,
                roomType,
                totalRoom,
                RoomViews,
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
                priority,
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
            // if (maxNumberOfAdults + maxNumberOfChildren > maxOccupancy) {
            //   return res
            //     .status(400)
            //     .json(
            //       errorResponse(
            //         'Max number of adults and children cannot exceed max occupancy'
            //       )
            //     );
            // }
            if (maxNumberOfAdults > maxOccupancy) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Max number of adults cannot exceed max occupancy'
                        )
                    );
            }
            if (maxNumberOfChildren >= maxOccupancy) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Max number of children cannot exceed max occupancy'
                        )
                    );
            }

            const response = await this.roomService.create({
                roomName,
                roomType,
                totalRoom,
                RoomViews,
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
                propertyId: id,
                priority,
            });
            const statusCode = response.success ? 201 : 400;
            return res.status(statusCode).json(response);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }

    public async getRoomById(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { roomId } = req.params;
            if (!roomId) {
                return res.status(400).json(errorResponse('Room id not found'));
            }
            const response = await this.roomService.findById(roomId);
            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error) {
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }
    public async updateRoom(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { roomId } = req.params;
            if (!roomId) {
                return res.status(400).json(errorResponse('Room id not found'));
            }
            const roomData = req.body;
            const { maxOccupancy, maxNumberOfAdults, maxNumberOfChildren } = roomData;
            if (maxNumberOfAdults > maxOccupancy) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Max number of adults cannot exceed max occupancy'
                        )
                    );
            }
            if (maxNumberOfChildren >= maxOccupancy) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Max number of children must less than max occupancy'
                        )
                    );
            }

            const response = await this.roomService.update(roomId, roomData);
            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error) {
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }

    public async deleteRoom(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { roomId } = req.params;

            if (!roomId) {
                return res.status(400).json(errorResponse('Room id not found'));
            }
            const response = await this.roomService.delete(roomId);
            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error) {
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }
    public async getAllRoomsByPropertyId(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const propertyId = req.params.id;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property id not found'));
            }
            const isDeleted = req.query.isDeleted ? true : false;
            const response = await this.roomService.findByPropertyId(
                propertyId,
                isDeleted
            );
            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error) {
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }
    public async getRoomsForInvSetup(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const propertyId = req.params.id;
            //console.log("Property ID:", propertyId);
            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property id not found'));
            }
            const response =
                await this.roomService.findAvailableRoomsForInv(propertyId);
            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error) {
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }
    public async add360ImageToRoom(
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
                return res
                    .status(400)
                    .json(errorResponse('360 view link is required'));
            }
            const response = await this.roomService.view360ImageToRoom(
                roomId,
                view360Link
            );
            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error) {
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }
}

export class RoomAminityController {
    private roomAminityService: RoomAminityService;
    constructor() {
        this.roomAminityService = new RoomAminityService();
    }
    public async createRoomAminityController(
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
                        errorResponse(
                            'Aminity is required to create aminity for property'
                        )
                    );
            }

            const serviceRes =
                await this.roomAminityService.createAminityService(
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
    public async findAminityByRoomIdController(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const roomId = req.params.roomId;
            if (!roomId) {
                return res.status(400).json(errorResponse('Room id not found'));
            }
            const serviceRes =
                await this.roomAminityService.findAminityByRoomId(roomId);
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
    public async updateAminityByPropertyIdController(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const roomId = req.params.roomId;
            if (!roomId) {
                return res
                    .status(400)
                    .json(errorResponse('Property id not found'));
            }
            const { amenities } = req.body;
            const serviceRes =
                await this.roomAminityService.updateAminityByRoomId(
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
    public async deleteAminityByPropertyIdController(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const roomId = req.params.roomId;
            if (!roomId) {
                return res
                    .status(400)
                    .json(errorResponse('Property roomId not found'));
            }
            const serviceRes =
                await this.roomAminityService.deleteAminityByRoomId(roomId);
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
