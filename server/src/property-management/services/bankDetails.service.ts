import { Types } from 'mongoose';
import { errorResponse, successResponse } from '../../utils/return';
import { BankDetailsDao } from '../repository';
export class BankService {
  public static async getBankDetailsByPropertyId(
    propertyId: string
  ) {
    try {
      const response =
        await BankDetailsDao.getBankDetailsByPropertyId(propertyId);
      if (response) {
        return successResponse('Bank details fetched Successfully', response);
      } else {
        return errorResponse('Bank details Not found');
      }
    } catch (error: any) {
      return errorResponse(
        'Error occur while fetching the bank details',
        error?.message
      );
    }
  }
  public static async addBankDetails(
    propertyId: string,
    payAtHotel: boolean,
    paymentGateway: boolean
  ) {
    try {
      const response = await BankDetailsDao.addBankDetails(
        propertyId,
        payAtHotel,
        paymentGateway
      );
      if (response) {
        return successResponse('Bank details Added Successfully', response);
      } else {
        return errorResponse('Failed to add Bank details');
      }
    } catch (error: any) {
      return errorResponse(
        'Error occur while adding Bank details',
        error?.message
      );
    }
  }

  public static async updatePaymentMethodsByPropertyId(
    propertyId: string,
    payAtHotel: boolean,
    paymentGateway: boolean
  ) {
    try {
      const response = await BankDetailsDao.updatePaymentMethodsByPropertyId(
        propertyId,
        payAtHotel,
        paymentGateway
      );
      console.log("response ",response)
      if (response) {
        return successResponse(
          'Payment methods Updated Successfully',
          response
        );
      } else {
        return errorResponse('Failed to update payment methods');
      }
    } catch (error: any) {
      return errorResponse('Internal server Error', error?.message);
    }
  }
}
