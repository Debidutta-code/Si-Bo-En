import {
    ReservationRepository, 
    PriceBrakeDownRepo,
    AriManupulationRepo
} from "../repository";
import { successResponse, errorResponse } from "../../../../utils/return";
import { IApiResponse } from "../../../../utils/return.types";
import { GuestService } from "../../guest/services";
// import { FOlioService, FolioLineService, PaymentService } from "../../payment/services";
// import { IndividualRoomService, ReservationRoomService } from "../../room-management/services";
// import { IndivdualRoomRepository } from "../../room-management/repository";
import {
    ICReservation,
    ICReservationService,
    IPartialReservationRoomService,
    ICPartialReservationRoom,
    IReservationPriceBrakeDownS,
    AriManupulationRooms,
    IAriManulupulation
} from "../types";
import { getPropertyName, getRatePlanName, getRoomType } from "../../room-management/utils";
import { Decimal } from "../../../../generated/prisma/runtime/library";
// import { getRatePlanName, getRoomType } from "../../room-management/utils";
import { IAddGuestDocument } from "../../guest/types";
import { RoomRentCalculationService } from "../../../../ari/services";
import { getPropertyCode } from "../../../../ari/utils";
export class ReservationService {
    reservationRepository: ReservationRepository;
    guestService: GuestService;
    // folioService: FOlioService;
    // folioLineService: FolioLineService;
    // paymentService: PaymentService;
    // individualRoomService: IndividualRoomService;
    // individualRoomRepository: IndivdualRoomRepository;
    // reservationRoomService: ReservationRoomService;
    // partialReservationRoomsService: PartialReservationRoomsService;
    priceBrakeDownRepo: PriceBrakeDownRepo;
    ariManupulationRepo: AriManupulationRepo;
    constructor() {
        this.reservationRepository = new ReservationRepository();
        this.guestService = new GuestService();
        // this.folioService = new FOlioService();
        // this.folioLineService = new FolioLineService();
        // this.paymentService = new PaymentService();
        // this.individualRoomService = new IndividualRoomService();
        // this.reservationRoomService = new ReservationRoomService();
        // this.partialReservationRoomsService = new PartialReservationRoomsService();
        // this.individualRoomRepository = new IndivdualRoomRepository();
        this.priceBrakeDownRepo = new PriceBrakeDownRepo();
        this.ariManupulationRepo = new AriManupulationRepo();
    }
    private async generateBookingCode(): Promise<string> {
        const code = 'BOOK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const existingReservation = await this.reservationRepository.getReservaltionByCode(code);
        if (existingReservation instanceof Error) {
            throw new Error(existingReservation.message)
        }
        if (existingReservation !== null) {
            return this.generateBookingCode();
        }
        return code;
    }
    public async createReservation(userId: string, reservationData: ICReservationService, priceBrakeDownServices: IReservationPriceBrakeDownS[]): Promise<IApiResponse> {
        try {
            let guestIds: string[] = [];
            for (const guest of reservationData.Guests) {
                if (guest.email) {
                    const checkIfGuestExists = await this.guestService.getGuestByEmail(guest.email);

                    if (checkIfGuestExists.success) {
                        // Guest exists, update and add to list
                        await this.guestService.updateGuest(checkIfGuestExists.data.id, guest);
                        guestIds.push(checkIfGuestExists.data.id);
                    } else {
                        // Guest doesn't exist, create new one
                        const newGuestRes = await this.guestService.createGuest({ ...guest, propertyId: reservationData.propertyId });
                        if (!newGuestRes.success) {
                            return errorResponse("Failed to create guest")
                        }
                        guestIds.push(newGuestRes.data.id);
                    }
                } else {
                    const newGuestRes = await this.guestService.createGuest({ ...guest, propertyId: reservationData.propertyId });
                    if (!newGuestRes.success) {
                        return errorResponse("Failed to create guest")
                    }
                    guestIds.push(newGuestRes.data.id);
                }
            }
            //propertyCode
            const propertyCode = await getPropertyCode(reservationData.propertyId);
            if (!propertyCode) {
                return errorResponse("Property not found")
            }


            //addReservationRooms: reservationData.ReservationRooms
            const bookingCode = await this.generateBookingCode();
            const propertyName = await getPropertyName(reservationData.propertyId);
            const reservationPayload: ICReservation = {
                bookingCode,
                reservationStatus: "reserved",
                source: reservationData.source,
                propertyCode,
                isDeleted: false,
                checkedInDate: null,
                checkedOutDate: null,
                propertyName: propertyName,
                bookedAt: new Date(),
                noOfAdults: reservationData.noOfAdults,
                noOfChildren: reservationData.noOfChildren,
                noOfInfants: reservationData.noOfInfants,
                from: reservationData.from,
                to: (() => {
                    const d = new Date(reservationData.to);
                    d.setDate(d.getDate() - 1);
                    d.setHours(23, 59, 59, 0);
                    return d;
                })(),
                additionalNotes: reservationData.additionalNotes,
                // folioId: null
            }
            console.log("Reservation Payload:", reservationPayload);
            const repoRes = await this.reservationRepository.createReservation(reservationPayload, guestIds);
            if (repoRes instanceof Error) {
                return errorResponse("Failed to create reservation", repoRes.message)
            }
            
            //add price brakedown
            await this.priceBrakeDownRepo.createpriceBrakeDowns(priceBrakeDownServices.map(item => ({ ...item, reservationId: repoRes.id })))
            //update ARI 
            let reservationDates: string[] = [];
            let reservationRoomData: AriManupulationRooms[] = [];

            let currentDate = new Date(reservationData.from);
            const toDate = new Date(reservationData.to);
            while (currentDate < toDate) {
                reservationDates.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            const res = await this.ariManupulationRepo.decreaseAvailableRooms({ propertyCode: propertyCode, dates: reservationDates, roomInfos: reservationRoomData });
            console.log("ARI Update Result:", res);
            //folio Management
            // const folioRes = await this.folioService.createFolio({
            //     reservationId: repoRes.id,
            //     bookingCode: repoRes.bookingCode,
            //     propertyId: reservationData.propertyId,
            //     status: "open",
            //     currency: reservationData.currencyCode,
            //     totalAmount: new Decimal(0),
            // })
            // if (!folioRes.success) {
            //     return errorResponse("Failed to create folio for reservation")
            // }
            // if (reservationData.totalAmount) {
            //     //create folio line for reservation amount
            //     const folioLineRes = await this.folioLineService.createFolioLine(folioRes.data.id, {
            //         folioId: folioRes.data.id,
            //         description: "Reservation Charge",
            //         amount: new Decimal(reservationData.totalAmount),
            //         taxAmount: new Decimal(0),
            //         currencyCode: reservationData.currencyCode
            //     })
            //     if (!folioLineRes.success) {
            //         return errorResponse("Failed to create folio line for reservation")
            //     }
            // }
            // if (reservationData.paidAmount) {
            //     //create payment for folio
            //     const paymentRes = await this.paymentService.createPayment(folioRes.data.id, {
            //         folioId: folioRes.data.id,
            //         amount: reservationData.paidAmount,
            //         paymentMethod: reservationData.paymentMethod,
            //         paymentDate: new Date(),
            //         currency: reservationData.currencyCode,
            //         processedBy: userId,
            //         paymentNote: "Payment for reservation",
            //         paidAt: new Date(),
            //         paymentStatus: "confirmed"
            //     })
            //     if (!paymentRes.success) {
            //         return errorResponse("Failed to create payment for reservation")
            //     }
            // }

            return successResponse("Reservation created successfully", repoRes)

        } catch (error) {
            // console.log(error)
            if (error instanceof Error) {
                return errorResponse("Failed to create reservation", error.message)
            }
            return errorResponse("Failed to create reservation")
        }

    }
    public async getReservaltionByCode(reservationCode: string): Promise<IApiResponse> {
        try {
            const repoRes = await this.reservationRepository.getReservaltionByCode(reservationCode);
            if (repoRes instanceof Error) {
                return errorResponse("Failed to fetch reservation", repoRes.message)
            }
            if (!repoRes) {
                return errorResponse("Reservation not found")
            }
            return successResponse("Reservation fetched successfully", repoRes)
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch reservation", error.message)
            }
            return errorResponse("Failed to fetch reservation")
        }
    }
    public async getReservationsForADate(propertyId: string, date: Date): Promise<IApiResponse> {
        try {
            const propertyCode = await getPropertyCode(propertyId);
            if (!propertyCode) {
                return errorResponse("Property not found")
            }
            const repoRes = await this.reservationRepository.getReservationForADate(propertyCode, date);
            if (repoRes instanceof Error) {
                return errorResponse("Failed to fetch reservations", repoRes.message)
            }
            return successResponse("Reservations fetched successfully", repoRes)
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch reservations", error.message)
            }
            return errorResponse("Failed to fetch reservations")
        }
    }
    public async getArrivals(propertyId: string, arrivalDate: Date): Promise<IApiResponse> {
        try {
            const propertyCode = await getPropertyCode(propertyId);
            if (!propertyCode) {
                return errorResponse("Property not found")
            }
            const repoRes = await this.reservationRepository.getArrivals(propertyCode, arrivalDate);
            if (repoRes instanceof Error) {
                return errorResponse("Failed to fetch arrivals", repoRes.message)
            }
            return successResponse("Arrivals fetched successfully", repoRes)
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch arrivals", error.message)
            }
            return errorResponse("Failed to fetch arrivals")
        }
    }
    public async getDepartures(propertyId: string, departureDate: Date): Promise<IApiResponse> {
        try {
            const propertyCode = await getPropertyCode(propertyId);
            if (!propertyCode) {
                return errorResponse("Property not found")
            }
            const repoRes = await this.reservationRepository.getDepartures(propertyCode, departureDate);
            if (repoRes instanceof Error) {
                return errorResponse("Failed to fetch departures", repoRes.message)
            }
            return successResponse("Departures fetched successfully", repoRes)
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch departures", error.message)
            }
            return errorResponse("Failed to fetch departures")
        }
    }
    public async getCheckedInReservations(propertyId: string, date: Date): Promise<IApiResponse> {
        try {
            const propertyCode = await getPropertyCode(propertyId);
            if (!propertyCode) {
                return errorResponse("Property not found")
            }
            const repoRes = await this.reservationRepository.getCheckIns(propertyCode, date);
            if (repoRes instanceof Error) {
                return errorResponse("Failed to fetch checked-in reservations", repoRes.message)
            }
            return successResponse("Checked-in reservations fetched successfully", repoRes)
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch checked-in reservations", error.message)
            }
            return errorResponse("Failed to fetch checked-in reservations")
        }
    }
    public async getCheckedOutReservations(propertyId: string, date: Date): Promise<IApiResponse> {
        try {
            const propertyCode = await getPropertyCode(propertyId);
            if (!propertyCode) {
                return errorResponse("Property not found")
            }
            const repoRes = await this.reservationRepository.getCheckouts(propertyCode, date);
            if (repoRes instanceof Error) {
                return errorResponse("Failed to fetch checked-out reservations", repoRes.message)
            }
            return successResponse("Checked-out reservations fetched successfully", repoRes)
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch checked-out reservations", error.message)
            }
            return errorResponse("Failed to fetch checked-out reservations")
        }

    }
    public async deleteReservation(reservationId: string): Promise<IApiResponse> {
        try {
            const reservation = await this.reservationRepository.getReservationById(reservationId);
            if (reservation instanceof Error) {
                return errorResponse("Failed to fetch reservation", reservation.message)
            }
            if (!reservation) {
                return errorResponse("Reservation not found")
            }
            let reservationDates: string[] = [];

            let currentDate = new Date(reservation.from);
            const toDate = new Date(reservation.to);
            while (currentDate <= toDate) {
                reservationDates.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            const repoRes = await this.reservationRepository.deleteReservation(reservationId);

            if (repoRes instanceof Error) {
                return errorResponse("Failed to delete reservation", repoRes.message)
            }
            return successResponse("Reservation deleted successfully", repoRes)
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete reservation", error.message)
            }
            return errorResponse("Failed to delete reservation")
        }

    }
    public async amendReservation(reservationId: string, newCheckoutDate: Date): Promise<IApiResponse> {
        try {
            const reservation = await this.reservationRepository.getReservationById(reservationId);
            if (reservation instanceof Error) {
                return errorResponse("Failed to fetch reservation", reservation.message)
            }
            if (!reservation) {
                return errorResponse("Reservation not found")
            }
            //update the price and extend the reservation
            let reservationDates: string[] = [];
            let reservationRoomData: AriManupulationRooms[] = [];

            let currentDate = new Date(reservation.to);
            const extendToDate = new Date(newCheckoutDate);
            while (currentDate <= extendToDate) {
                reservationDates.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            let totalPrice: Decimal = new Decimal(0);
            let totalTax: Decimal = new Decimal(0);
            if (totalPrice.greaterThan(0)) {
                // await this.folioLineService.createFolioLine(reservation.folioId!, { folioId: reservation.folioId!, description: `Additional charges for Room Extension to ${newCheckoutDate}`, amount: totalPrice, taxAmount: totalTax, currencyCode: "INR" })

                await this.ariManupulationRepo.decreaseAvailableRooms({ propertyCode: reservation.propertyCode, dates: reservationDates, roomInfos: reservationRoomData });

                const repoRes = await this.reservationRepository.amendReservation(reservationId, newCheckoutDate);
                if (repoRes instanceof Error) {
                    return errorResponse("Failed to amend reservation", repoRes.message)
                }
            }
            return successResponse("Reservation amended successfully",)
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to amend reservation", error.message)
            }
            return errorResponse("Failed to amend reservation")
        }
    }

    public async findAvailableRoomsForReservation(bookingCode: string): Promise<IApiResponse> {
        try {
            const reservation = await this.reservationRepository.getReservaltionByCode(bookingCode);

            if (reservation instanceof Error) {
                return errorResponse("Failed to fetch reservation", reservation.message)
            }
            if (!reservation) {
                return errorResponse("Reservation not found")
            }
            let allRoomTypeCodes: string[] = [];
            // reservation.partialRooms.forEach(partialRoom => {
            //     allRoomTypeCodes.push(partialRoom.roomTypeCode);
            // })
            // const availableRoomsRes = await this.individualRoomRepository.getAvailaleRoomsByToomType(allRoomTypeCodes, reservation.from, reservation.to);
            // if (availableRoomsRes instanceof Error) {
            //     return errorResponse("Failed to find available rooms", availableRoomsRes.message)
            // }
            return successResponse("Available rooms fetched successfully")
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to find available rooms", error.message)
            }
            return errorResponse("Failed to find available rooms")
        }
    }
    public async makeCheckInReservation(reservationCode: string, guestDataToUpdate: Map<string, IAddGuestDocument> | Record<string, IAddGuestDocument>): Promise<IApiResponse> {
        try {
            const existingReservation = await this.reservationRepository.getReservaltionByCode(reservationCode);
            if (existingReservation instanceof Error) {
                return errorResponse("Failed to fetch reservation", existingReservation.message)
            }
            if (!existingReservation) {
                return errorResponse("Reservation not found")
            }
            // if (!existingReservation.ReservationRooms || existingReservation.ReservationRooms.length === 0) {
            //     return errorResponse("No rooms associated with this reservation")
            // }
            // const individualRooms = existingReservation.ReservationRooms.map(rr => rr.individualRoomRefId);
            // console.log("Individual rooms to check-in:", individualRooms);
            // console.log(await this.individualRoomRepository.changeRoomStatusById(individualRooms, "checked_in"))
            // Convert to Map if it's an object

            const guestDataMap = guestDataToUpdate instanceof Map
                ? guestDataToUpdate
                : new Map(Object.entries(guestDataToUpdate));

            console.log("Guest data to update:", guestDataMap);

            // Validate that we have guest data
            if (guestDataMap.size === 0) {
                return errorResponse("No guest documents provided for check-in")
            }

            for (const [guestId, guestData] of guestDataMap.entries()) {
                const addDocRes = await this.guestService.addDocumentToGuest(guestId, guestData);
                if (!addDocRes.success) {
                    return errorResponse(`Failed to add document to guest ${guestId}`);
                }
            }
            const repoRes = await this.reservationRepository.updateReservationStatus(existingReservation.id, "checked_in");
            if (repoRes instanceof Error) {
                return errorResponse("Failed to check-in reservation", repoRes.message)
            }
            //make Update individual rooms as occupied

            return successResponse("Reservation checked-in successfully", repoRes)
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to check-in reservation", error.message)
            }
            return errorResponse("Failed to check-in reservation")
        }
    }
    public async makeCheckOutReservation(reservationCode: string): Promise<IApiResponse> {
        try {
            const existingReservation = await this.reservationRepository.getReservaltionByCode(reservationCode);
            if (existingReservation instanceof Error) {
                return errorResponse("Failed to fetch reservation", existingReservation.message)
            }
            if (!existingReservation) {
                return errorResponse("Reservation not found")
            }
            // const individualRooms = existingReservation.ReservationRooms.map(rr => rr.individualRoomRefId);
            // console.log("Individual rooms to check-in:", individualRooms);
            // await this.individualRoomRepository.changeRoomStatusById(individualRooms, "dirty")
            const repoRes = await this.reservationRepository.updateReservationStatus(existingReservation.id, "checked_out");
            if (repoRes instanceof Error) {
                return errorResponse("Failed to check-out reservation", repoRes.message)
            }
            return successResponse("Reservation checked-out successfully", repoRes)
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to check-out reservation", error.message)
            }
            return errorResponse("Failed to check-out reservation")
        }
    }
}


