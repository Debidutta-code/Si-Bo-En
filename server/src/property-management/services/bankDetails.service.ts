// services/bank.service.ts
import { errorResponse, successResponse } from '../../utils/return';
import { BankDetailsDao } from '../repository';
import { PaymentIntegrationDao } from '../repository'; // You'll need to create this

export class BankService {
  public static async getBankDetailsByPropertyId(propertyId: string) {
    try {
      const response = await BankDetailsDao.getBankDetailsByPropertyId(propertyId);
      if (response) {
        // Fetch associated payment integrations
        const paymentIntegrations = await PaymentIntegrationDao.getByPropertyId(propertyId);
        
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
    selectedPaymentIntegrations: string[] = [],
    userRole: string
  ) {
    try {
      // Check if paymentGateway is true
      if (paymentGateway) {
        // Check if user is super_admin
        if (userRole !== 'super_admin') {
          return errorResponse('Only super admin can enable payment gateway');
        }

        // Check if selectedPaymentIntegrations is provided
        if (!selectedPaymentIntegrations || selectedPaymentIntegrations.length === 0) {
          return errorResponse('Please select at least one payment integration');
        }

        // Validate that the selected payment integrations exist and are active
        const validIntegrations = await PaymentIntegrationDao.validateMasterIntegrations(
          selectedPaymentIntegrations
        );
        
        if (!validIntegrations) {
          return errorResponse('Invalid payment integration selected');
        }
      }

      // Create bank details
      const response = await BankDetailsDao.addBankDetails(
        propertyId,
        payAtHotel,
        paymentGateway
      );

      if (response) {
        // If paymentGateway is true, create PropertyPaymentIntegration records
        if (paymentGateway && selectedPaymentIntegrations.length > 0) {
          await PaymentIntegrationDao.createPropertyIntegrations(
            propertyId,
            selectedPaymentIntegrations
          );
        }

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
  selectedPaymentIntegrations: string[] = [],
  userRole: string
) {
  try {
    // Check if paymentGateway is true
    if (paymentGateway) {
      // Check if user is super_admin
      if (userRole !== 'super_admin') {
        return errorResponse('Only super admin can enable payment gateway');
      }

      // Check if selectedPaymentIntegrations is provided
      if (!selectedPaymentIntegrations || selectedPaymentIntegrations.length === 0) {
        return errorResponse('Please select at least one payment integration');
      }

      // Validate that the selected payment integrations exist and are active
      const validIntegrations = await PaymentIntegrationDao.validateMasterIntegrations(
        selectedPaymentIntegrations
      );
      
      if (!validIntegrations) {
        return errorResponse('Invalid payment integration selected');
      }
    }

    const response = await BankDetailsDao.updatePaymentMethodsByPropertyId(
      propertyId,
      payAtHotel,
      paymentGateway
    );

    if (response) {
      // Update PropertyPaymentIntegration records
      if (paymentGateway && selectedPaymentIntegrations.length > 0) {
        // Replace existing integrations with new ones (atomic operation)
        await PaymentIntegrationDao.updatePropertyIntegrations(
          propertyId,
          selectedPaymentIntegrations
        );
      } else if (!paymentGateway) {
        // If paymentGateway is disabled, delete all integrations
        await PaymentIntegrationDao.deletePropertyIntegrations(propertyId);
      }

      return successResponse('Payment methods Updated Successfully', response);
    } else {
      return errorResponse('Failed to update payment methods');
    }
  } catch (error: any) {
    return errorResponse('Internal server Error', error?.message);
  }
}
}