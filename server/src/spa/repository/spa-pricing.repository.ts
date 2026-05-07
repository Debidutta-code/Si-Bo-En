import { prisma } from "../../config";
import { ICSpaPricingR, ISpaPricing, ISpaReservation } from "../types";
export class SpaPricingRepository {

    public async createSpaPricing(data: ICSpaPricingR): Promise<ISpaPricing> {
        try {
            return await prisma.spaPricing.create({
                data: data
            });
        } catch (error) {
            throw new Error("Error while adding spa slot pricing")
        }
    }
    public async deleteSpaPricing(spaSlotId: string): Promise<void> {
        try {
            await prisma.spaPricing.delete({
                where: { spaSlotId: spaSlotId }
            });
        } catch (error) {
            throw new Error("Error while deleting spa slot pricing");
        }
    }
    public async getReservationById(reservationId: string): Promise<ISpaReservation | null> {
        try {
            return await prisma.reservation.findUnique({
                where: { id: reservationId },
                select: {
                    id: true,
                    amount: true,
                    currencyCode: true,
                    extraAmountToPay: true,
                    pricingBrakedownId: true
                }
            });
        } catch (error) {
            throw new Error("Error while fetching spa slot pricing");
        }
    }
    public async updateReservationPricing({reservationId, amount, extraAmountToPay}: {reservationId: string, amount: number, extraAmountToPay: number}): Promise<ISpaReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: {
                    amount: amount,
                    extraAmountToPay: extraAmountToPay
                }
            });
        } catch (error) {
            throw new Error("Error while updating spa slot pricing");
        }
    }
}