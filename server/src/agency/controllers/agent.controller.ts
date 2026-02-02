import { errorResponse } from "../../utils/return";
import { CustomRequest } from "../../utils/customRequest";
import { Request, Response } from "express";
import { ICAgents } from "../types";
import { AgentService } from "../services";

export class AgentController {
    private agentService: AgentService;

    constructor() {
        this.agentService = new AgentService();
    }
    
    public async createAgent(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { agencyId, agentName, agentEmail, agentPhone, agentPassword } = req.body;
            if (!agencyId || !agentName || !agentEmail || !agentPhone || !agentPassword) {
                return res.status(400).json(errorResponse("All fields are required"));
            }
            const result = await this.agentService.createAgents({
                agencyId,
                agentName,
                agentEmail,
                agentPhone,
                agentPassword
            });
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to create agent", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to create agent"));
        }
    }

    public async loginAgent(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json(errorResponse("Email and password are required"));
            }
            const result = await this.agentService.loginAgents(email, password);
            return res.status(result.success ? 200 : 401).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to login agent", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to login agent"));
        }
    }

    public async getAgentByEmail(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { email } = req.params;
            if (!email) {
                return res.status(400).json(errorResponse("Email is required"));
            }
            const result = await this.agentService.getAgentByEmail(email);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to get agent", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to get agent"));
        }
    }

    public async updateAgent(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { agencyId, agentName, agentEmail, agentPhone, agentPassword } = req.body;
            if (!id) {
                return res.status(400).json(errorResponse("Agent id is required"));
            }
            if (!agencyId || !agentName || !agentEmail || !agentPhone) {
                return res.status(400).json(errorResponse("All fields are required"));
            }
            const updateData: ICAgents = {
                agencyId,
                agentName,
                agentEmail,
                agentPhone,
                agentPassword
            };
            const result = await this.agentService.updateAgent(id, updateData);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to update agent", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to update agent"));
        }
    }

    public async deleteAgent(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json(errorResponse("Agent id is required"));
            }
            const result = await this.agentService.deleteAgent(id);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to delete agent", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to delete agent"));
        }
    }

    public async getAgents(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { agencyId } = req.params;
            const { page, limit } = req.query;
            if (!agencyId) {
                return res.status(400).json(errorResponse("agencyId is required"));
            }
            const pageNum = page ? Number(page) : 1;
            const limitNum = limit ? Number(limit) : 10;
            const result = await this.agentService.getAgents(agencyId, pageNum, limitNum);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("failed to get agents", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "failed to get agents"));
        }
    }
}
