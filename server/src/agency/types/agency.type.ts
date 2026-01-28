
import { CurrencyCode } from "../../pms/frontoffice/payment/types";
import { AgencyType, AgentCommissionType, IAgenticProperty, IAgents } from ".";
export interface ICAgency {
    agencyName: string;
    agencyType: AgencyType
    agencyEmail: string;
    contactNo: string;
    taxNo: string;
    commissionType: AgentCommissionType;
    commissionValue: number;
    commissionCurrency: CurrencyCode|null;
    iataCode: string;
    address: string;
}
export interface IAgency extends ICAgency {
    id: string;
        isDeleted: boolean;

}
export interface IAgencyWD extends IAgency{
    Agents: IAgents[]
    AgenticProperties: IAgenticProperty[]
}