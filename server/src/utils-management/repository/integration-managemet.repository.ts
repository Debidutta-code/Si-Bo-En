import { prisma } from "../../config";
import {
    ICMasterIntegrations,
  IMasterIntegrations,
  ICMasterIntegrationIntegrationFields,
  IMasterIntegrationFields,
  ICMasterIntegrationUrlFields,
  IMasterIntegrationUrlFields
} from "../types"
export class InragrationManagement {
  public async createMasterIntegrations(data: ICMasterIntegrations): Promise<IMasterIntegrations> {
    try {
      return await prisma.masterIntegrations.create({
        data, include: {
          masterIntegrationURLFields: true,
          requiredFieldsForMasterIntegration: true
        }
      },

      )
    } catch (error) {
      throw new Error("Failed to create master integration")
    }
  }

  public async getAllMasterIntegrations(): Promise<IMasterIntegrations[]> {
    try {
      return await prisma.masterIntegrations.findMany({
        include: {
          masterIntegrationURLFields: true,
          requiredFieldsForMasterIntegration: true
        }
      })
    } catch (error) {
      throw new Error("Failed to fetch all partner integrations")
    }
  }
  public async updateMasterIntegrations(id:string,data:ICMasterIntegrations):Promise<IMasterIntegrations>{
    try {
      return await prisma.masterIntegrations.update({
        where:{
          id
        },
        data:data,
        include:{
          masterIntegrationURLFields: true,
          requiredFieldsForMasterIntegration: true
        }
      })
    } catch (error) {
      throw new Error("Failed to update partner integrations")
    }
  }
  public async deleteMasterIntegrations(id:string):Promise<boolean>{
    try {
      const returnRes= await prisma.masterIntegrations.delete({
        where:{id}
      })
      return returnRes?true:false
    } catch (error) {
      return false
    }
  }
}

export class IMasterIntegrationFieldsRepository{
    public async createMasterIntegrationFields(data:ICMasterIntegrationIntegrationFields[]):Promise<IMasterIntegrationFields>{
        try {
            return await prisma.
        } catch (error) {
            throw new Error("Failed to add required fields to user")
        }
    }
}