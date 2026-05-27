import { Request, Response } from 'express';
import { errorResponse, IApiResponse, successResponse } from '../../utils';
import { CustomerService } from '../services';
import { CustomRequest } from '../../utils/customRequest';
import { ICustomer } from '../types';

export class CustomerController {
    private customerService: CustomerService;
    constructor() {
        this.customerService = new CustomerService();
    }
    private validatePassword(password: string): string | null {
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!/\d/.test(password)) {
            return "Password must contain at least one number";
        }
        if (!/^[A-Za-z\d]+$/.test(password)) {
            return "Password contains invalid characters";
        }
        return null;
    };

    public async register(req: Request, res: Response): Promise<Response<IApiResponse>> {
        try {
            const { firstName, lastName, email, password } = req.body;
            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json(errorResponse('All fields are required'));
            }
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json(errorResponse('Invalid email address'));
            }

            const passwordError = this.validatePassword(password);
            if (passwordError) {
                return res.status(400).json(errorResponse(passwordError));
            }

            const result = await this.customerService.register(firstName, lastName, email, password);
            if (!result.success) {
                return res.status(400).json(result);
            }
            return res
                .status(201)
                .json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error occurred while registering',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Error occurred while registering'));
        }
    }

    public async login(req: Request, res: Response): Promise<Response<IApiResponse>> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json(errorResponse('Email and password are required'));
            }
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json(errorResponse('Invalid email address'));
            }
            const result = await this.customerService.login(email, password);
            if (!result.success) {
                return res.status(401).json(result);
            }
            return res
                .status(200)
                .cookie('customerToken', result.data?.accessToken, {
                    httpOnly: true,
                    secure: true,
                })
                .json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error occurred while logging in',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Error occurred while logging in'));
        }
    }

    public async getMe(req: CustomRequest, res: Response): Promise<Response<IApiResponse<ICustomer|null>>> {
        try {
            const customerId = req.customer?.id;
            if (!customerId) {
                return res.status(401).json(errorResponse('Not authenticated'));
            }
            const result = await this.customerService.getMe(customerId);
            return res.status(result.success ? 200 : 401).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error occurred while fetching profile',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Error occurred while fetching profile'));
        }
    }

    public async updatePassword(req: CustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const email = req.customer?.email;
            if (!email) {
                return res.status(401).json(errorResponse('Not authenticated'));
            }
            const { password } = req.body;
            if (!password) {
                return res.status(400).json(errorResponse('Password is required'));
            }
            const result = await this.customerService.updatePassword(email, password);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error occurred while updating password',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Error occurred while updating password'));
        }
    }

    public async logout(req: Request, res: Response): Promise<Response<IApiResponse>> {
        res.clearCookie('customerToken');
                res.clearCookie('loyalty_token');

        
        return res.status(200).json(successResponse('Logged out successfully'));
    }
}