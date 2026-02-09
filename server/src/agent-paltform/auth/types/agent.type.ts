import { IAgency } from "../../../agency/types";

export interface ICAgents {
    agencyId: string;
    agentName: string;
    agentEmail: string;
    agentPhone: string;
}
export interface IAgents extends ICAgents {
    id: string;
    
    isDeleted: boolean;
}
export interface IAgentsWA extends IAgents {
    agency:IAgency
}
export interface IAgentsWOP extends IAgents {
    agencyId: string;
    agentName: string;
    agentEmail: string;
    agentPhone: string;
    agentPassword: string;
    id: string;
        agency:IAgency

    isDeleted: boolean;
}
export interface IAgentLogin{
    email:string;
    password:string;
}
