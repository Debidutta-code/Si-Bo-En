import { prisma } from "../../config";
import {
  IMasterPaymentIntegration,
  IMasterPaymentIntegrationFields,
  IMasterPaymentIntegrationUrlFields,
  ICMasterPaymentIntegrationFields,
  ICMasterPaymentIntegrationUrlFields,
  IPropertyPaymentIntegration,
  IMasterPaymentIntegrationWithId
} from "../types";

export class PaymentIntegrationDao {
  public static async getPaymentIntegrationByName(name: string) {
    try {
      return await prisma.masterPaymentIntegration.findUnique({
        where: { name },
        include: {
          requiredFieldsForMasterPaymentIntegration: true,
          masterPaymentIntegrationURLFields: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async getPaymentIntegrationById(id: string) {
    try {
      return await prisma.masterPaymentIntegration.findUnique({
        where: { id },
        include: {
          requiredFieldsForMasterPaymentIntegration: true,
          masterPaymentIntegrationURLFields: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async getAll() {
    try {
      return await prisma.masterPaymentIntegration.findMany({
        include: {
          requiredFieldsForMasterPaymentIntegration: true,
          masterPaymentIntegrationURLFields: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async createPaymentIntegration(name: string) {
    try {
      return await prisma.masterPaymentIntegration.create({
        data: {
          name,
          isActive: true,
        },
        include: {
          requiredFieldsForMasterPaymentIntegration: true,
          masterPaymentIntegrationURLFields: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async updatePaymentIntegration(id: string, name: string, isActive: boolean) {
    try {
      return await prisma.masterPaymentIntegration.update({
        where: { id },
        data: { name, isActive },
        include: {
          requiredFieldsForMasterPaymentIntegration: true,
          masterPaymentIntegrationURLFields: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async deletePaymentIntegration(id: string) {
    try {
      return await prisma.masterPaymentIntegration.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  // Required Fields Repository
  public static async createRequiredFields(data: ICMasterPaymentIntegrationFields[], masterPaymentIntegrationId: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        const createdFields = [];
        for (const field of data) {
          const exists = await tx.masterPaymentIntegrationRequiredFields.findFirst({
            where: { name: field.name, masterPaymentIntegrationId },
          });
          if (!exists) {
            const created = await tx.masterPaymentIntegrationRequiredFields.create({
              data: { name: field.name, masterPaymentIntegrationId },
            });
            createdFields.push(created);
          }
        }
        return createdFields;
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async deleteRequiredField(id: string) {
    try {
      return await prisma.masterPaymentIntegrationRequiredFields.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  // URL Fields Repository
  public static async createUrlFields(data: ICMasterPaymentIntegrationUrlFields[], masterPaymentIntegrationId: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        const createdFields = [];
        for (const field of data) {
          const exists = await tx.masterPaymentIntegrationURLFields.findFirst({
            where: { name: field.name, url: field.url, masterPaymentIntegrationId },
          });
          if (!exists) {
            const created = await tx.masterPaymentIntegrationURLFields.create({
              data: { name: field.name, url: field.url, masterPaymentIntegrationId },
            });
            createdFields.push(created);
          }
        }
        return createdFields;
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async deleteUrlField(id: string) {
    try {
      return await prisma.masterPaymentIntegrationURLFields.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async createPropertyIntegrations(
    propertyId: string,
    integrationId: string,
    outletId?: string
  ): Promise<IPropertyPaymentIntegration> {
    try {
      return await prisma.propertyPaymentIntegration.create({
        data: {
          propertyId,
          paymentIntegrationId: integrationId,
          outletId: outletId || '',
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async getAllByPropertyId(propertyId: string): Promise<IPropertyPaymentIntegration[]> {
    try {
      return await prisma.propertyPaymentIntegration.findMany({
        where: { propertyId },
        include: {
          paymentIntegration: {
            include: {
              requiredFieldsForMasterPaymentIntegration: true,
              masterPaymentIntegrationURLFields: true,
            },
          },
          propertyPaymentIntegrationSecrets: {
            include: {
              RequiredField: true,
            },
          },
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async getAllForPropertyId(propertyId: string): Promise<IMasterPaymentIntegrationWithId[]> {
    try {
      return await prisma.masterPaymentIntegration.findMany({
        include: {
          requiredFieldsForMasterPaymentIntegration: true,
          masterPaymentIntegrationURLFields: true,
          propertyPaymentIntegrations: {
            where: { propertyId },
            include: {
              propertyPaymentIntegrationSecrets: {
                include: {
                  RequiredField: true,
                },
              },
            },
          },
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async deletePropertyIntegrations(id: string) {
    try {
      return await prisma.propertyPaymentIntegration.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async updatePropertyIntegrationSecrets(propertyPaymentIntegrationId: string, secrets: { requiredFieldId: string, value: string }[]) {
    try {
      return await prisma.$transaction(async (tx) => {
        for (const secret of secrets) {
          await tx.propertyPaymentIntegrationSecrets.upsert({
            where: {
              propertyPaymentIntegrationId_requiredFieldId: {
                propertyPaymentIntegrationId,
                requiredFieldId: secret.requiredFieldId,
              },
            },
            update: { value: secret.value },
            create: {
              propertyPaymentIntegrationId,
              requiredFieldId: secret.requiredFieldId,
              value: secret.value,
            },
          });
        }
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async togglePropertyIntegration(id: string, isActive: boolean) {
      try {
          return await prisma.propertyPaymentIntegration.update({
              where: { id },
              data: { isActive }
          });
      } catch (error: any) {
          throw new Error(error?.message);
      }
  }
}
