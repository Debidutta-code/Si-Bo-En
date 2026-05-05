import { CustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { PaymentIntegrationService } from '../services';
import { Response } from 'express';
export class PaymentIntegrationController {
    public static async createPaymentIntegration(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const { name } = req.body;
            if (!name || typeof name !== 'string') {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Payment integration name is required and must be a string'
                        )
                    );
            }

            const serRes =
                await PaymentIntegrationService.createPaymentIntegration(name);
            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public static async getPaymentIntegrations(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const propertyId = req.query.propertyId as string;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('insufficient parameters'));
            }
            const serRes =
                await PaymentIntegrationService.getPaymentIntegrations(
                    propertyId
                );
            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Internal Server Error', error.message)
                    );
            }
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
    public static async getMasterPaymentIntegrations(
        req: CustomRequest,
        res: Response
    ) {
         try {
            const serRes =
                await PaymentIntegrationService.getMasterPaymentIntegrations();
            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Internal Server Error', error.message)
                    );
            }
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }

    public static async updatePaymentIntegration(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            if (!name) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Payment integration name is required to update'
                        )
                    );
            }
            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Payment integration ID is required'));
            }

            const serRes =
                await PaymentIntegrationService.updatePaymentIntegration(
                    id,
                    name
                );
            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public static async deletePaymentIntegration(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const { id } = req.params;

            if (!id) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Payment integration ID is required to delete'
                        )
                    );
            }

            const serRes =
                await PaymentIntegrationService.deletePaymentIntegration(id);
            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
}
