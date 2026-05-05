import { LoyaltyGuestFieldsDao } from "../repository";
import { errorResponse, IApiResponse, successResponse } from "../../utils";

export class LoyaltyGuestFields {
  private loyaltyGuestFieldsDao: LoyaltyGuestFieldsDao;
  constructor() {
    this.loyaltyGuestFieldsDao = new LoyaltyGuestFieldsDao();
  }
  public  async getLoyaltyGuestFields(): Promise<IApiResponse> {
    try {
      const daoRes = await this.loyaltyGuestFieldsDao.getGuestFields();
      return successResponse('Loyalty Guest Fields fetched Successfully', daoRes);
    } catch (error) {
      if(error instanceof Error){

        return errorResponse('Failed to fetch Loyalty Guest Fields', error?.message);
      }
      return errorResponse('Failed to fetch Loyalty Guest Fields', 'Unknown error');  
    }
  }
  public  async createLoyaltyGuestFields(fields: string[]): Promise<IApiResponse> {
    try {
      const daoRes = await this.loyaltyGuestFieldsDao.createGuestFilelds(fields);
      return successResponse('Loyalty Guest Fields created Successfully', daoRes);
    } catch (error) {
      if(error instanceof Error){
        return errorResponse('Failed to create Loyalty Guest Fields', error?.message);
      }
      return errorResponse('Failed to create Loyalty Guest Fields', 'Unknown error');
    }
  }
  public  async deleteLoyaltyGuestFields(fields: string): Promise<IApiResponse> {
    try {
      const daoRes = await this.loyaltyGuestFieldsDao.deleteGuestField(fields);
      return successResponse('Loyalty Guest Fields deleted Successfully', daoRes);
    } catch (error) {
      if(error instanceof Error){
        return errorResponse('Failed to delete Loyalty Guest Fields', error?.message);
      }
      return errorResponse('Failed to delete Loyalty Guest Fields', 'Unknown error');
    }
  
  }
}