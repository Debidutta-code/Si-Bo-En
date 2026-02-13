export interface ICMasterPaymentIntegration{
    name:string
    isActive:boolean
}
export interface IMasterPaymentIntegration{
    id:string;
    name:string
    isActive:boolean
}
export interface IMasterPaymentIntegrationWithId extends IMasterPaymentIntegration {
    propertyPaymentIntegrations:IPropertyPaymentIntegration[]
}
export interface ICPropertyPaymentIntegration{
    propertyId:string;
    paymentIntegrationId:string;
    isActive:boolean;
    outletId:string;
}
export interface IPropertyPaymentIntegration {
    id:string;
    propertyId:string;
    paymentIntegrationId:string;
    isActive:boolean;
    outletId:string;
}
export interface IPropertyPaymentIntegrationWMaster extends IPropertyPaymentIntegration {
    paymentIntegration: IMasterPaymentIntegration;
}