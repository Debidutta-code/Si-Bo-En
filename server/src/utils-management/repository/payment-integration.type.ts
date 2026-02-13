import {prisma} from "../../config";
import { IMasterPaymentIntegrationWithId, IPropertyPaymentIntegration } from "../types";

export class PaymentIntegrationDao {

  public static async getPaymentIntegrationByName(name: string) {
    try {
      return await prisma.masterPaymentIntegration.findUnique({
        where: {
          name: name,
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
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async updatePaymentIntegration(
    id: string,
    name: string,
    isActive: boolean
  ) {
    try {

      return await prisma.masterPaymentIntegration.update({
        where: { id },
        data: {
          name,
          isActive
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
  public static async validateMasterIntegrations(integrationId: string): Promise<boolean> {
    try {
      const count = await prisma.masterPaymentIntegration.count({
        where: {
          id: integrationId,
          isActive: true
        }
      });
      return count ? true : false;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async createPropertyIntegrations(
    propertyId: string,
    integrationId: string,
    outletId: string
  ): Promise<IPropertyPaymentIntegration> {
    try {


      return await prisma.propertyPaymentIntegration.create({
        data: {
          propertyId,
          paymentIntegrationId: integrationId,
          outletId
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }


  public static async getAllByPropertyId(propertyId: string): Promise<IPropertyPaymentIntegration[]> {
    try {
      return await prisma.propertyPaymentIntegration.findMany({
        where: {
          propertyId
        },
        include: {
          paymentIntegration: true
        }
      });
    } catch (error) {
      throw new Error("Failed to fetch property payment integrations");
    }
  }
  public static async getAllForPropertyId(propertyId: string): Promise<IMasterPaymentIntegrationWithId[]> {
    try {
      return await prisma.masterPaymentIntegration.findMany({
        where: {
        },
        include: {
          propertyPaymentIntegrations: {
            where: {
              propertyId
            }
          }
        }
      });
    } catch (error) {
      throw new Error("Failed to fetch property payment integrations");
    }
  }
  public static async deletePropertyIntegrations(id: string): Promise<IPropertyPaymentIntegration> {
    try {
      return await prisma.propertyPaymentIntegration.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error("Failed to delete property payment integrations");
    }
  }

  public static async deactivatePropertyIntegrations(propertyId: string): Promise<IPropertyPaymentIntegration | null> {
    try {
      return await prisma.propertyPaymentIntegration.findFirst({
        where: { propertyId, isActive: true },
      });
    } catch (error) {
      throw new Error("Failed to deactivate property payment integrations");
    }
  }
  public static async activatePropertyIntegrations(id: string) {
    try {
      return await prisma.propertyPaymentIntegration.updateMany({
        where: { id },
        data: { isActive: true }
      });
    } catch (error) {
      throw new Error("Failed to activate property payment integrations");
    }
  }
  public static async isIntegrationActiveForProperty(
    propertyId: string,
    integrationId: string
  ): Promise<boolean> {
    try {
      const integration = await prisma.propertyPaymentIntegration.findFirst({
        where: {
          propertyId: propertyId,
          paymentIntegrationId: integrationId,
        }
      });

      return integration?.isActive ?? false;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async togglePropertyIntegration(
    id: string,
    isActive: boolean
  ): Promise<IPropertyPaymentIntegration> {
    try {
      return await prisma.propertyPaymentIntegration.update({
        where: {
          id
        },
        data: { isActive }
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }
}
