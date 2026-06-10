export interface IInitRecoveryProcess {
    propertyCode: string;
    newCreationId: string;
}


export interface ICompleteRecoveryProcess {
    propertyCode: string;
    newCreationId: string;
    otp: string;
}