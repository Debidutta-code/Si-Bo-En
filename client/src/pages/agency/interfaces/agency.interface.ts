
export type AgencyApplicationStatus = "pending" | "approved" | "rejected";
export type fAgencyApplicationStatus = "all" | AgencyApplicationStatus;

export type AgencyType = "travel_agency" | "corporate";
export type AgentCommissionType = "percentage" | "fixed";
export type CurrencyCode = "USD" | "EUR" | "INR";
export interface ICAgencyApplication {
    applicationNoForThisUser: number;
    status: AgencyApplicationStatus;
    
    applicantEmail: string;
    applicantName: string;
    applicantPhone: string;
    applicantPassword: string;

    agencyName: string;
    agencyType: AgencyType;
    agencyEmail: string;
    contactNo: string;
    taxNo: string;
    commissionType: AgentCommissionType;
    commissionValue: number;
    commissionCurrency: CurrencyCode|null;
    iataCode: string;
    address: string;
}
export interface IUCAgencyApplication extends ICAgencyApplication {
    applicantEmail: string;
    applicantName: string;
    applicantPhone: string;
    applicantPassword: string;

    agencyName: string;
    agencyType: AgencyType;
    agencyEmail: string;
    contactNo: string;
    taxNo: string;
    commissionType: AgentCommissionType;
    commissionValue: number;
    commissionCurrency: CurrencyCode|null;
    iataCode: string;
    address: string;
}
export interface IAgencyApplication extends ICAgencyApplication {
    id: string;
}