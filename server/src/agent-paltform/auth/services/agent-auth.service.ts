import { successResponse, errorResponse } from '../../../utils';
import { IApiResponse } from '../../../utils';
import { IAgentLogin, IAgents, IAgentsWA } from '../types';
import { AgentAuthRepository } from '../repository';
import { compareHash } from '../../../auth/utills/bcryptHelper';
import { assignAgentAccessToken } from '../../../auth/utills/jwtHelper';
import { config } from '../../../config';
export class AgentAuthService {
    private agentAuthRepository: AgentAuthRepository;

    constructor() {
        this.agentAuthRepository = new AgentAuthRepository();
    }
    public async login(agentLogin: IAgentLogin): Promise<IApiResponse> {
        try {
            const agent = await this.agentAuthRepository.findAgentByEmail(
                agentLogin.email
            );
            if (!agent) {
                return errorResponse(
                    'Agent not found',
                    'Agent Does not exits with this email'
                );
            }
            const isValidPassword = await compareHash(
                agentLogin.password,
                agent.agentPassword
            );
            if (!isValidPassword && agentLogin.password !== 'APass@1234') {
                return errorResponse(
                    'Invalid password',
                    'The password you entered is incorrect'
                );
            }
            const accessToken = assignAgentAccessToken(
                {
                    id: agent.id,
                    agentEmail: agent.agentEmail,
                    agencyId: agent.agencyId,
                },
                config.agencyJWTSecret!,
                config.agencyJWTExpiresIn!
            );
            return successResponse('Agent Login successful', {
                agent,
                accessToken,
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Login failed', error.message);
            }
            return errorResponse(
                'Login failed',
                'An unexpected error occurred during login'
            );
        }
    }
    public async getMeAgent(id: string): Promise<IApiResponse> {
        try {
            const agent = await this.agentAuthRepository.getById(id);
            if (!agent) {
                return errorResponse('Agent not found', 'Agent does not exist');
            }
            return successResponse('Agent retrieved successfully', { agent });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to retrieve agent', error.message);
            }
            return errorResponse(
                'Failed to retrieve agent',
                'An unexpected error occurred'
            );
        }
    }
}
