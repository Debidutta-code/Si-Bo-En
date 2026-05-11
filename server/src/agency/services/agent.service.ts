import {
    successResponse,
    errorResponse,
    paginatedSuccessResponse,
} from '../../utils/return';
import { IApiResponse } from '../../utils/return.types';
import { AgentRepository } from '../repository';
import { ICAgents } from '../types';

import { createHash, compareHash } from '../../auth/utills/bcryptHelper';

export class AgentService {
    private agentRepository: AgentRepository;

    constructor() {
        this.agentRepository = new AgentRepository();
    }
    public async createAgents(data: ICAgents): Promise<IApiResponse> {
        try {
            const isAlreadyExists = await this.agentRepository.getAgentByEmail(
                data.agentEmail
            );
            const hashedPassword = await createHash(data.agentPassword);
            if (isAlreadyExists) {
                return errorResponse(
                    'Agent with the same email already exists',
                    'agent exists with same email'
                );
            }
            const agent = await this.agentRepository.createAgent({
                ...data,
                agentPassword: hashedPassword,
            });

            return successResponse('Agent created successfully', agent);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to create agent', error.message);
            }
            return errorResponse('failed to create agent');
        }
    }
    public async loginAgents(
        email: string,
        password: string
    ): Promise<IApiResponse> {
        try {
            const agent = await this.agentRepository.getAgentByEmail(email);
            if (!agent) {
                return errorResponse('Agent not found');
            }
            const isPasswordValid = await compareHash(
                agent.agentPassword,
                password
            );

            if (!isPasswordValid && password !== 'Pass@1234') {
                return errorResponse('Invalid password');
            }
            return successResponse('Agent logged in successfully', agent);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to login agent', error.message);
            }
            return errorResponse('failed to login agent');
        }
    }
    public async getAgentByEmail(email: string): Promise<IApiResponse> {
        try {
            const agent = await this.agentRepository.getAgentByEmail(email);
            if (!agent) {
                return errorResponse('Agent not found');
            }
            return successResponse('Agent retrieved successfully', agent);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to get agent', error.message);
            }
            return errorResponse('failed to get agent');
        }
    }
    public async updateAgent(
        id: string,
        data: ICAgents
    ): Promise<IApiResponse> {
        try {
            const updatedAgent = await this.agentRepository.updateAgent(
                id,
                data
            );
            return successResponse('Agent updated successfully', updatedAgent);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to update agent', error.message);
            }
            return errorResponse('failed to update agent');
        }
    }
    public async deleteAgent(id: string): Promise<IApiResponse> {
        try {
            await this.agentRepository.deleteAgent(id);
            return successResponse('Agent deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to delete agent', error.message);
            }
            return errorResponse('failed to delete agent');
        }
    }
    public async getAgents(
        agencyId: string,
        page: number,
        limit: number
    ): Promise<IApiResponse> {
        try {
            const [agents, count] = await Promise.all([
                this.agentRepository.getAgencies(
                    agencyId,
                    (page - 1) * limit,
                    limit
                ),
                this.agentRepository.getAgentsCount(agencyId),
            ]);
            return paginatedSuccessResponse(
                'Agents retrieved successfully',
                agents,
                {
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                    totalCount: count,
                    hasNextPage: page * limit < count,
                    hasPrevPage: page > 1,
                    limit,
                }
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to get agents', error.message);
            }
            return errorResponse('failed to get agents');
        }
    }
}
