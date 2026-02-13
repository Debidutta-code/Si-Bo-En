export type platformType = "pms" | "channel_manager"
export interface ICMasterIntegrations {
    name: string;
    type: platformType;
    isActive: boolean;
}

export interface IMasterIntegrations extends ICMasterIntegrations {
    id: string;
    createdAt: Date;
    requiredFieldsForMasterIntegration:IMasterIntegrationFields[];
    masterIntegrationURLFields:IMasterIntegrationUrlFields[];
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
export interface IMasterIntegrationUrlFields extends ICMasterIntegrationIntegrationFields{
    id:string
}