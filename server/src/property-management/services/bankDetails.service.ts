// services/bank.service.ts
import { IApiResponse } from '../../utils';
import { errorResponse, successResponse } from '../../utils/return';
import { BankDetailsDao } from '../repository';
import { PaymentIntegrationDao } from '../repository';

export class BankService {
  public static async getBankDetailsByPropertyId(propertyId: string) {
    try {
      const response = await BankDetailsDao.getBankDetailsByPropertyId(propertyId);
      if (response) {
        const paymentIntegrations = await PaymentIntegrationDao.getAllByPropertyId(propertyId);

        return successResponse('Bank details fetched Successfully', {
          ...response,
          selectedPaymentIntegrations: paymentIntegrations
        });
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
    paymentGateway: boolean,
    selectedPaymentIntegration: string,
    outletId: string | null
  ) {
    try {
      const response = await BankDetailsDao.addBankDetails(
        propertyId,
        payAtHotel,
        paymentGateway
      );
      if (paymentGateway) {

        if (!selectedPaymentIntegration) {
          return errorResponse('Please select a payment integration');
        }
        if (!outletId) {
          return errorResponse('Please provide an outlet ID');
        }

        const validIntegrations = await PaymentIntegrationDao.validateMasterIntegrations(
          selectedPaymentIntegration
        );

        if (!validIntegrations) {
          return errorResponse('Invalid payment integration selected');
        }
        await PaymentIntegrationDao.createPropertyIntegrations(
          propertyId,
          selectedPaymentIntegration,
          outletId
        );
      }

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
    paymentGateway: boolean,
    selectedPaymentIntegration: string,
    outletId: string | null
  ): Promise<IApiResponse> {
    try {

      if (paymentGateway) {
        if (!selectedPaymentIntegration) {
          return errorResponse('Please select a payment integration');
        }
        const validIntegrations = await PaymentIntegrationDao.validateMasterIntegrations(
          selectedPaymentIntegration
        );
        if (!validIntegrations) {
          return errorResponse('Invalid payment integration selected');
        }
        const isAlreadyExists = await BankDetailsDao.getPropertyPaymentIntegration(
          propertyId,
          selectedPaymentIntegration
        );
        console.log("Al Ready exist", isAlreadyExists)
        if (isAlreadyExists) {
          const isAnyRunning = await PaymentIntegrationDao.deactivatePropertyIntegrations(propertyId);
          console.log("Checking if its running", isAnyRunning)
          if (isAnyRunning) {
            await PaymentIntegrationDao.togglePropertyIntegration(
              isAnyRunning.id,
              false
            );
            return this.updatePaymentMethodsByPropertyId(propertyId, payAtHotel, paymentGateway, selectedPaymentIntegration, outletId)
          }
          await PaymentIntegrationDao.togglePropertyIntegration(
            isAlreadyExists.id,
            true
          )

        } else {
          if (!outletId) {
            return errorResponse('Please provide an outlet ID');
          }
          await PaymentIntegrationDao.createPropertyIntegrations(
            propertyId,
            selectedPaymentIntegration,
            outletId
          );
        }
      }
      const response = await BankDetailsDao.updatePaymentMethodsByPropertyId(
        propertyId,
        payAtHotel,
        paymentGateway
      );
      if (response) {
        return successResponse('Payment methods Updated Successfully', response);
      } else {
        return errorResponse('Failed to update payment methods');
      }
    } catch (error: any) {
      return errorResponse('Internal server Error', error?.message);
    }
  }
}