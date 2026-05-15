import type { LanguageCode } from "@/components/language/language";


export interface ICPropertyActiveLanguage {
    propertyId: string;
    language: LanguageCode;
}
export interface IPropertyActiveLanguage extends ICPropertyActiveLanguage{
    id:string;
}