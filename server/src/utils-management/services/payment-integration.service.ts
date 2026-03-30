import { normalizePaymentIntegrationName } from "../../property-management/utils/nameNormalizer";
import { PaymentIntegrationDao } from "../repository";
import { errorResponse, IApiResponse, successResponse } from "../../utils";
import { ICMasterPaymentIntegrationFields, ICMasterPaymentIntegrationUrlFields, ICMasterPaymentIntegrationS } from "../types";

export class PaymentIntegrationService {
  public static async createPaymentIntegration(data: ICMasterPaymentIntegrationS): Promise<IApiResponse> {
    try {
      const normalizedName = normalizePaymentIntegrationName(data.name);

      const isExists = await PaymentIntegrationDao.getPaymentIntegrationByName(normalizedName);
      if (isExists) {
        return errorResponse('Payment integration with this name already exists');
      }

      const daoRes = await PaymentIntegrationDao.createPaymentIntegration(normalizedName);

      if (data.requiredFields && data.requiredFields.length > 0) {
        await PaymentIntegrationDao.createRequiredFields(data.requiredFields, daoRes.id);
      }

      if (data.urlFileds && data.urlFileds.length > 0) {
        await PaymentIntegrationDao.createUrlFields(data.urlFileds, daoRes.id);
      }

      const finalRes = await PaymentIntegrationDao.getPaymentIntegrationById(daoRes.id);
      return successResponse('Payment integration created successfully', finalRes);
    } catch (error: any) {
      return errorResponse('Failed to create payment integration', error?.message);
    }
  }

  public static async getPaymentIntegrations(propertyId: string): Promise<IApiResponse> {
    try {
      const daoRes = await PaymentIntegrationDao.getAllForPropertyId(propertyId);
      return successResponse('Payment integrations fetched successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to fetch payment integrations', error?.message);
    }
  }

  public static async getMasterPaymentIntegrations(): Promise<IApiResponse> {
    try {
      const daoRes = await PaymentIntegrationDao.getAll();
      return successResponse('Payment integrations fetched successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to fetch payment integrations', error?.message);
    }
  }

  public static async updatePaymentIntegration(id: string, name: string): Promise<IApiResponse> {
    try {
      const normalizedName = normalizePaymentIntegrationName(name);

      if (normalizedName) {
        const isExists = await PaymentIntegrationDao.getPaymentIntegrationByName(normalizedName);
        if (isExists && isExists.id !== id) {
          return errorResponse('Payment integration with this name already exists');
        }
      }

      const daoRes = await PaymentIntegrationDao.updatePaymentIntegration(id, normalizedName, true);
      return successResponse('Payment integration updated successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to update payment integration', error?.message);
    }
  }

  public static async deletePaymentIntegration(id: string): Promise<IApiResponse> {
    try {
      const daoRes = await PaymentIntegrationDao.deletePaymentIntegration(id);
      return successResponse('Payment integration deleted successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to delete payment integration', error?.message);
    }
  }

  public static async addRequiredField(data: { name: string; masterPaymentIntegrationId: string }): Promise<IApiResponse> {
    try {
      const res = await PaymentIntegrationDao.createRequiredFields([{ name: data.name }], data.masterPaymentIntegrationId);
      return successResponse('Required field added successfully', res);
    } catch (error: any) {
      return errorResponse('Failed to add required field', error?.message);
    }
  }

  public static async deleteRequiredField(id: string): Promise<IApiResponse> {
    try {
      await PaymentIntegrationDao.deleteRequiredField(id);
      return successResponse('Required field deleted successfully');
    } catch (error: any) {
      return errorResponse('Failed to delete required field', error?.message);
    }
  }

  public static async addUrlField(data: { name: string; url: string; masterPaymentIntegrationId: string }): Promise<IApiResponse> {
    try {
      const res = await PaymentIntegrationDao.createUrlFields([{ name: data.name, url: data.url }], data.masterPaymentIntegrationId);
      return successResponse('URL field added successfully', res);
    } catch (error: any) {
      return errorResponse('Failed to add URL field', error?.message);
    }
  }

  public static async deleteUrlField(id: string): Promise<IApiResponse> {
    try {
      await PaymentIntegrationDao.deleteUrlField(id);
      return successResponse('URL field deleted successfully');
    } catch (error: any) {
      return errorResponse('Failed to delete URL field', error?.message);
    }
  }
}
