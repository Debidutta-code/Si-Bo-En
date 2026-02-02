import {prisma} from "../../config";
import {ICLoyaltyField, ILoyaltyField,IULoyaltyField} from "../types";
export class LoyalityFormFieldRepository {
    public async createLoyalityFormField(data: ICLoyaltyField):Promise<ILoyaltyField> {
        try {
            return await prisma.loyaltyProgramFieldConfig.create({
                data
            });
        } catch (error) {
            throw new Error("Error creating loyalty form field " );
        }
    }
    public async checkIfFieldExists(loyaltyProgramId:string,fieldName:string):Promise<ILoyaltyField | null> {
        try {
            return await prisma.loyaltyProgramFieldConfig.findUnique({
                where: { loyaltyProgramId_fieldName: { loyaltyProgramId, fieldName } }
            });
        } catch (error) {
            throw new Error("Error fetching loyalty form field by id " );
        }
    }
    public async updateLoyalityFormField(loyaltyProgramId:string,fieldName:string,data:IULoyaltyField):Promise<ILoyaltyField> {
        try {
            return await prisma.loyaltyProgramFieldConfig.update({
                where: {loyaltyProgramId_fieldName: {loyaltyProgramId, fieldName}},
                data:{
                    visibleInCustomerForm: data.visibleInCustomerForm,
                    required:data.required,
                    visibleInRegistration: data.visibleInRegistration
                }
            });
        } catch (error) {
            throw new Error("Error updating loyalty form field " );
        }
    }
    public async deleteLoyalityFormField(loyaltyProgramId:string,fieldName:string):Promise<ILoyaltyField> {
        try {
            return await prisma.loyaltyProgramFieldConfig.delete({
                where: {loyaltyProgramId_fieldName: {loyaltyProgramId, fieldName}}
            });
        } catch (error) {
            throw new Error("Error deleting loyalty form field " );
        }
    }


    // for bulk operations
    public async getAllFieldsByProgramId(loyaltyProgramId:string):Promise<ILoyaltyField[]> {
        try {
            return await prisma.loyaltyProgramFieldConfig.findMany({
                where: { loyaltyProgramId }
            });
        } catch (error) {
            throw new Error("Error fetching loyalty form fields by program id " );
        }
    }
    public async updateManyFields(loyaltyProgramId:string,fields:IULoyaltyField[]):Promise<{count:number}> {
        try {
            return await prisma.$transaction(async (tx) => {
                let successCount = 0;
                
                for (const field of fields) {
                    const exists = await tx.loyaltyProgramFieldConfig.findUnique({
                        where: { loyaltyProgramId_fieldName: { loyaltyProgramId, fieldName: field.fieldName } }
                    });
                    
                    if (exists) {
                        await tx.loyaltyProgramFieldConfig.update({
                            where: { loyaltyProgramId_fieldName: { loyaltyProgramId, fieldName: field.fieldName } },
                            data: {
                                visibleInCustomerForm: field.visibleInCustomerForm,
                                required: field.required,
                                visibleInRegistration: field.visibleInRegistration
                            }
                        });
                        successCount++;
                    }
                }
                
                return { count: successCount };
            });
        } catch (error) {
            throw new Error("Error updating multiple loyalty form fields");
        }
    }

}
