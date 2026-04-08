import { IApiResponse } from "../../utils";
import { successResponse, errorResponse } from "../../utils";
import { LoyaltyGuestRepository, propertyLoyalityRepository } from "../repository";
import {
    ICloyalityGuests
} from "../types";
import { paginatedSuccessResponse } from "../../utils";
import { CreationGuestRepository } from "../repository/creation-guest.repository";
import { createHash } from "../../auth/utills/bcryptHelper";
export class LoyaltyGuestService {
    private loyaltyGuestRepository: LoyaltyGuestRepository;
    private creationGuestRepository: CreationGuestRepository;
    private propertyLoyaltyRepository: propertyLoyalityRepository;

    constructor() {
        this.loyaltyGuestRepository = new LoyaltyGuestRepository();
        this.creationGuestRepository = new CreationGuestRepository();
        this.propertyLoyaltyRepository = new propertyLoyalityRepository();
    }

    public async deleteLoyaltyGuest(loyaltyGuestId: string): Promise<IApiResponse> {
        try {
            const deletedLoyaltyGuest = await this.loyaltyGuestRepository.deleteLoyaltyGuestById(loyaltyGuestId);
            return successResponse("Loyalty guest deleted successfully", deletedLoyaltyGuest);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete loyalty guest", error.message)
            }
            return errorResponse("Failed to delete loyalty guest");
        }
    }
    public async getLoyalityGuestForcreationLoyality(creationLoyalityId: string, skip: number = 0, take: number = 10): Promise<IApiResponse> {
        try {
            const [loyaltyGuests, count] = await Promise.all([
                this.loyaltyGuestRepository.getLoyalityGuestForCreation(creationLoyalityId, skip, take),
                this.loyaltyGuestRepository.getTotalLoyalityGuests(creationLoyalityId)
            ])
            return paginatedSuccessResponse("Loyalty guests fetched successfully", loyaltyGuests, {
                currentPage: Math.floor(skip / take) + 1,
                limit: take,
                totalCount: count,
                totalPages: Math.ceil(count / take),
                hasNextPage: skip + take < count,
                hasPrevPage: skip > 0
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to get loyalty guests for property", error.message)
            }
            return errorResponse("Failed to get loyalty guests for property");
        }
    }
    public async getLoyalityGuestsForProperty(propertyId:string,skip:number=0,take:number=10): Promise<IApiResponse> {
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

    public async registerGuestFromBookingEngine(data: {
        email: string;
        propertyId: string;
        propertyCode: string;
        metaData: any;
        password: string;
    }): Promise<IApiResponse> {
        try {
            const { email, propertyId, propertyCode, metaData, password } = data;

            const existingGuest = await this.loyaltyGuestRepository.checkIfGuestExists(email);

            if (existingGuest) {
                const guestExistForProperty = await this.creationGuestRepository.checkIfGuestExist(propertyId, existingGuest.id);
                if (guestExistForProperty) {
                    return errorResponse("You are already registered for this property's loyalty program");
                }
                const getActiveLoyalityForProperty = await this.propertyLoyaltyRepository.getLoyalityForPropertyWhereTrue(propertyId);
                if (!getActiveLoyalityForProperty) {
                    return errorResponse("No active loyalty program found for this property");
                }
                const loyaltyConfigForEnrollment = await this.loyaltyGuestRepository.getPropertyLoyaltyConfig(propertyId);
                if (!loyaltyConfigForEnrollment) {
                    return errorResponse("No loyalty configuration found for this property");
                }
                await this.creationGuestRepository.createCreationGuest(
                    {
                        propertyId,
                        loyalityGuestId: existingGuest.id,
                        creationLoyaltyConfigId: loyaltyConfigForEnrollment.CreationLoyaltyConfig?.id || "",
                        propertyCode: propertyCode,
                        metaData: metaData,
                    });
                return successResponse("Successfully registered for loyalty program");
            }
            const hashedPassword = await createHash(password);
            const [newGuest, loyaltyConfig] = await Promise.all([
                this.loyaltyGuestRepository.createGuestsLoyaltyConfig({
                    guestEmail: email,
                    guestId: "",
                    password: hashedPassword,
                }),
                this.loyaltyGuestRepository.getPropertyLoyaltyConfig(propertyId)
            ]);

            if (!newGuest) {
                return errorResponse("Failed to create new guest");
            }
            if (!loyaltyConfig || !loyaltyConfig.isActive) {
                return errorResponse("Loyalty program is not active for this property");
            }

            await this.creationGuestRepository.createCreationGuest(
                {
                    propertyId,
                    loyalityGuestId: newGuest.id,
                    creationLoyaltyConfigId: loyaltyConfig.CreationLoyaltyConfig?.id || "",
                    propertyCode: propertyCode,
                    metaData: metaData,
                });
            return successResponse("Successfully registered for loyalty program");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to register for loyalty program", error.message);
            }
            return errorResponse("Failed to register for loyalty program");
        }
    }
    public async checkLoyaltyDiscount(email: string, propertyId: string): Promise<IApiResponse> {
        try {
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
            const currentGuestLevel = loyaltyGuest.guestLevel;
            // Levels now live on PropertyLoyaltyConfig — fetch them
            const propertyConfig = await this.propertyLoyaltyRepository.getActiveLoyaltyConfigByPropertyId(propertyId);
            const discountLevel = (propertyConfig as any)?.loyalityLevels?.find(
                (level: any) => level.level === currentGuestLevel
            )?.discountPercentage;
            return successResponse("Loyalty discount available", {
                isLoyaltyMember: true,
                discount: {
                    type: "percentage",
                    value: discountLevel,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to check loyalty discount", error.message);
            }
            return errorResponse("Failed to check loyalty discount");
        }
    }
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