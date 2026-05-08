import { BatchPayload } from '../../ari/types';
import { prisma } from '../../config';
import { IPricingBreakDown } from '../../reservation/types';
import {
    ICSpaPricingR,
    IRateplanTax,
    ISpaPricing,
    ISpaReservation,
    ITaxBrakeDown,
} from '../types';
export class SpaPricingRepository {
    public async createSpaPricing(data: ICSpaPricingR): Promise<ISpaPricing> {
        try {
            return await prisma.spaPricing.create({
                data: data,
            });
        } catch (error) {
            throw new Error('Error while adding spa slot pricing');
        }
    }
    public async deleteSpaPricing(spaSlotId: string): Promise<ISpaPricing> {
        try {
            return await prisma.spaPricing.delete({
                where: { spaSlotId: spaSlotId },
            });
        } catch (error) {
            throw new Error('Error while deleting spa slot pricing');
        }
    }
    public async getSpaPricingBySlotId(
        spaSlotId: string
    ): Promise<ISpaPricing | null> {
        try {
            return await prisma.spaPricing.findUnique({
                where: { spaSlotId: spaSlotId },
            });
        } catch (error) {
            throw new Error('Error while fetching spa slot pricing');
        }
    }
    public async getReservationById(
        reservationId: string
    ): Promise<ISpaReservation | null> {
        try {
            return await prisma.reservation.findUnique({
                where: { id: reservationId },
                select: {
                    id: true,
                    amount: true,
                    currencyCode: true,
                    extraAmountToPay: true,
                    pricingBrakedownId: true,
                    refundAmount: true,
                    paidAmount: true,
                    ratePlanCode: true,
                },
            });
        } catch (error) {
            throw new Error('Error while fetching spa slot pricing');
        }
    }
    public async updateReservationPricing({
        reservationId,
        extraAmountToPay,
    }: {
        reservationId: string;
        extraAmountToPay: number;
    }): Promise<ISpaReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: {
                    extraAmountToPay: extraAmountToPay,
                },
            });
        } catch (error) {
            throw new Error('Error while updating spa slot pricing');
        }
    }
    public async updatePricingForPaidAndCancelled({
        reservationId,
        refundableAmount,
        extraAmountToPay,
    }: {
        reservationId: string;
        refundableAmount: number;
        extraAmountToPay: number;
    }): Promise<ISpaReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: {
                    refundAmount: refundableAmount,
                    extraAmountToPay: extraAmountToPay,
                },
            });
        } catch (error) {
            throw new Error('Error while updating spa slot pricing');
        }
    }
    public async getPricingBreakdown(
        reservationId: string
    ): Promise<IPricingBreakDown | null> {
        try {
            return await prisma.pricingBreakdown.findUnique({
                where: { reservationId: reservationId },
            });
        } catch (error) {
            throw new Error('Error while fetching pricing breakdown');
        }
    }
    public async updatePriceBrakeDown({
        priceBrakeDownId,
        amountBeforeTax,
        newTotalAmount,
        totalSpaAmount,
        taxedAmount,
    }: {
        priceBrakeDownId: string;
        amountBeforeTax: number;
        newTotalAmount: number;
        totalSpaAmount: number;
        taxedAmount: number;
    }): Promise<IPricingBreakDown> {
        try {
            return await prisma.pricingBreakdown.update({
                where: { id: priceBrakeDownId },
                data: {
                    amountBeforeTax,
                    taxedAmount,
                    totalAmount: newTotalAmount,
                    totalSpa: totalSpaAmount,
                },
            });
        } catch (error) {
            throw new Error('Failed to add spa pricing');
        }
    }
    public async deleteTaxBrakedowns(
        priceBrakeDownId: string
    ): Promise<BatchPayload> {
        try {
            return await prisma.taxBrakeDown.deleteMany({
                where: {
                    pricingBrakeDownId: priceBrakeDownId,
                },
            });
        } catch (error) {
            throw new Error('Failed to delete taxes');
        }
    }
    public async createTaxBrakeDowns(
        data: ITaxBrakeDown[]
    ): Promise<BatchPayload> {
        try {
            return await prisma.taxBrakeDown.createMany({
                data: data,
            });
        } catch (error) {
            throw new Error('Failed to create tax breakdown');
        }
    }
    public async getApplicableTaxes(
        ratePlanCode: string
    ): Promise<IRateplanTax | null> {
        try {
            return await prisma.ratePlan.findUnique({
                where: {
                    ratePlanCode,
                },
                include: {
                    taxGroup: {
                        where: {
                            isActive: true,
                        },
                        include: {
                            taxGroupRules: {
                                include: {
                                    taxRule: {
                                        select: {
                                            id: true,
                                            name: true,
                                            currencyCode: true,
                                            priority: true,
                                            value: true,
                                            type: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Failed to fetch applicable taxes');
        }
    }
}
