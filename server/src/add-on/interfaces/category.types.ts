export interface ICCategory {
    name: string;
    code: string;
}
export interface IAddOnCategory extends ICCategory {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
