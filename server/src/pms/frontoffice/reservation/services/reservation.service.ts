import {
    ReservationRepository,
    PriceBrakeDownRepo,
    AriManupulationRepo,
    GuestRepository
} from "../repository";
import { successResponse, errorResponse } from "../../../../utils/return";
import { IApiResponse } from "../../../../utils/return.types";
import {
    ICReservation,
    IReservationPriceBrakeDownR,
    IAriManulupulation,
    ICreateReservationPayload,
    ICGuest
} from "../types";
import { prisma } from "../../../../config";
import { IPropertyCodeAndIds } from "../../../../dashboard/types";
import { DashUtilsRepo } from "../../../../dashboard/repository";
import { Decimal } from "@prisma/client/runtime/library";

export class ReservationService {
    reservationRepository: ReservationRepository;
    priceBrakeDownRepo: PriceBrakeDownRepo;
    ariManupulationRepo: AriManupulationRepo;
    guestRepository: GuestRepository;
    dashUtils: DashUtilsRepo;
    constructor() {
        this.reservationRepository = new ReservationRepository();
        this.priceBrakeDownRepo = new PriceBrakeDownRepo();
        this.ariManupulationRepo = new AriManupulationRepo();
        this.guestRepository = new GuestRepository();
                this.dashUtils = new DashUtilsRepo();
    }

    private async generateBookingCode(): Promise<string> {
        const code = 'BOOK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const existingReservation = await this.reservationRepository.getReservaltionByCode(code);
        
        if (existingReservation !== null) {
            return this.generateBookingCode();
        }
        return code;
    }

    private generateDateRange(startDate: string, endDate: string): string[] {
        const dates: string[] = [];
        let currentDate = new Date(startDate);
        const toDate = new Date(endDate);

        while (currentDate < toDate) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    }

    private mapPaymentMethod(method: string): "pay_at_hotel" | "net_banking" | "upi" | "payment_gateway" {
        const methodMap: Record<string, "pay_at_hotel" | "net_banking" | "upi" | "payment_gateway"> = {
            "payAtHotel": "pay_at_hotel",
            "pay_at_hotel": "pay_at_hotel",
            "netBanking": "net_banking",
            "net_banking": "net_banking",
            "upi": "upi",
            "paymentGateway": "payment_gateway",
            "payment_gateway": "payment_gateway"
        };
        return methodMap[method] || "pay_at_hotel";
    }

    // Normalize/transform incoming payload to match expected format
    private normalizePayload(payload: any): ICreateReservationPayload["data"] {
        const { bookingDetails, guestDetails } = payload;
        const { finalPrice } = bookingDetails;

        // Fix tax/taxes field mismatch
        if (finalPrice.tax && !finalPrice.taxes) {
            finalPrice.taxes = finalPrice.tax;
            delete finalPrice.tax;
        }

        // Add missing totalTaxAmount if not present
        if (finalPrice.totalTaxAmount === undefined) {
            finalPrice.totalTaxAmount = finalPrice.totalTax || 0;
        }

        // Add missing subtotal if not present
        if (finalPrice.subtotal === undefined) {
            finalPrice.subtotal = finalPrice.totalAmount || finalPrice.priceAfterTax || 0;
        }

        // Add missing taxBreakdown if not present
        if (!finalPrice.taxBreakdown) {
            finalPrice.taxBreakdown = {
                totalBaseAmount: finalPrice.breakdown?.totalBaseAmount || 0,
                totalAdditionalCharges: finalPrice.breakdown?.totalAdditionalCharges || 0,
                totalAmount: finalPrice.breakdown?.totalAmount || finalPrice.totalAmount || 0,
                numberOfNights: finalPrice.numberOfNights || 1,
                averagePerNight: finalPrice.breakdown?.averagePerNight || finalPrice.totalAmount || 0,
                totalTax: finalPrice.totalTax || 0
            };
        }

        // Fix empty dateOfBirth in guestDetails
        const normalizedGuestDetails = guestDetails.map((guest: any) => ({
            ...guest,
            dateOfBirth: guest.dateOfBirth || null
        }));

        return {
            bookingDetails: {
                ...bookingDetails,
                finalPrice
            },
            guestDetails: normalizedGuestDetails,
            bankDetails: payload.bankDetails
        };
    }

