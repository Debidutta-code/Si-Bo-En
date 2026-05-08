export interface AgentDeletedEmailParams {
    agentName: string;
    agentEmail: string;
    agencyName: string;
    deletedByName: string;
    reason?: string;
}
export interface AgentCreatedEmailParams {
    agentName: string;
    agentEmail: string;
    agentPassword: string;
    agencyName: string;
    loginUrl: string;
    createdByName: string;
}
