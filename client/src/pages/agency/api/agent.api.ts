import createAxiosInstance from "@/components/axiosInstance";
import type { ICAgents } from "../interfaces";

const axiosInstance = createAxiosInstance();

export const agentLogin=async(email:string,password:string)=>{
    try {
        const response = await axiosInstance.post("/agency/agents/login", { email, password });
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};

export const createAgent=async(agentData:ICAgents)=>{
    try {
        const response = await axiosInstance.post("/agency/agents", agentData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export const getAgentById=async(id:string)=>{
    try {
        const response = await axiosInstance.get(`/agency/agents/${id}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
export const getAgentByEmail=async(email:string)=>{
    try {
        const response = await axiosInstance.get(`/agency/agents/email/${email}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
export const updateAgent=async(id:string,agentData:ICAgents)=>{
    try {
        const response = await axiosInstance.put(`/agency/agents/${id}`, agentData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
export const deleteAgent=async(id:string)=>{
    try {
        const response = await axiosInstance.delete(`/agency/agents/${id}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};