    public async createReservation(payload: any): Promise<IApiResponse> {
        try {
            // Normalize the payload first
            const normalizedPayload = this.normalizePayload(payload);
            const { bookingDetails, guestDetails } = normalizedPayload;

            const {
                startDate,
                endDate,
                propertyCode,
                hotelName,
                roomTypeCode,
                ratePlanCode,
                finalPrice,
                currency,
                email,
                phone,
                paymentMethod
            } = bookingDetails;

            // 1️⃣ Resolve property
            const propertyId = await this.getPropertyIdByCode(propertyCode);
            if (!propertyId) {
                return errorResponse("Property not found");
            }

            // 2️⃣ Primary guest - Use first guest from guestDetails array
            const primaryGuestData = guestDetails[0];
            if (!primaryGuestData) {
                return errorResponse("At least one guest is required");
            }

            let primaryGuestId: string;

            // Check if guest exists with this email
            const existingGuest = await this.guestRepository.getGuestByEmail(email);
            
            if (existingGuest) {
                primaryGuestId = existingGuest.id;
                console.log("Existing guest found:", primaryGuestId);
            } else {
                // Create new guest using first guest data + booking email/phone
                const newGuestPayload: ICGuest = {
                    firstName: primaryGuestData.firstName,
                    lastName: primaryGuestData.lastName,
                    email: email,
                    phoneNumber: phone || null,
                    propertyId: propertyId,
                    userType: primaryGuestData.type as "adult" | "child" | "infant",
                    address: null,
                    city: null,
                    state: null,
                    country: null,
                    zipCode: null
                };

                const newGuest = await this.guestRepository.createGuest(newGuestPayload);
                primaryGuestId = newGuest.id;
                console.log("New guest created:", primaryGuestId);
            }

            // 3️⃣ Generate booking code
            const bookingCode = await this.generateBookingCode();

            // 4️⃣ Build reservation payload
            const reservationPayload: ICReservation = {
                bookingCode,
                propertyId,
                propertyCode,
                hotelName,
                roomTypeCode,
                ratePlanCode,
                
                checkInDate: new Date(startDate),
                checkOutDate: new Date(endDate),
                bookedAt: new Date(),
                
                primaryGuestId,
                guests: guestDetails, // Store all guests as JSON snapshot
                bookingUserEmail: email,
                bookingUserPhone: phone || null,
                
                amount: finalPrice.totalAmount,
                currencyCode: currency,
                finalPrice: finalPrice, // Store entire finalPrice object as JSON
                
                paidAmount: 0,
                extraAmountToPay: 0,
                refundAmount: 0,
                
                paymentMethod: this.mapPaymentMethod(paymentMethod),
                paymentImages: null,
                
                bookingStatus: "confirmed",
                cancellationReason: null,
                
                bookingSource: "ota",
                
                isPromoUsed: false,
                promoId: null
            };

            // 5️⃣ Create reservation
            const reservation = await this.reservationRepository.createReservation(reservationPayload);
            console.log("Reservation created:", reservation.id);

            // 6️⃣ Create price breakdown
            const priceBreakdownPayload: IReservationPriceBrakeDownR = {
                reservationId: reservation.id,
                additionalGuestCharges: finalPrice.additionalGuestCharges,
                baseRatePerNight: finalPrice.baseRatePerNight,
                numberOfNights: finalPrice.numberOfNights,
                priceAfterTax: new Decimal(finalPrice.subtotal),
                totalAmount: new Decimal(finalPrice.totalAmount),
                totalTax: new Decimal(finalPrice.totalTaxAmount),
                breakdown: finalPrice.breakdown,
                dailyBreakdown: finalPrice.dailyBreakdown,
                availableRooms: finalPrice.availableRooms,
                requestedRooms: finalPrice.requestedRooms,
                tax: finalPrice.taxes
            };

            await this.priceBrakeDownRepo.createpriceBrakeDowns([priceBreakdownPayload]);
            console.log("Price breakdown created");

            // 7️⃣ Update ARI (decrease room availability)
            const reservationDates = this.generateDateRange(startDate, endDate);
            const ariPayload: IAriManulupulation = {
                propertyCode,
                dates: reservationDates,
                roomInfos: [{
                    roomTypeCode,
                    numberOfRooms: finalPrice.requestedRooms || 1
                }]
            };

            await this.ariManupulationRepo.decreaseAvailableRooms(ariPayload);
            console.log("ARI updated - rooms decreased");

            return successResponse("Reservation created successfully", reservation);
        } catch (error) {
            console.error("Error creating reservation:", error);
            if (error instanceof Error) {
                return errorResponse("Failed to create reservation", error.message);
            }
            return errorResponse("Failed to create reservation");
        }
    }

    // Helper method to get propertyId from propertyCode
    private async getPropertyIdByCode(propertyCode: string): Promise<string | null> {
        try {
            const property = await prisma.property.findUnique({
                where: { propertyCode },
                select: { id: true }
            });
            return property?.id || null;
        } catch (error) {
            return null;
        }
    }

