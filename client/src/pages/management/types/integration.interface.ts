export type platformType = "pms" | "channel_manager"
export interface ICMasterIntegrations {
    name: string;
    type: platformType;
}

export interface IMasterIntegrations extends ICMasterIntegrations {
    id: string;
    createdAt: Date;
    isActive: boolean;
    requiredFieldsForMasterIntegration: IMasterIntegrationFields[];
    masterIntegrationURLFields: IMasterIntegrationUrlFields[];
}
export interface ICMasterIntegrationIntegrationFields {
    name: string;
}
export interface IMasterIntegrationFields extends ICMasterIntegrationIntegrationFields {
    id: string;
}
export interface ICMasterIntegrationUrlFields {
    name: string
    url: string
}
export interface IMasterIntegrationUrlFields extends ICMasterIntegrationUrlFields {
    id: string
}

export interface ICMasterIntegrationsS extends ICMasterIntegrations {
    urlFileds: ICMasterIntegrationUrlFields[];
    requiredFields: ICMasterIntegrationIntegrationFields[];
}

export interface IMasterPaymentIntegration {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    requiredFieldsForMasterPaymentIntegration: IMasterPaymentIntegrationFields[];
    masterPaymentIntegrationURLFields: IMasterPaymentIntegrationUrlFields[];
}

export interface IMasterPaymentIntegrationFields {
    id: string;
    name: string;
}

export interface IMasterPaymentIntegrationUrlFields {
    id: string;
    name: string;
    url: string;
}

export interface ICMasterPaymentIntegrationS {
    name: string;
    urlFileds: { name: string; url: string }[];
    requiredFields: { name: string }[];
}
