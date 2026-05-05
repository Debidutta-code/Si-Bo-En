import { CurrencyCode } from "@/src/components/currencyCode/currency-code.type";

export type AgencyApplicationStatus = "pending" | "approved" | "rejected";
export type AgencyType = "travel_agency" | "corporate";
export type AgentCommissionType = "percentage" | "fixed";

export interface IAgencyApplicationForm {
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
  commissionCurrency: CurrencyCode;
  iataCode: string;
  address: string;
}

export interface IAgencyApplication extends IAgencyApplicationForm {
  id: string;
  status: AgencyApplicationStatus;
  rejectionReason?: string | null;
  applicationNoForThisUser: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAgencyApplicationResponse {
  success: boolean;
  message: string;
  data?: IAgencyApplication;
}