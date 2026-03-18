import { prisma } from "../../config";
import { ICreatePromoCode, IRPromoCode } from "../types"
export class PromoCodeRepository {
    public async createPromoCode(data: ICreatePromoCode) {
        return await prisma.promoCode.create({ data });
    }


    //Read methods By Id and By PropertyId and By Code

    public async getPromoCodeById(id: string): Promise<IRPromoCode | null> {
        return await prisma.promoCode.findUnique({ where: { id, isDeleted: false } });
    }
    public async getPromoCodesByPropertyId(propertyId: string): Promise<IRPromoCode[] | null> {
        return await prisma.promoCode.findMany({ where: { propertyId, isDeleted: false } });
    }
    public async getPromoCodeByCode(code: string): Promise<IRPromoCode | null> {
        return await prisma.promoCode.findUnique({ where: { code, isDeleted: false } });
    }

    public async checkIfCodeIsAlreadyExistsForThisProperty(propertyId: string, code: string): Promise<IRPromoCode | null> {
        return await prisma.promoCode.findUnique({ where: { code, propertyId } });
    }

    public async getPromoCodeByIdOrCode(propertyId: string, params: string): Promise<IRPromoCode | null> {
        return await prisma.promoCode.findFirst({ where: { propertyId, OR: [{ id: params }, { code: params }], isDeleted: false } });
    }

    //Update methods By Id and By Code
    public async updatePromoCodeByCode(code: string, data: Partial<ICreatePromoCode>): Promise<IRPromoCode | null> {
        return await prisma.promoCode.update({
            where: { code, isDeleted: false },
            data,
        });
    }
    public async updatePromoCodeById(id: string, data: Partial<ICreatePromoCode>): Promise<IRPromoCode | null> {
        return await prisma.promoCode.update({
            where: { id, isDeleted: false },
            data,
        });
    }


    //Delete both soft and hard delete methods By Id and By Code
    public async softDeletePromoCodeById(id: string): Promise<IRPromoCode | null> {
        return await prisma.promoCode.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
    public async hardDeletePromoCodeById(id: string): Promise<IRPromoCode | null> {
        return await prisma.promoCode.delete({
            where: { id },
        });
    }
    public async softDeletePromoCodeByCode(code: string): Promise<IRPromoCode | null> {
        return await prisma.promoCode.update({
            where: { code },
            data: { isDeleted: true },
        });
    }
    public async hardDeletePromoCodeByCode(code: string): Promise<IRPromoCode | null> {
        return await prisma.promoCode.delete({
            where: { code },
        });
    }


    //Recover Deleted PromoCode By Id and By Code
    public async recoverPromoCodeById(id: string): Promise<IRPromoCode | null> {
        return await prisma.promoCode.update({
            where: { id },
            data: { isDeleted: false },
        });
    }
    public async recoverPromoCodeByCode(code: string): Promise<IRPromoCode | null> {
        return await prisma.promoCode.update({
            where: { code },
            data: { isDeleted: false },
        });
    }

}