import {
    IApiResponse,
    errorResponse,
    assignToken,
    PropertyRequest,
} from '../../utils';
import { Response, Request } from 'express';
import { LoyalityUserService } from '../services';
import { CustomRequest } from '../../utils/customRequest';

export class LoyalityUserController {
    private loyalityLoginService: LoyalityUserService;
    constructor() {
        this.loyalityLoginService = new LoyalityUserService();
    }

    public async getMe(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const userId = req.loyaltyUser?.id;
            if (!userId) {
                return res.status(401).json(errorResponse('Not authenticated'));
            }
            const result = await this.loyalityLoginService.getMe(userId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Error fetching profile', error.message)
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Error fetching profile'));
        }
    }

    public async getByUserId(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.params.id;
            if (!userId) {
                return res
                    .status(400)
                    .json(errorResponse('User ID is required'));
            }
            const result = await this.loyalityLoginService.getByUserId(userId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error occured while fetching loyality guest',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Error occured while fetching loyality guest')
                );
        }
    }
}
