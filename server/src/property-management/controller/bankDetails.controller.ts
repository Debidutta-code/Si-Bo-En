// controller/bank.controller.ts
import { Request, Response } from 'express';
import { BankService } from '../services';
import { errorResponse } from '../../utils/return';

export class BankController {
  public static async getBankDetailsByPropertyId(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      const response = await BankService.getBankDetailsByPropertyId(id);
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

  public static async addBankDetails(req: Request, res: Response) {
    try {
      const propertyId: any = req.params.id;
      const {
        payAtHotel,
        paymentGateway,
        selectedPaymentIntegrations = []
      } = req.body.activatedPaymentMethod;

      // Get user role from request (assuming it's attached by auth middleware)
      const userRole = (req as any).user?.role;

      if (!propertyId) {
        return res
          .status(400)
          .json(errorResponse('In sufficient Property details'));
      }

      if (!payAtHotel && !paymentGateway) {
        return res
          .status(400)
          .json(
            errorResponse('At least one payment method activation is required')
          );
      }

      const response = await BankService.addBankDetails(
        propertyId,
        payAtHotel,
        paymentGateway,
        selectedPaymentIntegrations,
        userRole
      );

      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }

  public static async updatePaymentMethodsByPropertyId(
    req: Request,
    res: Response
  ) {
    try {
      const propertyId: any = req.params.id;

      if (!propertyId) {
        return res
          .status(400)
          .json(errorResponse('In sufficient Property details'));
      }

      const { 
        payAtHotel, 
        paymentGateway,
        selectedPaymentIntegrations = []
      } = req.body.activatedPaymentMethod;

      // Get user role from request
      const userRole = (req as any).user?.role;

      if (!payAtHotel && !paymentGateway) {
        return res
          .status(400)
          .json(
            errorResponse('At least one payment method activation is required')
          );
      }

      const response = await BankService.updatePaymentMethodsByPropertyId(
        propertyId,
        payAtHotel,
        paymentGateway,
        selectedPaymentIntegrations,
        userRole
      );

      const status = response.success ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
}