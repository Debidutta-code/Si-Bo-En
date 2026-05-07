import { prisma } from "../../config";
import { IApiResponse, successResponse, errorResponse } from "../../utils";
import { SpaPricingRepository, SpaDatesRepo, SpaRepository } from "../repository";
import { ICSpaPricing, IDSpaPricing } from "../types";

export class SpaPricingService {
    private spaPricingRepository: SpaPricingRepository;
    private spaDatesRepository: SpaDatesRepo;
    private spaRepository: SpaRepository;

    constructor() {
        this.spaPricingRepository = new SpaPricingRepository();
        this.spaDatesRepository = new SpaDatesRepo();
        this.spaRepository = new SpaRepository();
    }
    public async createSpaPricing(data: ICSpaPricing): Promise<IApiResponse> {
        try {
            const [reservation, spaDate] = await Promise.all([
                this.spaPricingRepository.getReservationById(data.reservationId),
                this.spaDatesRepository.getDateById(data.spaDateId)
            ]);
            if (!reservation) {
                return errorResponse("Reservation not found");
            }
            if (!spaDate) {
                return errorResponse("Spa date not found");
            }
            const spa = await this.spaRepository.getById(spaDate.spaModuleId);
            if (!spa) {
                return errorResponse("Spa not found");
            }
            if (!spa.isActive) {
                return errorResponse("Spa is not active");
            }
            if (!reservation.pricingBrakedownId) {
                return errorResponse("Reservation pricing  not found");
            }
            if (spa.isInclusive) {
                await this.spaPricingRepository.createSpaPricing({
                    price: 0,
                    pricingId: reservation.pricingBrakedownId,
                    spaSlotId: data.spaSlotId
                })
            } else {
                await Promise.all([

                    this.spaPricingRepository.createSpaPricing({
                        price: spa.discountValue ? spa.discountValue : 0,
                        pricingId: reservation.pricingBrakedownId,
                        spaSlotId: data.spaSlotId
                    }),
                    this.spaPricingRepository.updateReservationPricing(
                        {
                            reservationId: data.reservationId,
                            amount: reservation.amount + (spa.discountValue ? spa.discountValue : 0),
                            extraAmountToPay: reservation.extraAmountToPay + (spa.discountValue ? spa.discountValue : 0)
                        }


                    )
                ])

            }
            return successResponse("Spa slot created successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error while creating spa pricing", error.message);
            }
            return errorResponse("Error while creating spa pricing");
        }
    }
    public async deleteSpaPricing(data: IDSpaPricing): Promise<IApiResponse> {
        try {
            const [spaPricing, reservation] = await Promise.all([
                this.spaPricingRepository.getSpaPricingBySlotId(data.spaSlotId),
                this.spaPricingRepository.getReservationById(data.reservationId)
            ]);
            if (!spaPricing) {
                return errorResponse("Spa pricing not found");
            }
            if (!reservation) {
                return errorResponse("Reservation not found");
            }
            //case for spa amount is paid and got cancelled
            if (reservation.amount + reservation.extraAmountToPay >= reservation.paidAmount) {
                await this.spaPricingRepository.updatePricingForPaidAndCancelled({
                    reservationId: data.reservationId,
                    refundableAmount:spaPricing.price,
                    extraAmountToPay: reservation.extraAmountToPay - spaPricing.price
                });
            }else{// not paied and cancelled
                await this.spaPricingRepository.updatePricingForPaidAndCancelled({
                    reservationId: data.reservationId,
                    refundableAmount:reservation.refundAmount,
                    extraAmountToPay:reservation.extraAmountToPay-spaPricing.price
                    
                })
            }

            return successResponse("Spa slot deleted successfully");

        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error while deleting spa pricing", error.message);
            }
            return errorResponse("Error while deleting spa pricing");
        }
    }

}