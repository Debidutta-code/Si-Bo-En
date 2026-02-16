import { LoyaltyGuestFieldsDao } from "../repository";
import { errorResponse, IApiResponse, successResponse } from "../../utils";

export class LoyaltyGuestFields {
  public static async getLoyaltyGuestFields(): Promise<IApiResponse> {
    try {
      const daoRes = await LoyaltyGuestFieldsDao.getGuestFields();
      return successResponse('Loyalty Guest Fields fetched Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to fetch Loyalty Guest Fields', error?.message);
    }
  }
  public static async createLoyaltyGuestFields(fields: string[]): Promise<IApiResponse> {
    try {
      const daoRes = await LoyaltyGuestFieldsDao.createGuestFilelds(fields);
      return successResponse('Loyalty Guest Fields created Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to create Loyalty Guest Fields', error?.message);
    }
  }
  public static async deleteLoyaltyGuestFields(fields: string): Promise<IApiResponse> {
    try {
      const daoRes = await LoyaltyGuestFieldsDao.deleteGuestField(fields);
      return successResponse('Loyalty Guest Fields deleted Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to delete Loyalty Guest Fields', error?.message);
    }
  
  }
}