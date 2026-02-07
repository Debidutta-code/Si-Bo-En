import { 
  getReservations, 
  getReservationById, 
  getReservationByBookingCode, 
  cancelReservation 
} from "../apis/agent-reservation.api";
import type { 
  IReservationFilters, 
  ICancelReservationPayload 
} from "../interfaces/agent-reservation.interfaces";

export const fetchReservationsService = async (filters?: IReservationFilters) => {
  try {
    const response = await getReservations(filters);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch reservations."
    };
  }
};

export const fetchReservationByIdService = async (reservationId: string) => {
  try {
    const response = await getReservationById(reservationId);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch reservation details."
    };
  }
};

export const fetchReservationByBookingCodeService = async (bookingCode: string) => {
  try {
    const response = await getReservationByBookingCode(bookingCode);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch reservation by booking code."
    };
  }
};

export const cancelReservationService = async (
  reservationId: string, 
  payload: ICancelReservationPayload
) => {
  try {
    const response = await cancelReservation(reservationId, payload);
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Failed to cancel reservation."
    };
  }
};
