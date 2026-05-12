import { normalizePaymentIntegrationName } from '../../property-management/utils/nameNormalizer';
import { PaymentIntegrationDao } from '../repository';
import { errorResponse, IApiResponse, successResponse } from '../../utils';

export class PaymentIntegrationService {
    public static async createPaymentIntegration(
        name: string
    ): Promise<IApiResponse> {
        try {
            const normalizedName = normalizePaymentIntegrationName(name);

            const isExists =
                await PaymentIntegrationDao.getPaymentIntegrationByName(
                    normalizedName
                );
            if (isExists) {
                return errorResponse(
                    'Payment integration with this name already exists'
                );
            }

            const daoRes =
                await PaymentIntegrationDao.createPaymentIntegration(
                    normalizedName
                );
            return successResponse(
                'Payment integration created successfully',
                daoRes
            );
        } catch (error: any) {
            return errorResponse(
                'Failed to create payment integration',
                error?.message
            );
        }
    }

    public static async getPaymentIntegrations(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const daoRes =
                await PaymentIntegrationDao.getAllForPropertyId(propertyId);
            return successResponse(
                'Payment integrations fetched successfully',
                daoRes
            );
        } catch (error: any) {
            return errorResponse(
                'Failed to fetch payment integrations',
                error?.message
            );
        }
    }
    public static async getMasterPaymentIntegrations(): Promise<IApiResponse> {
        try {
            const daoRes = await PaymentIntegrationDao.getAll();
            return successResponse(
                'Payment integrations fetched successfully',
                daoRes
            );
        } catch (error: any) {
            return errorResponse(
                'Failed to fetch payment integrations',
                error?.message
            );
        }
    }

    public static async updatePaymentIntegration(
        id: string,
        name: string
    ): Promise<IApiResponse> {
        try {
            const normalizedName = normalizePaymentIntegrationName(name);

            if (normalizedName) {
                const isExists =
                    await PaymentIntegrationDao.getPaymentIntegrationByName(
                        normalizedName
                    );
                if (isExists && isExists.id !== id) {
                    return errorResponse(
                        'Payment integration with this name already exists'
                    );
                }
            }

            const daoRes = await PaymentIntegrationDao.updatePaymentIntegration(
                id,
                normalizedName,
                true
            );
            return successResponse(
                'Payment integration updated successfully',
                daoRes
            );
        } catch (error: any) {
            return errorResponse(
                'Failed to update payment integration',
                error?.message
            );
        }
    }

    public static async deletePaymentIntegration(
        id: string
    ): Promise<IApiResponse> {
        try {
            const daoRes =
                await PaymentIntegrationDao.deletePaymentIntegration(id);
            return successResponse(
                'Payment integration deleted successfully',
                daoRes
            );
        } catch (error: any) {
            return errorResponse(
                'Failed to delete payment integration',
                error?.message
            );
        }
    }
}
