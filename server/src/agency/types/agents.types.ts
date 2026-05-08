import { IAgency } from './agency.type';

export interface ICAgents {
    agencyId: string;
    agentName: string;
    agentEmail: string;
    agentPhone: string;
    agentPassword: string;
}
export interface IAgents extends ICAgents {
    id: string;

    isDeleted: boolean;
}
export interface IAgentsWA extends IAgents {
    agency: IAgency;
}
