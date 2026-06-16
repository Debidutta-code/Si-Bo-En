import type { IAgenticRoom } from ".";

export interface ICAgenticProperty {
    agencyId: string;
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    isActive: boolean;
    _translations?:{
        propertyName:string;
        description:string;
    }

}
export interface ICAgenticProperties{
    id: string;
    propertyCode: string;
    propertyName: string;
    
}
export interface IAgenticProperty extends ICAgenticProperty {
    id: string;
    isDeleted: boolean;
}
export interface IAgenticPropertyWR extends IAgenticProperty {
    AgenticRooms: IAgenticRoom[];

}
export interface IProperty{
    id: string;
    propertyCode: string;
    propertyName: string;
}
