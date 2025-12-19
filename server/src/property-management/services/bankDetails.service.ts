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
    accountHolder: string,
    accountNumber: string,
    ifsc: string,
    upiId: string,
    payAtHotel: boolean,
    bankTransfer: boolean,
    upi: boolean,
    gateway: boolean
  ) {
    try {
      const response = await BankDetailsDao.addBankDetails(
        propertyId,
        accountHolder,
        accountNumber,
        ifsc,
        upiId,
        payAtHotel,
        bankTransfer,
        upi,
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
  public static async updateBankDetailsByPropertyId(
    propertyId: string,
    accountHolder: string,
    accountNumber: string,
    ifsc: string,
    upiId: string
  ) {
    try {
      const response = await BankDetailsDao.updateBankDetailsByPropertyId(
        propertyId,
        accountHolder,
        accountNumber,
        ifsc,
        upiId
      );
      if (response) {
        return successResponse('Bank details Updated Successfully', response);
      } else {
        return errorResponse('Failed to update Bank details');
      }
    } catch (error: any) {
      return errorResponse('Internal server Error', error?.message);
    }
  }
  public static async updatePaymentMethodsByPropertyId(
    propertyId: string,
    payAtHotel: boolean,
    bankTransfer: boolean,
    upi: boolean,
    gateway: boolean
  ) {
    try {
      const response = await BankDetailsDao.updatePaymentMethodsByPropertyId(
        propertyId,
        payAtHotel,
        bankTransfer,
        upi,
        gateway
      );
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
