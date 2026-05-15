import { prisma } from "../../config";
import { ICPropertyActiveLanguage, LanguageCode ,IPropertyActiveLanguage} from "../types";

export class ActiveLanguageRepository {
    public async createActiveLanguage(data: ICPropertyActiveLanguage):Promise<IPropertyActiveLanguage> {
        try {
            return await prisma.propertyActiveLanguages.create({
                data
            });
        } catch (error) {
            throw new Error("Failed to create active language");
        }
    }
    public async getAllPropertyLanguages(propertyId: string):Promise<IPropertyActiveLanguage[]> {
        try {
            return await prisma.propertyActiveLanguages.findMany({
                where: { propertyId }
            });
        } catch (error) {
            throw new Error("Failed to retrieve active languages");
        }
    }
    public async getActiveLanguageById(id: string):Promise<IPropertyActiveLanguage | null> {
        try {
            return await prisma.propertyActiveLanguages.findUnique({
                where: { id }
            });
        } catch (error) {
            throw new Error("Failed to retrieve active language");
        }
    }
    public async deleteActiveLanguage(id:string):Promise<IPropertyActiveLanguage> {
        try {
            return await prisma.propertyActiveLanguages.delete({
                where: { id }
            });
        } catch (error) {
            throw new Error("Failed to delete active language");
        }
    }
}