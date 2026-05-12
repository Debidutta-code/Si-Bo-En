import { Request as ExpressR } from 'express';

export interface AgentRequest extends ExpressR {
    agent?: {
        id: string;
        agentEmail: string;
        agencyId: string;
    };
}
