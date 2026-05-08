// controller/bank.controller.ts
import { Request, Response } from 'express';
import { BankService } from '../services';
import { errorResponse } from '../../utils/return';
import { CustomRequest, PropertyRequest } from '../../utils';

export class BankController {
    public static async getBankDetailsByPropertyId(
        req: PropertyRequest,
        res: Response
    ) {
        try {
            const id = req.params.id;
            const from = req.query.from as string;

            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Property id not found'));
            }
            const response = await BankService.getBankDetailsByPropertyId(
                id,
                from
            );
            if (response.success) {
                return res.status(200).json(response);
            } else {
                return res.status(500).json(response);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public static async addBankDetails(req: CustomRequest, res: Response) {
        try {
            const propertyId = req.params.id;
            const {
                payAtHotel,
                paymentGateway,
                selectedPaymentIntegration,
                outletId,
            } = req.body.activatedPaymentMethod;

            const userRole = req.user?.role;
            if (!userRole) {
                return res
                    .status(403)
                    .json(errorResponse('User role not found'));
            }

            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('In sufficient Property details'));
            }
            if (!payAtHotel && !paymentGateway) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'At least one payment method activation is required'
                        )
                    );
            }
            if (userRole !== 'super_admin' && paymentGateway) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            'Only Super Admin can activate payment gateway'
                        )
                    );
            }
            if (selectedPaymentIntegration && !outletId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Outlet ID is required for selected payment integration'
                        )
                    );
            }
            const response = await BankService.addBankDetails(
                propertyId,
                payAtHotel,
                paymentGateway,
                selectedPaymentIntegration,
                outletId
            );

            return res.status(response.success ? 200 : 400).json(response);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public static async updatePaymentMethodsByPropertyId(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const propertyId: string = req.params.id;

            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('In sufficient Property details'));
            }

            const {
                payAtHotel,
                paymentGateway,
                selectedPaymentIntegration,
                outletId,
            } = req.body.activatedPaymentMethod;

            if (req.user?.role !== 'super_admin' && paymentGateway) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            'Only Super Admin can activate payment gateway'
                        )
                    );
            }

            if (!payAtHotel && !paymentGateway) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'At least one payment method activation is required'
                        )
                    );
            }

            const response = await BankService.updatePaymentMethodsByPropertyId(
                propertyId,
                payAtHotel,
                paymentGateway,
                selectedPaymentIntegration,
                outletId
            );

            return res.status(response.success ? 200 : 400).json(response);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
}
