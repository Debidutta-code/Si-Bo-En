import { 
  getReservations, 
  getReservationById, 
  getReservationByBookingCode, 
  cancelReservation, 
  amendReservation,
  checkAmendPrice
} from "../apis/agent-reservation.api";
import type { 
  IReservationFilters, 
  ICancelReservationPayload, 
  IUReservation
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
export const checkAmendPriceService = async (data: {
  propertyCode: string;
  invTypeCode: string;
  startDate: string;
  endDate: string;
  ratePlanCode: string;
  noOfAdults: number;
  noOfChildren: number;
  noOfRooms: number;
  agencyId: string;
  roomsArray: { adults: number; children: number; childAges: number[] }[];
  includedAddons?: string[];
}) => {
  try {
    if (!data.propertyCode?.trim()) return { success: false, message: 'Property code is required.' };
    if (!data.invTypeCode?.trim()) return { success: false, message: 'Room type code is required.' };
    if (!data.ratePlanCode?.trim()) return { success: false, message: 'Rate plan code is required.' };
    if (!data.startDate || !data.endDate) return { success: false, message: 'Dates are required.' };
    if (new Date(data.startDate) >= new Date(data.endDate)) return { success: false, message: 'Start date must be before end date.' };
    if (data.noOfAdults < 1) return { success: false, message: 'At least 1 adult is required.' };
    if (data.noOfRooms < 1) return { success: false, message: 'At least 1 room is required.' };

    return await checkAmendPrice(data);
  } catch {
    return { success: false, message: 'Failed to fetch updated price.' };
  }
};

export const amendReservationService = async (bookingCode: string, payload: IUReservation) => {
  try {
    if (!bookingCode?.trim()) return { success: false, message: 'Booking code is required.' };
    return await amendReservation(bookingCode, payload);
  } catch {
    return { success: false, message: 'Failed to amend reservation.' };
  }
};