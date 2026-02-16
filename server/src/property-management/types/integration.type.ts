import { IMasterIntegrationFields } from "../../utils-management/types"


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