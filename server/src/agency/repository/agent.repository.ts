import { prisma } from '../../config';
import { IAgents, ICAgents } from '../types';

export class AgentRepository {
    public async getAgentByEmail(email: string): Promise<IAgents | null> {
        try {
            return await prisma.agents.findUnique({
                where: { agentEmail: email },
            });
        } catch (error) {
            throw new Error(`Failed to get agent by email`);
        }
    }

    // ← NEW: fetch by primary key (id), used in deleteAgent before deleting
    public async getAgentById(id: string): Promise<IAgents | null> {
        try {
            return await prisma.agents.findUnique({ where: { id } });
        } catch (error) {
            throw new Error(`Failed to get agent by id`);
        }
    }

    public async createAgent(data: ICAgents): Promise<IAgents> {
        try {
            return await prisma.agents.create({ data });
        } catch (error) {
            throw new Error(`Failed to create agent`);
        }
    }

    public async updateAgent(id: string, data: ICAgents): Promise<IAgents> {
        try {
            return await prisma.agents.update({ where: { id }, data });
        } catch (error) {
            throw new Error(`Failed to update agent`);
        }
    }

    public async deleteAgent(id: string): Promise<void> {
        try {
            await prisma.agents.delete({ where: { id } });
        } catch (error) {
            throw new Error(`Failed to delete agent`);
        }
    }

    public async getAgencies(
        agencyId: string,
        skip: number,
        take: number
    ): Promise<IAgents[]> {
        try {
            return await prisma.agents.findMany({
                where: { agencyId },
                skip,
                take,
            });
        } catch (error) {
            throw new Error(`Failed to get agents`);
        }
    }

    public async getAgentsCount(agencyId: string): Promise<number> {
        try {
            return await prisma.agents.count({ where: { agencyId } });
        } catch (error) {
            throw new Error(`Failed to get agents count`);
        }
    }
}
