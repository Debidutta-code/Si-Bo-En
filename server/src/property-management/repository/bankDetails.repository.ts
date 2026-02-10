import { prisma } from "../../config";

export class BankDetailsDao {
  public static async addBankDetails(
    propertyId: string,
    payAtHotel: boolean,
    paymentGateway: boolean,
    
  ) {
    try {
      const bankDetailsRes = await prisma.bankDetails.create({
        data: {
          propertyId: propertyId,
          paymentGateway: paymentGateway,
          payAtHotel: payAtHotel,
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

  public static async updatePaymentMethods(
    propertyId: string,
    paymentGateway: boolean,
    payAtHotel: boolean,
  ) {
    try {
      const bankDetailsRes = await prisma.bankDetails.create({
        data: {
          propertyId: propertyId,
          payAtHotel: payAtHotel,
          paymentGateway: paymentGateway,
        },
      });
//console.log("property id ",propertyId)
      await prisma.property.update({
        where: { id: propertyId },
        data: { isDraft: true },
      });

      return bankDetailsRes;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }



  public static async updatePaymentMethodsByPropertyId(
    propertyId: string,
    payAtHotel: boolean,
    paymentGateway: boolean,
   
  ) {
    try {
      return await prisma.bankDetails.update({
        where: {
          propertyId: propertyId,
        }, data: {
          paymentGateway: paymentGateway,
          payAtHotel: payAtHotel
        }
      })
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