    public async getReservaltionByCode(reservationCode: string): Promise<IApiResponse> {
        try {
            const reservation = await this.reservationRepository.getReservaltionByCode(reservationCode);
            
            if (!reservation) {
                return errorResponse("Reservation not found");
            }
            return successResponse("Reservation fetched successfully", reservation);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch reservation", error.message);
            }
            return errorResponse("Failed to fetch reservation");
        }
    }

    // public async getReservationsForADate(propertyId: string, date: Date): Promise<IApiResponse> {
    //     try {
    //         const reservations = await this.reservationRepository.getReservationForADate(propertyId, date);
    //         return successResponse("Reservations fetched successfully", reservations);
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             return errorResponse("Failed to fetch reservations", error.message);
    //         }
    //         return errorResponse("Failed to fetch reservations");
    //     }
    // }
    private async getAccessiblePropertyIds(
        creationId: string, 
        userLevel: number,
        specificPropertyId?: string,
        specificPropertyCode?: string
    ): Promise<{ success: boolean; propertyIds: string[]; message?: string }> {
        try {
            // If specific property requested, validate access first
            if (specificPropertyId || specificPropertyCode) {
                // First get all accessible properties for validation
                let allAccessibleProperties: IPropertyCodeAndIds[] = [];
                let daoRes: any;

                switch (userLevel) {
                    case 4:
                        daoRes = await this.dashUtils.getPropertyIdsAndCodesForLevel4(creationId);
                        break;
                    case 3:
                        daoRes = await this.dashUtils.getPropertyIdsAndCodesForLevel3(creationId);
                        break;
                    case 2:
                        daoRes = await this.dashUtils.getPropertyIdsAndCodesForLevel2(creationId);
                        break;
                    case 1:
                    case 0:
                        daoRes = await this.dashUtils.getPropertyIdAndCodeForLevel0And1(creationId);
                        break;
                    default:
                        return { success: false, propertyIds: [], message: "Invalid user level" };
                }

                if (!daoRes.success) {
                    return { success: false, propertyIds: [], message: daoRes.message };
                }

                allAccessibleProperties = daoRes.data;

                // Validate access to specific property
                const hasAccess = allAccessibleProperties.some(p => 
                    p.id === specificPropertyId || p.code === specificPropertyCode
                );

                if (!hasAccess) {
                    return { success: false, propertyIds: [], message: "Access denied to this property" };
                }

                // Return only the specific property ID
                const specificProperty = allAccessibleProperties.find(p => 
                    p.id === specificPropertyId || p.code === specificPropertyCode
                );
                return { success: true, propertyIds: [specificProperty!.id] };
            }

            // Get all accessible properties
            let daoRes: any;
            switch (userLevel) {
                case 4:
                    daoRes = await this.dashUtils.getPropertyIdsAndCodesForLevel4(creationId);
                    break;
                case 3:
                    daoRes = await this.dashUtils.getPropertyIdsAndCodesForLevel3(creationId);
                    break;
                case 2:
                    daoRes = await this.dashUtils.getPropertyIdsAndCodesForLevel2(creationId);
                    break;
                case 1:
                case 0:
                    daoRes = await this.dashUtils.getPropertyIdAndCodeForLevel0And1(creationId);
                    break;
                default:
                    return { success: false, propertyIds: [], message: "Invalid user level" };
            }

            if (!daoRes.success) {
                return { success: false, propertyIds: [], message: daoRes.message };
            }

            const propertyIds = daoRes.data.map((p: IPropertyCodeAndIds) => p.id);
            return { success: true, propertyIds };

        } catch (error) {
            return { 
                success: false, 
                propertyIds: [], 
                message: error instanceof Error ? error.message : "Unknown error" 
            };
        }
    }
