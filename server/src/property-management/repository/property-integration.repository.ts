import { prisma } from "../../config";
import {
  ICPropertyInregrationSecrets,
  IPropertyInregrationSecrets,
  IPropertyIntegration
} from "../types/integration.type";
export class PropertyIntegrationRepository {
  public async createIntegration(propertyId: string, masterIntegrationId: string): Promise<IPropertyIntegration> {
    try {
      return await prisma.propertyIntegrations.create({
        data: {
          propertyId,
          masterIntegrationId,
          isActive: true
        }, include: {
          propertyIntegrationSecrets: {
            include: {
              RequiredField: true
            }
          }
        }
      });

    } catch (error) {
      throw new Error("Failed to integrate property");
    }
  }
  public async getAllPropertyIntegrations(): Promise<IPropertyIntegration[]> {
    try {
      return await prisma.propertyIntegrations.findMany({
        include: {
          propertyIntegrationSecrets: {
            include: {
              RequiredField: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error("Failed to retrieve property integrations");
    }
  }
  public async getActiveIntegrationByProperty(propertyId: string): Promise<IPropertyIntegration | null> {
    try {
      return await prisma.propertyIntegrations.findFirst({
        where: {
          isActive: true,
          propertyId
        },
        include: {
          propertyIntegrationSecrets: {
            include: {
              RequiredField: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error("Failed to retrieve active property integrations");
    }
  }
  public async getById(id: string): Promise<IPropertyIntegration | null> {
    try {
      return await prisma.propertyIntegrations.findUnique({
        where: { id },
        include: {
          propertyIntegrationSecrets: {
            include: {
              RequiredField: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error("Failed to retrieve property integration");
    }
  }
  public async toggleActiveIntegration(id: string, isActive: boolean): Promise<IPropertyIntegration> {
    try {
      return await prisma.propertyIntegrations.update({
        where: { id },
        data: { isActive },
        include: {
          propertyIntegrationSecrets: {
            include: {
              RequiredField: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error("Failed to toggle active property integration");
    }
  }
  public async deleteActiveIntegrations(id: string): Promise<IPropertyIntegration> {
    try {
      return await prisma.propertyIntegrations.delete({
        where: { id },
        include: {
          propertyIntegrationSecrets: {
            include: {
              RequiredField: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error("Failed to delete active property integration");
    }
  }
  public async checkIfIntegrationExists(propertyId: string, masterIntegrationId: string): Promise<IPropertyIntegration | null> {
    try {
      return await prisma.propertyIntegrations.findFirst({
        where: {
          propertyId,
          masterIntegrationId
        }, include: {
          propertyIntegrationSecrets: {
            include: {
              RequiredField: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error("Failed to check if integration exists");
    }
  }
  public async getAllIntegrations(propertyId:string) {
    try {
      return await prisma.masterIntegrations.findMany({
        include: {
          masterIntegrationURLFields:true,
          requiredFieldsForMasterIntegration:true,
          propertyIntegrations:{
            where:{
              propertyId
            },
            include:{
              propertyIntegrationSecrets: {
                include: {
                  RequiredField: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      throw new Error("Failed to retrieve all property integrations");
    }
  }
}

export class PropertyIntegrationSecretsRepository {
  public async createIntegrationSecret(data: ICPropertyInregrationSecrets[], propertyIntegrationId: string): Promise<IPropertyInregrationSecrets[]> {
    try {
      return await prisma.$transaction(
        data.map(secret => prisma.propertyInregrationSecrets.create({
          data: {
            ...secret,
            propertyIntegrationId,
          }, include: {
            RequiredField: true
          }
        }))
      );
    } catch (error) {
      throw new Error("Failed to create property integration secret");
    }
  }
  public async getById(id: string): Promise<IPropertyInregrationSecrets | null> {
    try {
      return await prisma.propertyInregrationSecrets.findUnique({
        where: { id },
        include: {
          RequiredField: true
        }
      });
    } catch (error) {
      throw new Error("Failed to retrieve property integration secret");
    }
  }

  public async updateIntegrationSecret(id: string, value: string): Promise<IPropertyInregrationSecrets> {
    try {
      return await prisma.propertyInregrationSecrets.update({
        where: { id },
        data: { value },
        include: {
          RequiredField: true
        }
      });
    } catch (error) {
      throw new Error("Failed to update property integration secret");
    }
  }
  public async deleteIntegrationSecret(id: string): Promise<IPropertyInregrationSecrets> {
    try {
      return await prisma.propertyInregrationSecrets.delete({
        where: { id },
        include: {
          RequiredField: true
        }
      });
    } catch (error) {
      throw new Error("Failed to delete property integration secret");
    }
  }
  public async getAllByPropertyIntegrationId(propertyIntegrationId: string): Promise<IPropertyInregrationSecrets[]> {
    try {
      return await prisma.propertyInregrationSecrets.findMany({
        where: { propertyIntegrationId },
        include: {
          RequiredField: true
        }
      });
    } catch (error) {
      throw new Error("Failed to retrieve property integration secrets");
    }
  }
  public async addIntegrationSecret(data: ICPropertyInregrationSecrets, propertyIntegrationId: string): Promise<IPropertyInregrationSecrets> {
    try {
      return await prisma.propertyInregrationSecrets.create({
        data: {
          value: data.value,
          propertyIntegrationId,
          requiredFieldId: data.requiredFieldId
        },
        include: {
          RequiredField: true
        }
      })
    } catch (error) {
      throw new Error("Failed to create property integration secret");
    }
  }
}

