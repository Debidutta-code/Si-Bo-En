import {
    agentLogin,
    createAgent,
    deleteAgent,
    getAgentByEmail,
    getAgentById,
    updateAgent
} from "../api";
import type { ICAgents } from "../interfaces";

export const agentLoginService = async (email: string, password: string) => {
    try {
        if (!email || !email.trim()) {
            return {
                success: false,
                message: "Email is required"
            };
        }
        if (!password || !password.trim()) {
            return {
                success: false,
                message: "Password is required"
            };
        }
        const response = await agentLogin(email, password);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to login agent, try again later"
        };
    }
};

export const createAgentService = async (agentData: ICAgents) => {
    try {
        if (!agentData.agencyId) {
            return {
                success: false,
                message: "Agency is required"
            };
        }
        if (!agentData.agentName || !agentData.agentName.trim()) {
            return {
                success: false,
                message: "Agent name is required"
            };
        }
        if (!agentData.agentEmail || !agentData.agentEmail.trim()) {
            return {
                success: false,
                message: "Agent email is required"
            };
        }
        if (!agentData.agentPhone || !agentData.agentPhone.trim()) {
            return {
                success: false,
                message: "Agent phone is required"
            };
        }
        if (!agentData.agentPassword || !agentData.agentPassword.trim()) {
            return {
                success: false,
                message: "Agent password is required"
            };
        }
        const response = await createAgent(agentData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create agent, try again later"
        };
    }
};

export const getAgentByIdService = async (id: string) => {
    try {
        if (!id || !id.trim()) {
            return {
                success: false,
                message: "Agent ID is required"
            };
        }
        const response = await getAgentById(id);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve agent, try again later"
        };
    }
};

export const getAgentByEmailService = async (email: string) => {
    try {
        if (!email || !email.trim()) {
            return {
                success: false,
                message: "Email is required"
            };
        }
        const response = await getAgentByEmail(email);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve agent, try again later"
        };
    }
};

export const updateAgentService = async (id: string, agentData: ICAgents) => {
    try {
        if (!id || !id.trim()) {
            return {
                success: false,
                message: "Agent ID is required"
            };
        }
        if (!agentData.agencyId) {
            return {
                success: false,
                message: "Agency is required"
            };
        }
        if (!agentData.agentName || !agentData.agentName.trim()) {
            return {
                success: false,
                message: "Agent name is required"
            };
        }
        if (!agentData.agentEmail || !agentData.agentEmail.trim()) {
            return {
                success: false,
                message: "Agent email is required"
            };
        }
        if (!agentData.agentPhone || !agentData.agentPhone.trim()) {
            return {
                success: false,
                message: "Agent phone is required"
            };
        }
        const response = await updateAgent(id, agentData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to update agent, try again later"
        };
    }
};

export const deleteAgentService = async (id: string) => {
    try {
        if (!id || !id.trim()) {
            return {
                success: false,
                message: "Agent ID is required"
            };
        }
        const response = await deleteAgent(id);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete agent, try again later"
        };
    }
};