public async getReservationsForDateRange(
    creationId: string,
    userLevel: number,
    startDate: Date, 
    endDate: Date,
    page: number,
    limit: number,
    specificPropertyId?: string,
    specificPropertyCode?: string,
    bookingStatus?: string // <-- Add this parameter
): Promise<IApiResponse> {
    try {
        // Get accessible property IDs
        const accessResult = await this.getAccessiblePropertyIds(
            creationId, 
            userLevel, 
            specificPropertyId, 
            specificPropertyCode
        );

        if (!accessResult.success) {
            return errorResponse(accessResult.message || "Failed to get accessible properties");
        }

        if (accessResult.propertyIds.length === 0) {
            return successResponse("No reservations found", [], {
                currentPage: page,
                totalPages: 0,
                totalResults: 0,
                hasNextPage: false,
                hasPreviousPage: false,
                resultsPerPage: limit
            });
        }

        const result = await this.reservationRepository.getReservationsForDateRange(
            accessResult.propertyIds,
            startDate, 
            endDate,
            page,
            limit,
            bookingStatus // <-- Add this parameter
        );
        
        return successResponse(
            "Reservations fetched successfully", 
            result.data,
            result.pagination
        );
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse("Failed to fetch reservations", error.message);
        }
        return errorResponse("Failed to fetch reservations");
    }
}
    // public async getArrivals(propertyId: string, arrivalDate: Date): Promise<IApiResponse> {
    //     try {
    //         const arrivals = await this.reservationRepository.getArrivals(propertyId, arrivalDate);
    //         return successResponse("Arrivals fetched successfully", arrivals);
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             return errorResponse("Failed to fetch arrivals", error.message);
    //         }
    //         return errorResponse("Failed to fetch arrivals");
    //     }
    // }

    // public async getDepartures(propertyId: string, departureDate: Date): Promise<IApiResponse> {
    //     try {
    //         const departures = await this.reservationRepository.getDepartures(propertyId, departureDate);
    //         return successResponse("Departures fetched successfully", departures);
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             return errorResponse("Failed to fetch departures", error.message);
    //         }
    //         return errorResponse("Failed to fetch departures");
    //     }
    // }

    // public async getCheckedInReservations(propertyId: string, date: Date): Promise<IApiResponse> {
    //     try {
    //         const checkIns = await this.reservationRepository.getCheckIns(propertyId, date);
    //         return successResponse("Checked-in reservations fetched successfully", checkIns);
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             return errorResponse("Failed to fetch checked-in reservations", error.message);
    //         }
    //         return errorResponse("Failed to fetch checked-in reservations");
    //     }
    // }

    // public async getCheckedOutReservations(propertyId: string, date: Date): Promise<IApiResponse> {
    //     try {
    //         const checkOuts = await this.reservationRepository.getCheckouts(propertyId, date);
    //         return successResponse("Checked-out reservations fetched successfully", checkOuts);
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             return errorResponse("Failed to fetch checked-out reservations", error.message);
    //         }
    //         return errorResponse("Failed to fetch checked-out reservations");
    //     }
    // }
