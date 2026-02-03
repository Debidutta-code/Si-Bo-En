import { IApiResponse } from "../../utils";
import { successResponse,errorResponse } from "../../utils";
import { LoyaltyGuestRepository } from "../repository";
import {
    ICloyalityGuests
} from "../types";
import { paginatedSuccessResponse } from "../../utils";
import {GuestRepository} from "../../pms/frontoffice/guest/repository/guest.repository";
export class LoyaltyGuestService {
    private loyaltyGuestRepository: LoyaltyGuestRepository;
    private guestRepository: GuestRepository;

    constructor() {
        this.loyaltyGuestRepository = new LoyaltyGuestRepository();
        this.guestRepository = new GuestRepository();
    }
    public async createLoyaltyGuest(data:ICloyalityGuests ): Promise<IApiResponse> {
        try {
            const guestExists = await this.guestRepository.findGuestById(data.guestId);
            if (!guestExists) {
                return errorResponse("Guest not found");
            }
            if(guestExists.isALoyalityGuest){
                return errorResponse("You are already a loyalty guest for this property");
            }
            const existingLoyalty = await this.loyaltyGuestRepository.getLoyaltyGuestByPropertyAndGuest(data.propertyId,guestExists.email!);
            if (existingLoyalty) {
                return errorResponse("Loyalty guest already exists for this property");
            }

            const loyaltyGuest = await this.loyaltyGuestRepository.createGuestsLoyaltyConfig(data);

            return successResponse("Loyalty guest created successfully", loyaltyGuest);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to create a loyality guest",error.message)
            }
            return errorResponse("Failed to create a loyality guest");
        }
    }
    public async deleteLoyaltyGuest(loyaltyGuestId: string): Promise<IApiResponse> {
        try {
            const deletedLoyaltyGuest = await this.loyaltyGuestRepository.deleteLoyaltyGuestById(loyaltyGuestId);
            return successResponse("Loyalty guest deleted successfully", deletedLoyaltyGuest);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to delete loyalty guest",error.message)
            }
            return errorResponse("Failed to delete loyalty guest");
        }
    }
    public async createGetLoyalityGuestsForProperty(propertyId:string,skip:number=0,take:number=10): Promise<IApiResponse> {
        try {
            const [loyaltyGuests,count] = await Promise.all([
                this.loyaltyGuestRepository.getLoyalityGuestsForProperty(propertyId,skip,take),
                this.loyaltyGuestRepository.totalLoyalityGuestsForProperty(propertyId)
            ])
            return paginatedSuccessResponse("Loyalty guests fetched successfully", loyaltyGuests,{
                currentPage: Math.floor(skip / take) + 1,
                limit: take,
                totalCount: count,
                totalPages: Math.ceil(count / take),
                hasNextPage: skip + take < count,
                hasPrevPage: skip > 0
            });
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to get loyalty guests for property",error.message)
            }
            return errorResponse("Failed to get loyalty guests for property");
        }
    }
    public async getLoyalityGuestForcreationLoyality(creationLoyalityId:string,skip:number=0,take:number=10): Promise<IApiResponse> {
        try {
            const [loyaltyGuests,count] = await Promise.all([
                this.loyaltyGuestRepository.getLoyalityGuestForCreation(creationLoyalityId,skip,take),
                this.loyaltyGuestRepository.getTotalLoyalityGuests(creationLoyalityId)
            ])
            return paginatedSuccessResponse("Loyalty guests fetched successfully", loyaltyGuests,{
                currentPage: Math.floor(skip / take) + 1,
                limit: take,
                totalCount: count,
                totalPages: Math.ceil(count / take),
                hasNextPage: skip + take < count,
                hasPrevPage: skip > 0
            });
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to get loyalty guests for property",error.message)
            }
            return errorResponse("Failed to get loyalty guests for property");
        }
    }
}