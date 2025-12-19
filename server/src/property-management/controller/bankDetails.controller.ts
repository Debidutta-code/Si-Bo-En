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
        accountHolder,
        accountNumber,
        ifsc,
        upiId,
        activatedPaymentMethod,
      } = req.body;
      const { payAtHotel, bankTransfer, upi, gateway } = activatedPaymentMethod;
      if (!propertyId) {
        return res
          .status(400)
          .json(errorResponse('In sufficient Property details'));
      }
      if (!accountHolder) {
        return res
          .status(400)
          .json(
            errorResponse('Account Holder Name is required to Add BankDetails')
          );
      }
      if (!accountNumber) {
        return res
          .status(400)
          .json(
            errorResponse('Account Number  is required to Add BankDetails')
          );
      }
      if (!ifsc) {
        return res
          .status(400)
          .json(errorResponse('IFSC code is required to Add BankDetails'));
      }
      if (!upiId) {
        return res
          .status(400)
          .json(
            errorResponse(
              'Upi Id is required to receive payments through upi and adding bank details'
            )
          );
      }
      if (!payAtHotel && !bankTransfer && !upi && !gateway) {
        return res
          .status(400)
          .json(
            errorResponse('At lest one payment method activation is required')
          );
      }
      const response = await BankService.addBankDetails(
        propertyId,
        accountHolder,
        accountNumber,
        ifsc,
        upiId,
        payAtHotel,
        bankTransfer,
        upi,
        gateway
      );
      const status = response ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async updateBankDetailsByPropertyId(
    req: Request,
    res: Response
  ) {
    const { accountHolder, accountNumber, ifsc, upiId } = req.body;
    const propertyId: any = req.params.id;

    if (!propertyId) {
      return res
        .status(400)
        .json(errorResponse('In sifficient Property details'));
    }
    if (!accountHolder) {
      return res
        .status(400)
        .json(
          errorResponse('Account Holder Name is required to Add BankDetails')
        );
    }
    if (!accountNumber) {
      return res
        .status(400)
        .json(errorResponse('Account Number  is required to Add BankDetails'));
    }
    if (!ifsc) {
      return res
        .status(400)
        .json(errorResponse('IFSC code is required to Add BankDetails'));
    }
    if (!upiId) {
      return res
        .status(400)
        .json(
          errorResponse(
            'Upi Id is required to receive payments through upi and adding bank details'
          )
        );
    }
    const response = await BankService.updateBankDetailsByPropertyId(
      propertyId,
      accountHolder,
      accountNumber,
      ifsc,
      upiId
    );

    const status = response ? 200 : 400;
    return res.status(status).json(response);
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
      const { payAtHotel, bankTransfer, upi, gateway } =
        req.body.activatedPaymentMethod;
      if (!payAtHotel && !bankTransfer && !upi && !gateway) {
        return res
          .status(400)
          .json(
            errorResponse('At lest one payment method activation is required')
          );
      }
      const response = await BankService.updatePaymentMethodsByPropertyId(
        propertyId,
        payAtHotel,
        bankTransfer,
        upi,
        gateway
      );

      const status = response ? 200 : 400;
      return res.status(status).json(response);
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
}
