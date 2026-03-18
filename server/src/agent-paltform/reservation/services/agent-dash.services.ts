import { successResponse, errorResponse, IApiResponse } from "../../../utils";
import { ReservationRepository } from "../repository/agent-dash.repository";
import { IReservationFilters, ICancelReservationPayload } from "../types";

export class ReservationService {
    private reservationRepository: ReservationRepository;

    constructor() {
        this.reservationRepository = new ReservationRepository();
    }

    public async getReservations(agencyId: string, filters: IReservationFilters): Promise<IApiResponse> {
        try {
            const result = await this.reservationRepository.getReservationsByAgencyId(agencyId, filters);

            if (result.data.length === 0) {
                return successResponse("No reservations found", {
                    reservations: [],
                    pagination: {
                        total: 0,
                        page: result.page,
                        limit: result.limit,
                        totalPages: 0
                    }
                });
            }

            return successResponse("Reservations fetched successfully", {
                reservations: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch reservations", error.message);
            }
            return errorResponse("Failed to fetch reservations", "An unexpected error occurred");
        }
    }

    public async getReservationById(reservationId: string, agencyId: string): Promise<IApiResponse> {
        try {
            const reservation = await this.reservationRepository.getReservationById(reservationId, agencyId);

            if (!reservation) {
                return errorResponse("Reservation not found", "No reservation found with the provided ID");
            }

            return successResponse("Reservation fetched successfully", { reservation });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch reservation", error.message);
            }
            return errorResponse("Failed to fetch reservation", "An unexpected error occurred");
        }
    }

    public async getReservationByBookingCode(bookingCode: string, agencyId: string): Promise<IApiResponse> {
        try {
            const reservation = await this.reservationRepository.getReservationByBookingCode(bookingCode, agencyId);

            if (!reservation) {
                return errorResponse("Reservation not found", "No reservation found with the provided booking code");
            }

            return successResponse("Reservation fetched successfully", { reservation });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch reservation", error.message);
            }
            return errorResponse("Failed to fetch reservation", "An unexpected error occurred");
        }
    }

    public async cancelReservation(
        reservationId: string,
        agencyId: string,
        payload: ICancelReservationPayload
    ): Promise<IApiResponse> {
        try {
            const existingReservation = await this.reservationRepository.getReservationById(reservationId, agencyId);

            if (!existingReservation) {
                return errorResponse("Reservation not found", "No reservation found with the provided ID");
            }

            if (existingReservation.bookingStatus === "cancelled") {
                return errorResponse("Reservation already cancelled", "This reservation has already been cancelled");
            }

            const checkInDate = new Date(existingReservation.checkInDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (checkInDate < today) {
                return errorResponse(
                    "Cannot cancel past reservation",
                    "Cannot cancel a reservation with a check-in date in the past"
                );
            }

            if (!payload.cancellationReason || payload.cancellationReason.trim() === '') {
                return errorResponse("Cancellation reason required", "Please provide a reason for cancellation");
            }

            const cancelledReservation = await this.reservationRepository.cancelReservation(
                reservationId,
                agencyId,
                payload.cancellationReason
            );

            return successResponse("Reservation cancelled successfully", {
                reservation: cancelledReservation
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to cancel reservation", error.message);
            }
            return errorResponse("Failed to cancel reservation", "An unexpected error occurred");
        }
    }

    public async getReservationStats(agencyId: string): Promise<IApiResponse> {
        try {
            const stats = await this.reservationRepository.getReservationStats(agencyId);

            const averageBookingValue = stats.totalReservations > 0
                ? stats.totalRevenue / stats.totalReservations
                : 0;

            return successResponse("Reservation statistics fetched successfully", {
                stats: {
                    ...stats,
                    averageBookingValue
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch reservation statistics", error.message);
            }
            return errorResponse("Failed to fetch reservation statistics", "An unexpected error occurred");
        }
    }

    public async getUpcomingArrivals(agencyId: string, days: number = 7): Promise<IApiResponse> {
        try {
            const arrivals = await this.reservationRepository.getUpcomingArrivals(agencyId, days);

            return successResponse("Upcoming arrivals fetched successfully", {
                arrivals,
                count: arrivals.length,
                days
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch upcoming arrivals", error.message);
            }
            return errorResponse("Failed to fetch upcoming arrivals", "An unexpected error occurred");
        }
    }

    public async getUpcomingDepartures(agencyId: string, days: number = 7): Promise<IApiResponse> {
        try {
            const departures = await this.reservationRepository.getUpcomingDepartures(agencyId, days);

            return successResponse("Upcoming departures fetched successfully", {
                departures,
                count: departures.length,
                days
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch upcoming departures", error.message);
            }
            return errorResponse("Failed to fetch upcoming departures", "An unexpected error occurred");
        }
    }
}
