export type AgencyType = "travel_agency" | "corporate";
export type CurrencyCode = "USD" | "EUR" | "INR";

export type AgentCommissionType = "percentage" | "fixed";
export interface ICAgency {
    agencyName: string;
    agencyType: AgencyType
    agencyEmail: string;
    contactNo: string;
    taxNo: string;
    commissionType: AgentCommissionType;
    commissionValue: number;
    commissionCurrency: CurrencyCode | null;
    iataCode: string;
    address: string;
}
export interface IAgency extends ICAgency {
    id: string;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ICAgents {
    agencyId: string;
    agentName: string;
    agentEmail: string;
    agentPhone: string;
}
export interface IAgents extends ICAgents {
    id: string;
    agentPassword?: string;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IAgentsWA extends IAgents {
    agency: IAgency;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IAgentsWOP extends IAgents {
    agencyId: string;
    agentName: string;
    agentEmail: string;
    agentPhone: string;
    agentPassword: string;
    id: string;
    agency: IAgency

    isDeleted: boolean;
}
export interface IAgentLogin {
    email: string;
    password: string;
}
export interface ILoading{
    isLoading:boolean;
    message:string
}