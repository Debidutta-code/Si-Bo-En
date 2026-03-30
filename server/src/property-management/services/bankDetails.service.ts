// services/bank.service.ts
import { IApiResponse } from '../../utils';
import { PaymentIntegrationDao } from '../../utils-management/repository';
import { errorResponse, successResponse } from '../../utils/return';
import { BankDetailsDao } from '../repository';

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

  public static async updatePaymentMethodsByPropertyId(
    propertyId: string,
    payAtHotel: boolean,
    paymentGateway: boolean,
    selectedPaymentIntegration: string,
    outletId: string | null,
    secrets?: { requiredFieldId: string, value: string }[]
  ): Promise<IApiResponse> {
    try {
      if (paymentGateway) {
        if (!selectedPaymentIntegration) {
          return errorResponse('Please select a payment integration');
        }
        const masterIntegration = await PaymentIntegrationDao.getPaymentIntegrationById(selectedPaymentIntegration);
        if (!masterIntegration) {
          return errorResponse('Invalid payment integration selected');
        }

        let propertyIntegration = await BankDetailsDao.getPropertyPaymentIntegration(
          propertyId,
          selectedPaymentIntegration
        );

        if (propertyIntegration) {
          // Deactivate others
          const activeIntegrations = await PaymentIntegrationDao.getAllByPropertyId(propertyId);
          for (const ai of activeIntegrations) {
              if (ai.id !== propertyIntegration.id && ai.isActive) {
                  await PaymentIntegrationDao.togglePropertyIntegration(ai.id, false);
              }
          }

          await PaymentIntegrationDao.togglePropertyIntegration(propertyIntegration.id, true);

          // Update outletId if provided
          if (outletId) {
             await PaymentIntegrationDao.updatePropertyIntegrationOutletId(propertyIntegration.id, outletId);
          }

        } else {
          if (!outletId) {
            return errorResponse('Please provide an outlet ID');
          }
          propertyIntegration = await PaymentIntegrationDao.createPropertyIntegrations(
            propertyId,
            selectedPaymentIntegration,
            outletId
          );
        }

        if (secrets && secrets.length > 0) {
          await PaymentIntegrationDao.updatePropertyIntegrationSecrets(propertyIntegration.id, secrets);
        }
      } else {
          // If payment gateway is turned off, deactivate all property integrations
          const activeIntegrations = await PaymentIntegrationDao.getAllByPropertyId(propertyId);
          for (const ai of activeIntegrations) {
              if (ai.isActive) {
                  await PaymentIntegrationDao.togglePropertyIntegration(ai.id, false);
              }
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

  public static async addBankDetails(
    propertyId: string,
    payAtHotel: boolean,
    paymentGateway: boolean,
    selectedPaymentIntegration: string,
    outletId: string | null,
    secrets?: { requiredFieldId: string, value: string }[]
  ) {
      return this.updatePaymentMethodsByPropertyId(propertyId, payAtHotel, paymentGateway, selectedPaymentIntegration, outletId, secrets);
  }
}
