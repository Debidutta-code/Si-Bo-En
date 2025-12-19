import {prisma} from "../../config";

export class BankDetailsDao {
  public static async getBankDetailsByPropertyId(id: string) {
    try {
      return await prisma.bankDetails.findUnique({
        where: {
          propertyId: id,
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
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
    upi: boolean
  ) {
    try {
      const bankDetailsRes = await prisma.bankDetails.create({
        data: {
          propertyId: propertyId,
          accountHolder: accountHolder,
          accountNumber: accountNumber,
          ifsc: ifsc,
          upiId: upiId,
          activatedPaymentMethod: {
            payAtHotel: payAtHotel,
            upi: upi,
            bankTransfer: bankTransfer,
            gateway: false,
          },
        },
      });

      await prisma.property.update({
        where: { id: propertyId },
        data: { isDraft: true },
      });

      return bankDetailsRes;
    } catch (error: any) {
      throw new Error(error.message);
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
      return await prisma.bankDetails.update({
        where: { propertyId: propertyId },
        data: {
          accountHolder: accountHolder,
          accountNumber: accountNumber,
          ifsc: ifsc,
          upiId: upiId,
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
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
      // First get the current payment methods
      const currentBankDetails = await prisma.bankDetails.findUnique({
        where: { propertyId: propertyId },
        select: { activatedPaymentMethod: true },
      });

      const currentPaymentMethods = (currentBankDetails?.activatedPaymentMethod as any) || {};

      return await prisma.bankDetails.update({
        where: { propertyId: propertyId },
        data: {
          activatedPaymentMethod: {
            ...currentPaymentMethods,
            payAtHotel: payAtHotel,
            bankTransfer: bankTransfer,
            upi: upi,
            gateway: gateway,
          },
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public static async updateBankDetails(
    id: string,
    accountHolder: string,
    accountNumber: string,
    ifsc: string,
    upiId: string
  ) {
    try {
      return await prisma.bankDetails.update({
        where: { id: id },
        data: {
          accountHolder: accountHolder,
          accountNumber: accountNumber,
          ifsc: ifsc,
          upiId: upiId,
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public static async updatePaymentMethods(
    id: string,
    payAtHotel: boolean,
    bankTransfer: boolean,
    upi: boolean,
    gateway: boolean
  ) {
    try {
      // First get the current payment methods
      const currentBankDetails = await prisma.bankDetails.findUnique({
        where: { id: id },
        select: { activatedPaymentMethod: true },
      });

      const currentPaymentMethods = (currentBankDetails?.activatedPaymentMethod as any) || {};

      return await prisma.bankDetails.update({
        where: { id: id },
        data: {
          activatedPaymentMethod: {
            ...currentPaymentMethods,
            payAtHotel: payAtHotel,
            bankTransfer: bankTransfer,
            upi: upi,
            gateway: gateway,
          },
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public static async getIdFromPropertyCode(code: string) {
    try {
      return await prisma.property.findFirst({
        where: { propertyCode: code },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}