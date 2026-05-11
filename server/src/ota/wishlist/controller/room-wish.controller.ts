import { Request, Response } from 'express';
import { RoomWishService } from '../services';
import { errorResponse, IApiResponse } from '../../../utils';
import { IOtaCustomRequest } from '../../../utils/customRequest';

export class RoomWishController {
    private roomWishService: RoomWishService;

    constructor() {
        this.roomWishService = new RoomWishService();
    }

    public async addRoomToWishlist(
        req: IOtaCustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const otaUser = req.otaUser;
            if (!otaUser) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'Authorization failed, Login again',
                            'User not found'
                        )
                    );
            }

            const { roomId } = req.body;
            if (!roomId) {
                return res
                    .status(400)
                    .json(
                        errorResponse('Invalid request', 'Room ID is required')
                    );
            }

            const result = await this.roomWishService.addRoomToWishlist(
                roomId,
                otaUser.id
            );
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to add room to wishlist',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to add room to wishlist',
                        'Unknown error'
                    )
                );
        }
    }

    public async removeRoomFromWishlist(
        req: IOtaCustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const otaUser = req.otaUser;
            if (!otaUser) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'Authorization failed, Login again',
                            'User not found'
                        )
                    );
            }

            const { roomId } = req.params;
            if (!roomId) {
                return res
                    .status(400)
                    .json(
                        errorResponse('Invalid request', 'Room ID is required')
                    );
            }

            const result = await this.roomWishService.removeRoomFromWishlist(
                roomId,
                otaUser.id
            );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to remove room from wishlist',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to remove room from wishlist',
                        'Unknown error'
                    )
                );
        }
    }

    public async getRoomsInWishlist(
        req: IOtaCustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const otaUser = req.otaUser;
            if (!otaUser) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'Authorization failed, Login again',
                            'User not found'
                        )
                    );
            }

            const { propertyWishlistId } = req.params;
            if (!propertyWishlistId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid request',
                            'Property Wishlist ID is required'
                        )
                    );
            }

            const result =
                await this.roomWishService.getRoomsInWishlist(
                    propertyWishlistId
                );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch rooms in wishlist',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch rooms in wishlist',
                        'Unknown error'
                    )
                );
        }
    }
}
