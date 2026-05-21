export type Languages = 'en';

export interface ICLoyalityCondition {
    loyaltyProgramId: string;
    text: string;
    language: Languages;
}
export interface ILoyalityCondition extends ICLoyalityCondition {
    id: string;
    isActive: boolean;
    isDeleted: boolean;
    _translations?:{
        text:string;
    }
}
export interface IULoyalityCondition {
    text: string;
    language: Languages;
    isActive: boolean;
}


export interface ICLoyalitySpecialCondition {
    loyaltyProgramId: string;
    title: string;
    subTitle: string | null;
    language: Languages;

}
export interface ILoyalitySpecialCondition extends ICLoyalitySpecialCondition {
    id: string;
    isActive: boolean;
    isDeleted: boolean;
    _translations?:{
        title:string;
        subTitle:string | null;
    }
}
export interface IULoyalitySpecialCondition{
    title: string;
    subTitle: string | null;
    language: Languages;
    isActive: boolean;
}