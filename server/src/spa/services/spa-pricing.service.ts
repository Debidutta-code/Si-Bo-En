import { IApiResponse, successResponse, errorResponse } from "../../utils";
import { SpaPricingRepository,SpaDatesRepo,SpaRepository } from "../repository";
import { ICSpaPricing } from "../types";

export class SpaPricingService {
    private spaPricingRepository: SpaPricingRepository;
    private spaDatesRepository: SpaDatesRepo;
    private spaRepository: SpaRepository;

    constructor() {
        this.spaPricingRepository = new SpaPricingRepository();
        this.spaDatesRepository = new SpaDatesRepo();
        this.spaRepository = new SpaRepository();
    }
    public async createSpaPricing(data: ICSpaPricing) {
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
            const spa=await this.spaRepository.getById(spaDate.spaModuleId);
            if (!spa) {
                return errorResponse("Spa not found");
            }
            if(!spa.isActive) {
                return errorResponse("Spa is not active");
            }
            if(!reservation.pricingBrakedownId) {
                return errorResponse("Reservation pricing  not found");
            }
            if(spa.isInclusive){
                await this.spaPricingRepository.createSpaPricing({
                    price: 0,
                    pricingId: reservation.pricingBrakedownId,
                    spaSlotId: data.spaSlotId
                })
            }
            // const result = await this.spaPricingRepository.createSpaPricing(data);
            // return successResponse(result);
        } catch (error) {
            return errorResponse("Error while creating spa pricing");
        }
    }
}