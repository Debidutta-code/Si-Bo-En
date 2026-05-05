import { CreationType } from "../../dashboard/types";

export interface IGroups {
    id: string;
    name: string;
}
export interface ICreation extends IGroups{
type: "super"|"group"|"brand"|"property"|"regional";
}
export interface IBrands {
    id: string;
    name: string;
    groupId?: string | null;
}
export interface IProperties{
    id: string;
    name: string;
    groupId?: string | null;
    brandId?: string | null;
    property: IProperty|null;
}

export interface IProperty{
    id: string;
    propertyName: string;
}

export interface ISuperGroupChildrens{
    groups: IGroups[];
    brands: IBrands[];
    properties: IProperties[];
}