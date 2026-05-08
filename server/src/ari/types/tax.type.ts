export interface ITax {
    name: string;
    percentage: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IRTax {
    id: string;
    name: string;
    percentage: number;
    isActive: boolean;
    ratePlans?: [];
    createdAt: Date;
    updatedAt: Date;
}
