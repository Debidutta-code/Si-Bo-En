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
    // private guestRepository: GuestRepository;

    constructor() {
        this.loyaltyGuestRepository = new LoyaltyGuestRepository();
        // this.guestRepository = new GuestRepository();
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

    /**
     * Register a new loyalty guest from booking engine (without guestId)
     */
    public async registerGuestFromBookingEngine(data: {
        email: string;
        propertyId: string;
        metadata: any;
    }): Promise<IApiResponse> {
        try {
            const { email, propertyId, metadata } = data;

            // Check if guest is already registered for this property's loyalty program
            const existingLoyalty = await this.loyaltyGuestRepository.getLoyaltyGuestByPropertyAndGuest(
                propertyId,
                email
            );

            if (existingLoyalty) {
                return errorResponse("You are already registered for this property's loyalty program");
            }

            // Get the property's loyalty config
            const loyaltyConfig = await this.loyaltyGuestRepository.getPropertyLoyaltyConfig(propertyId);
            
            if (!loyaltyConfig || !loyaltyConfig.isActive) {
                return errorResponse("Loyalty program is not active for this property");
            }

            if (!loyaltyConfig.creationLoyaltyConfigId) {
                return errorResponse("Loyalty program configuration is incomplete");
            }

            // Create loyalty guest without guestId (booking engine flow)
            const loyaltyGuestData: ICloyalityGuests = {
                creationLoyaltyConfigId: loyaltyConfig.creationLoyaltyConfigId,
                propertyId: propertyId,
                propertyCode: loyaltyConfig.Property.propertyCode,
                guestId: "", // Empty string, will be updated when guest books
                guestEmail: email,
                metaData: metadata,
            };

            const loyaltyGuest = await this.loyaltyGuestRepository.createGuestsLoyaltyConfigFromBookingEngine(
                loyaltyGuestData
            );

            return successResponse("Successfully registered for loyalty program", {
                id: loyaltyGuest.id,
                email: loyaltyGuest.guestEmail,
                propertyId: loyaltyGuest.propertyId,
                discountType: loyaltyConfig.CreationLoyaltyConfig.loyaltyDiscountType,
                discountValue: loyaltyConfig.CreationLoyaltyConfig.discountValue,
                currencyCode: loyaltyConfig.CreationLoyaltyConfig.currencyCode,
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to register for loyalty program", error.message);
            }
            return errorResponse("Failed to register for loyalty program");
        }
    }

    /**
     * Check if guest is a loyalty member and return discount details
     */
    public async checkLoyaltyDiscount(email: string, propertyId: string): Promise<IApiResponse> {
        try {
            // Check if loyalty guest exists
            const loyaltyGuest = await this.loyaltyGuestRepository.getLoyaltyGuestByPropertyAndGuest(
                propertyId,
                email
            );

            if (!loyaltyGuest) {
                return successResponse("Guest is not a loyalty member", {
                    isLoyaltyMember: false,
                    discount: null,
                });
            }

            // Get loyalty config to fetch discount details
            const loyaltyConfig = await this.loyaltyGuestRepository.getPropertyLoyaltyConfig(propertyId);

            if (!loyaltyConfig || !loyaltyConfig.isActive) {
                return successResponse("Loyalty program is not active", {
                    isLoyaltyMember: true,
                    discount: null,
                });
            }

            return successResponse("Loyalty discount available", {
                isLoyaltyMember: true,
                loyaltyGuestId: loyaltyGuest.id,
                discount: {
                    type: loyaltyConfig.CreationLoyaltyConfig.loyaltyDiscountType,
                    value: loyaltyConfig.CreationLoyaltyConfig.discountValue,
                    currencyCode: loyaltyConfig.CreationLoyaltyConfig.currencyCode,
                },
                metadata: loyaltyGuest.metaData,
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to check loyalty discount", error.message);
            }
            return errorResponse("Failed to check loyalty discount");
        }
    }

    /**
     * Get loyalty guest by email and property
     */
    public async getGuestByEmailAndProperty(email: string, propertyId: string): Promise<IApiResponse> {
        try {
            const loyaltyGuest = await this.loyaltyGuestRepository.getLoyaltyGuestByPropertyAndGuest(
                propertyId,
                email
            );

            if (!loyaltyGuest) {
                return errorResponse("Loyalty guest not found");
            }

            return successResponse("Loyalty guest fetched successfully", loyaltyGuest);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch loyalty guest", error.message);
            }
            return errorResponse("Failed to fetch loyalty guest");
        }
    }
}