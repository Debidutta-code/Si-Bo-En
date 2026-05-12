import { errorResponse, successResponse } from '../../../utils';
import { AgentRequest } from '../../utils';
import { Response } from 'express';
import { AgentAuthService } from '../services';
import { IAgentLogin } from '../types';

export class AgentAuthController {
    private authService: AgentAuthService;

    constructor() {
        this.authService = new AgentAuthService();
    }
    public async login(req: AgentRequest, res: Response): Promise<Response> {
        const loginData: IAgentLogin = req.body;
        try {
            const data: IAgentLogin = req.body;
            if (!data.email || data.email.trim() === '') {
                return res.status(400).json(errorResponse('Email is required'));
            }
            if (!data.password || data.password.trim() === '') {
                return res
                    .status(400)
                    .json(errorResponse('Password is required'));
            }
            const result = await this.authService.login(loginData);
            if (result.success) {
                return res
                    .status(200)
                    .cookie('agentAccessToken', result.data.accessToken, {
                        httpOnly: true,
                        secure: true,
                    })
                    .json(successResponse('Login successful'));
            }
            return res.status(401).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Login failed', error.message));
            }
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }

    public async getMe(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const userId = req.agent?.id;
            if (!userId) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'UnAuthorized User, Log in again ',
                            'No Id found in request'
                        )
                    );
            }
            const agent = await this.authService.getMeAgent(userId);
            return res.status(agent ? 200 : 401).json(agent);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to retrieve agent', error.message)
                    );
            }
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
    public async logout(req: AgentRequest, res: Response): Promise<Response> {
        try {
            res.clearCookie('agentAccessToken');
            return res.status(200).json(successResponse('Logout successful'));
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Logout failed', error.message));
            }
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
}
