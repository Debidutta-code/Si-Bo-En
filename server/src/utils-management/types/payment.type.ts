export interface IMasterPaymentIntegration {
    id: string;
    name: string
    isActive: boolean
    createdAt?: Date;
    requiredFieldsForMasterPaymentIntegration: IMasterPaymentIntegrationFields[];
    masterPaymentIntegrationURLFields: IMasterPaymentIntegrationUrlFields[];
}
export interface IMasterPaymentIntegrationWithId extends IMasterPaymentIntegration {
    propertyPaymentIntegrations: IPropertyPaymentIntegration[]
}
export interface IPropertyPaymentIntegration {
    id: string;
    propertyId: string;
    paymentIntegrationId: string;
    isActive: boolean;
    outletId: string;
    sameDayRefund: boolean;
}

export interface IPropertyPaymentIntegrationWMaster extends IPropertyPaymentIntegration {
    paymentIntegration: IMasterPaymentIntegration;
}

export interface ICMasterPaymentIntegrationFields {
    name: string;
}

export interface IMasterPaymentIntegrationFields extends ICMasterPaymentIntegrationFields {
    id: string;
}

export interface ICMasterPaymentIntegrationUrlFields {
    name: string;
    url: string;
}

export interface IMasterPaymentIntegrationUrlFields extends ICMasterPaymentIntegrationFields {
    id: string;
    url: string;
}

export interface ICMasterPaymentIntegrationS {
    name: string;
    urlFileds: ICMasterPaymentIntegrationUrlFields[];
    requiredFields: ICMasterPaymentIntegrationFields[];
}
