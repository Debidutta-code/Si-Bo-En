import {prisma} from "../../config";
import { ICTaxGroup } from "../interfaces";
export class TaxGroupRepository {
    public async createTaxGroup(
        propertyId: string,
        taxGroupData: ICTaxGroup
    ): Promise<ICTaxGroup | Error> {
        console.log("Creating tax group for propertyId:", propertyId, "with data:", taxGroupData);
        const { taxRuleIds, ...data } = taxGroupData as any;
        try {
            const createdTaxGroup = await prisma.taxGroup.create({
                data: {
                    ...data,
                    propertyId: propertyId
                }
            });
            if(taxRuleIds && taxRuleIds.length > 0){
                this.addTaxRulesToTaxGroup(createdTaxGroup.id, taxRuleIds);
            }
            return createdTaxGroup;
        } catch (error) {
            console.log(error);
            throw new Error('Failed to create tax group');
        }
    }
    public async getTaxGroupByPropertyId(propertyId: string): Promise<ICTaxGroup[]|Error> {
        try {   
            const taxGroups = await prisma.taxGroup.findMany({
                where: {
                    propertyId: propertyId
                },
                include: {
                    taxGroupRules: {
                        include: {
                            taxRule: true
                        }
                    },
                    ratePlans:true
                }
            });
            return taxGroups;
        } catch (error) {
            throw new Error('Failed to fetch tax groups');
        }   
    }
    public async updateTaxGroup(
        taxGroupId: string,
        updateData: ICTaxGroup
    ): Promise<ICTaxGroup | Error> {
        try {
            const { taxRuleIds, ...data } = updateData as any;
            const updatedTaxGroup = await prisma.taxGroup.update({
                where: { id: taxGroupId },
                data: data
            });
            return updatedTaxGroup;
        } catch (error) {
            console.log(error);
            throw new Error('Failed to update tax group');
        }
    }
    public async deleteTaxGroup(taxGroupId: string): Promise<ICTaxGroup | Error> {
        try {
            await prisma.taxGroupRule.deleteMany({
                where: { taxGroupId: taxGroupId }
            });
            const deletedTaxGroup = await prisma.taxGroup.delete({
                where: { id: taxGroupId }
            });
            return deletedTaxGroup;
        } catch (error) {
            throw new Error('Failed to delete tax group');
        }
    }
    public async addTaxRulesToTaxGroup(
        taxGroupId: string,
        taxRuleIds: string[]
    ): Promise<any | Error> {
        try {
            const taxGroupRulesData = taxRuleIds.map((taxRuleId) => ({
                taxGroupId,
                taxRuleId
            }));
            return await prisma.taxGroupRule.createMany({
                data: taxGroupRulesData
            });
        } catch (error) {
            throw new Error('Failed to add tax rules to tax group');
        }
    }
    public async removeTaxRulesFromTaxGroup(
        taxGroupId: string,
        taxRuleIds: string[]
    ): Promise<any | Error> {
        try {
            return await prisma.taxGroupRule.deleteMany({
                where: {
                    taxGroupId,
                    taxRuleId: { in: taxRuleIds }
                }
            });
        }
        catch (error) {
            console.log(error);
            throw new Error('Failed to remove tax rules from tax group');
        }
    }
    public async getTaxGroupById(taxGroupId: string): Promise<ICTaxGroup | null | Error> {
        try {
            const taxGroup = await prisma.taxGroup.findUnique({
                where: { id: taxGroupId }
            });
            return taxGroup;
        } catch (error) {
            throw new Error('Failed to fetch tax group by ID');
        }
    }
}