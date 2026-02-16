import type { IMasterIntegrationFields } from "@/pages/management/types";
import type { FieldError, FieldValue } from "../../types/types";

export interface IUPropertyConfig {
    pmsIntegrationActive: boolean;
    channelManagerIntegrationActive: boolean;
    selfAriActive: boolean;
    reservationResetMinutes: number;
    isB2bAvailable?: boolean;
    isB2cAvailable?: boolean;
    commission?: boolean;
    timezone?: string;
    baseCurrency?: string;
    showVideo:boolean;
}

export interface IMasterPartnersWProperty{
    id: string;
    type: "channel_manager"|"pms";
    name: string;
    isActive: boolean;
    createdAt: string;
    masterIntegrationURLFields:ImasterIntegrationURLFields[];
    requiredFieldsForMasterIntegration:IrequiredFieldsForMasterIntegration[];
    propertyIntegrations:IpropertyIntegrations[]
}
export interface IpropertyIntegrations{
    id: string;
    propertyId: string;
    masterIntegrationId: string;
    isActive: boolean;
    createdAt?: string;
    propertyIntegrationSecrets:IpropertyIntegrationSecrets[];
}
export interface IpropertyIntegrationSecrets{
    id: string;
    propertyIntegrationId: string;
    requiredFieldId: string;
    value: string;
    createdAt?: string;
    RequiredField?: IrequiredFieldsForMasterIntegration;
}
export interface ImasterIntegrationURLFields{
    id: string;
    name: string;
    url: string;
    masterIntegrationId: string;
}
export interface IrequiredFieldsForMasterIntegration{
    id: string;
    name: string;
    masterIntegrationId: string;
}
export interface ICPropertyIntegration{
    propertyId: string;
    masterIntegrationId: string;
}
export interface ICPropertyIntegrationS extends ICPropertyIntegration{
    fields:ICPropertyInregrationSecrets[]
}
export interface IPropertyIntegration extends ICPropertyIntegration{
    id:string;
    isActive: boolean;
    propertyIntegrationSecrets:IPropertyInregrationSecrets[];
}
export interface ICPropertyInregrationSecrets{
    
    requiredFieldId:string;
    value:string;
}
export interface IPropertyInregrationSecrets extends ICPropertyInregrationSecrets{
    id:string;
    createdAt: Date;
    RequiredField:IMasterIntegrationFields;
}
export interface FormFieldsSectionProps {
    fields: IrequiredFieldsForMasterIntegration[];
    fieldValues: FieldValue;
    errors: FieldError;
    partnerName: string;
    onFieldChange: (fieldId: string, value: string) => void;
    disabled?: boolean;
}

export interface FormFieldProps {
    id: string;
    name: string;
    value: string;
    error?: string;
    index: number;
    total: number;
    partnerName: string;
    onChange: (id: string, value: string) => void;
    disabled?: boolean;
}

export interface PartnerInfoCardProps {
    name: string;
    type: 'channel_manager' | 'pms';
}

export interface ProgressIndicatorProps {
    progress: number;
    totalFields: number;
    filledFields: number;
}

export interface APIEndpointsSectionProps {
    endpoints: ImasterIntegrationURLFields[];
    partnerName: string;
}

export interface SecurityNoticeProps {
    partnerName: string;
}