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

    /** Flow 1: Login with password */
    public async loginUser(req: Request, res: Response): Promise<Response> {
        try {
            const { email, password } = req.body;
            const emailRegex =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res
                    .status(400)
                    .json(errorResponse('Invalid email Address'));
            }
            if (!password) {
                return res
                    .status(400)
                    .json(errorResponse('Password is required'));
            }
            const result = await this.loyalityLoginService.loginUser(
                email,
                password
            );
            if (!result.success) {
                return res.status(401).json(result);
            }
            return res
                .status(200)
                .cookie('loyaltyToken', result.data?.accessToken, {
                    httpOnly: true,
                    secure: true,
                })
                .json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .send(
                        errorResponse(
                            'Error occured while logging in',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .send(errorResponse('Error occured while logging in'));
        }
    }

    /** Flow 2 — Step 1: Send OTP to registered email (passwordless) */
    public async loginWithEmail(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const { email } = req.body;
            const emailRegex =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!email || !emailRegex.test(email)) {
                return res
                    .status(400)
                    .json(errorResponse('Valid email is required'));
            }
            const result =
                await this.loyalityLoginService.loginWithEmail(email);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error occured while sending OTP',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Error occured while sending OTP'));
        }
    }

    /** Step 3: Update (set) password after OTP is verified */
    public async updatePassword(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res
                    .status(400)
                    .json(errorResponse('All Fields are required'));
            }
            const emailRegex =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res
                    .status(400)
                    .json(errorResponse('Invalid email Address'));
            }
            const result = await this.loyalityLoginService.updatePassword(
                email,
                password
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error occured while updating password',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Error occured while updating password'));
        }
    }

    /** Protected: GET /me — uses loyaltyToken cookie via middleware */
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
                return res.status(500).json(errorResponse('Error fetching profile', error.message));
            }
            return res.status(500).json(errorResponse('Error fetching profile'));
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
