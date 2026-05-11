import { Request, Response } from 'express';
import { PropertyWishService } from '../services';
import { errorResponse, IApiResponse } from '../../../utils';
import { IOtaCustomRequest } from '../../../utils/customRequest';

export class PropertyWishController {
    private propertyWishService: PropertyWishService;

    constructor() {
        this.propertyWishService = new PropertyWishService();
    }

    public async addToWishlist(
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

            const { propertyId } = req.body;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid request',
                            'Property ID is required'
                        )
                    );
            }

            const result = await this.propertyWishService.addToWishlist(
                propertyId,
                otaUser.id
            );
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to add property to wishlist',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to add property to wishlist',
                        'Unknown error'
                    )
                );
        }
    }

    public async removeFromWishlist(
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

            const { propertyId } = req.params;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid request',
                            'Property ID is required'
                        )
                    );
            }

            const result = await this.propertyWishService.removeFromWishlist(
                propertyId,
                otaUser.id
            );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to remove property from wishlist',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to remove property from wishlist',
                        'Unknown error'
                    )
                );
        }
    }

    public async getWishlistForUser(
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

            const result = await this.propertyWishService.getWishlistForUser(
                otaUser.id
            );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to fetch wishlist', error.message)
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to fetch wishlist', 'Unknown error')
                );
        }
    }
}
