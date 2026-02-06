import { prisma } from "../../config";
import { ICTaxRule, IGetTaxRule } from "../interfaces";

export class TaxRuleRepository {
    public async createTaxRule(
        propertyId: string,
        taxRuleData: ICTaxRule,
    ): Promise<ICTaxRule | Error> {
        //console.log("Creating tax rule for propertyId:", propertyId, "with data:", taxRuleData);
        try {
            const { ...data } = taxRuleData;
            const createdTaxRule = await prisma.taxRule.create({
                data: {
                    ...data,
                    propertyId: propertyId
                }
            });
            return createdTaxRule;
            
        } catch (error) {
            //console.log(error);
            throw new Error('Failed to create tax rule');
        }
    }
    public async getTaxRuleByPropertyId(propertyId: string): Promise<IGetTaxRule[]|Error> {
        try {
            
            const taxRules = await prisma.taxRule.findMany({
                where: {
                    propertyId: propertyId
                },
                include: {
                    taxGroupRules:{
                        include:{
                            taxGroup:true
                        }
                    }
                }
            });
            return taxRules;
        } catch (error) {
            throw new Error('Failed to fetch tax rules');
        }
    }
    public async updateTaxRule(
        taxRuleId: string,
        updateData: Partial<ICTaxRule>
    ): Promise<ICTaxRule | Error> {
        try {
            const updatedTaxRule = await prisma.taxRule.update({
                where: { id: taxRuleId },
                data: updateData
            });
            return updatedTaxRule;
        } catch (error) {
            throw new Error('Failed to update tax rule');
        }
    }

    public async deleteTaxRule(taxRuleId: string): Promise<ICTaxRule | Error> {
        try {
            await prisma.taxGroupRule.deleteMany({
                where: { taxRuleId: taxRuleId }
            });
            const deletedTaxRule = await prisma.taxRule.delete({
                where: { id: taxRuleId }
            });
            return deletedTaxRule;

        } catch (error) {
            throw new Error('Failed to delete tax rule');
        }
    }

    public async getTaxRuleById(taxRuleId: string): Promise<ICTaxRule | Error> {
        try {
            const taxRule = await prisma.taxRule.findUnique({
                where: { id: taxRuleId }
            });
            return taxRule!;
        } catch (error) {
            throw new Error('Failed to fetch tax rule');
        }
    }
    
}