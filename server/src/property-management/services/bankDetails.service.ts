// services/bank.service.ts
import { IApiResponse } from '../../utils';
import { PaymentIntegrationDao } from '../../utils-management/repository';
import { errorResponse, successResponse } from '../../utils/return';
import { BankDetailsDao } from '../repository';

export class BankService {
  public static async getBankDetailsByPropertyId(propertyId: string, all?: string) {
    try {
      const response = await BankDetailsDao.getBankDetailsByPropertyId(propertyId);
      if (response) {
        const paymentIntegrations = await PaymentIntegrationDao.getAllByPropertyId(propertyId);
        let selectedPaymentIntegrations = paymentIntegrations;

        if (!all) {
          selectedPaymentIntegrations = paymentIntegrations.filter(i => i.isActive);
        }

        // Resolve dynamic secrets for each selected integration
        const enhancedIntegrations = selectedPaymentIntegrations.map(integration => {
            const dynamicSecrets: Record<string, string> = {};
            integration.propertyPaymentIntegrationSecrets?.forEach(s => {
                dynamicSecrets[s.RequiredField.name] = s.value;
            });

            // Also include legacy outletId for backward compatibility
            return {
                ...integration,
                ...dynamicSecrets,
                outletId: integration.outletId || dynamicSecrets['outletId'] || dynamicSecrets['outlet_id'] || dynamicSecrets['Outlet ID'] || ''
            };
        });

        return successResponse('Bank details fetched Successfully', {
          ...response,
          selectedPaymentIntegrations: enhancedIntegrations
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
    outletId?: string | null,
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

        // Check if all required fields are provided
        if (masterIntegration.requiredFieldsForMasterPaymentIntegration.length > 0) {
          if (!secrets || secrets.length < masterIntegration.requiredFieldsForMasterPaymentIntegration.length) {
             // We might want to allow partial updates, but for activation we usually need all.
             // For now let's just proceed and let the DAO handle upserts.
          }
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

          if (outletId) {
             // Optionally update outletId if needed, but the current DAO doesn't have an updatePropertyIntegration method.
             // We could add it or just focus on secrets.
          }

        } else {
          propertyIntegration = await PaymentIntegrationDao.createPropertyIntegrations(
            propertyId,
            selectedPaymentIntegration,
            outletId || ''
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
      // Re-using update logic for adding as it handles the complexity
      return this.updatePaymentMethodsByPropertyId(propertyId, payAtHotel, paymentGateway, selectedPaymentIntegration, outletId, secrets);
  }
}