public async getArrivals(
        creationId: string,
        userLevel: number,
        startDate: Date,
        endDate: Date,
        page: number,
        limit: number,
        specificPropertyId?: string,
        specificPropertyCode?: string,
        bookingStatus?: string
    ): Promise<IApiResponse> {
        try {
            const accessResult = await this.getAccessiblePropertyIds(
                creationId, 
                userLevel, 
                specificPropertyId, 
                specificPropertyCode
            );

            if (!accessResult.success) {
                return errorResponse(accessResult.message || "Failed to get accessible properties");
            }

            if (accessResult.propertyIds.length === 0) {
                return successResponse("No arrivals found", [], {
                    currentPage: page,
                    totalPages: 0,
                    totalResults: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    resultsPerPage: limit
                });
            }

            const result = await this.reservationRepository.getArrivals(
                accessResult.propertyIds,
                startDate,
                endDate,
                page,
                limit,
                bookingStatus
            );
            
            return successResponse("Arrivals fetched successfully", result.data, result.pagination);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch arrivals", error.message);
            }
            return errorResponse("Failed to fetch arrivals");
        }
    }

    public async getDepartures(
        creationId: string,
        userLevel: number,
        startDate: Date,
        endDate: Date,
        page: number,
        limit: number,
        specificPropertyId?: string,
        specificPropertyCode?: string,
bookingStatus?: string
    ): Promise<IApiResponse> {
        try {
            const accessResult = await this.getAccessiblePropertyIds(
                creationId, 
                userLevel, 
                specificPropertyId, 
                specificPropertyCode
            );

            if (!accessResult.success) {
                return errorResponse(accessResult.message || "Failed to get accessible properties");
            }

            if (accessResult.propertyIds.length === 0) {
                return successResponse("No departures found", [], {
                    currentPage: page,
                    totalPages: 0,
                    totalResults: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    resultsPerPage: limit
                });
            }

            const result = await this.reservationRepository.getDepartures(
                accessResult.propertyIds,
                startDate,
                endDate,
                page,
                limit,
                bookingStatus
            );
            
            return successResponse("Departures fetched successfully", result.data, result.pagination);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch departures", error.message);
            }
            return errorResponse("Failed to fetch departures");
        }
    }

    public async getCheckedInReservations(
        creationId: string,
        userLevel: number,
        startDate: Date,
        endDate: Date,
        page: number,
        limit: number,
        specificPropertyId?: string,
        specificPropertyCode?: string
    ): Promise<IApiResponse> {
        try {
            const accessResult = await this.getAccessiblePropertyIds(
                creationId, 
                userLevel, 
                specificPropertyId, 
                specificPropertyCode
            );

            if (!accessResult.success) {
                return errorResponse(accessResult.message || "Failed to get accessible properties");
            }

            if (accessResult.propertyIds.length === 0) {
                return successResponse("No check-ins found", [], {
                    currentPage: page,
                    totalPages: 0,
                    totalResults: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    resultsPerPage: limit
                });
            }

            const result = await this.reservationRepository.getCheckIns(
                accessResult.propertyIds,
                startDate,
                endDate,
                page,
                limit
            );
            
            return successResponse("Checked-in reservations fetched successfully", result.data, result.pagination);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch checked-in reservations", error.message);
            }
            return errorResponse("Failed to fetch checked-in reservations");
        }
    }

    public async getCheckedOutReservations(
        creationId: string,
        userLevel: number,
        startDate: Date,
        endDate: Date,
        page: number,
        limit: number,
        specificPropertyId?: string,
        specificPropertyCode?: string
    ): Promise<IApiResponse> {
        try {
            const accessResult = await this.getAccessiblePropertyIds(
                creationId, 
                userLevel, 
                specificPropertyId, 
                specificPropertyCode
            );

            if (!accessResult.success) {
                return errorResponse(accessResult.message || "Failed to get accessible properties");
            }

            if (accessResult.propertyIds.length === 0) {
                return successResponse("No check-outs found", [], {
                    currentPage: page,
                    totalPages: 0,
                    totalResults: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    resultsPerPage: limit
                });
            }

            const result = await this.reservationRepository.getCheckouts(
                accessResult.propertyIds,
                startDate,
                endDate,
                page,
                limit
            );
            
            return successResponse("Checked-out reservations fetched successfully", result.data, result.pagination);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch checked-out reservations", error.message);
            }
            return errorResponse("Failed to fetch checked-out reservations");
        }
    }

    public async deleteReservation(reservationId: string): Promise<IApiResponse> {
        try {
            const reservation = await this.reservationRepository.getReservationById(reservationId);
            
            if (!reservation) {
                return errorResponse("Reservation not found");
            }

            // Generate dates for ARI increase
            const reservationDates = this.generateDateRange(
                reservation.checkInDate.toISOString().split('T')[0],
                reservation.checkOutDate.toISOString().split('T')[0]
            );

            // Cancel reservation
            const cancelledReservation = await this.reservationRepository.deleteReservation(reservationId);

            // Increase room availability back
            if (reservation.propertyCode && reservation.roomTypeCode) {
                await this.ariManupulationRepo.increaseAvailableRooms({
                    propertyCode: reservation.propertyCode,
                    dates: reservationDates,
                    roomInfos: [{
                        roomTypeCode: reservation.roomTypeCode,
                        numberOfRooms: reservation.finalPrice?.requestedRooms
                    }]
                });
            }

            return successResponse("Reservation cancelled successfully", cancelledReservation);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to cancel reservation", error.message);
            }
            return errorResponse("Failed to cancel reservation");
        }
    }

    public async amendReservation(reservationId: string, newCheckoutDate: Date): Promise<IApiResponse> {
        try {
            const reservation = await this.reservationRepository.getReservationById(reservationId);
            
            if (!reservation) {
                return errorResponse("Reservation not found");
            }

            // Calculate additional dates needed
            const currentCheckout = reservation.checkOutDate;
            const additionalDates = this.generateDateRange(
                currentCheckout.toISOString().split('T')[0],
                newCheckoutDate.toISOString().split('T')[0]
            );

            if (additionalDates.length > 0 && reservation.propertyCode && reservation.roomTypeCode) {
                // Decrease availability for extended dates
                await this.ariManupulationRepo.decreaseAvailableRooms({
                    propertyCode: reservation.propertyCode,
                    dates: additionalDates,
                    roomInfos: [{
                        roomTypeCode: reservation.roomTypeCode,
                        numberOfRooms: 1
                    }]
                });
            }

            // Update reservation
            const updatedReservation = await this.reservationRepository.amendReservation(reservationId, newCheckoutDate);

            return successResponse("Reservation amended successfully", updatedReservation);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to amend reservation", error.message);
            }
            return errorResponse("Failed to amend reservation");
        }
    }
}