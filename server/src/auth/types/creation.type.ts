export type EntityType = 'group' | 'brand' | 'property' | 'super' | 'regional';

export interface IBaseEntity {
    id: string;
    type: EntityType;
    name: string;
    images: string[];

    superId: string | null;
    groupId: string | null;
    brandId: string | null;
    regionalId: string | null;
    propertyId: string | null;

    createdById: string;

    isActive: boolean;
    isDeleted: boolean;
}

export interface IGroupEntity extends IBaseEntity {
    groupChildren: IBaseEntity[];
}
export interface IBrandEntity extends IBaseEntity {
    brandChildren: IBaseEntity[];
}
