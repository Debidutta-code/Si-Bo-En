import createAxiosInstance from "@/components/axiosInstance";
import type { 
  IReservationFilters, 
  IReservationsResponse, 
  ICancelReservationPayload, 
  ICancelReservationResponse,
  IReservationDetailsResponse
} from "../interfaces/agent-reservation.interfaces";

const axiosInstance = createAxiosInstance();

export const getReservations = async (filters?: IReservationFilters): Promise<IReservationsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.bookingStatus) params.append('bookingStatus', filters.bookingStatus);
    if (filters?.bookingSource) params.append('bookingSource', filters.bookingSource);
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);
    if (filters?.propertyCode) params.append('propertyCode', filters.propertyCode);
    if (filters?.roomTypeCode) params.append('roomTypeCode', filters.roomTypeCode);
    if (filters?.ratePlanCode) params.append('ratePlanCode', filters.ratePlanCode);
    if (filters?.checkInDateFrom) params.append('checkInDateFrom', filters.checkInDateFrom);
    if (filters?.checkInDateTo) params.append('checkInDateTo', filters.checkInDateTo);
    if (filters?.checkOutDateFrom) params.append('checkOutDateFrom', filters.checkOutDateFrom);
    if (filters?.checkOutDateTo) params.append('checkOutDateTo', filters.checkOutDateTo);
    if (filters?.bookingCode) params.append('bookingCode', filters.bookingCode);
    if (filters?.guestEmail) params.append('guestEmail', filters.guestEmail);
    if (filters?.guestPhone) params.append('guestPhone', filters.guestPhone);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = queryString 
      ? `/agent-platform/reservations?${queryString}`
      : '/agent-platform/reservations';

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || 'Failed to fetch reservations'
    };
  }
};

export const getReservationById = async (reservationId: string): Promise<IReservationDetailsResponse> => {
  try {
    const response = await axiosInstance.get(`/agent-platform/reservations/${reservationId}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || 'Failed to fetch reservation details'
    };
  }
};

export const getReservationByBookingCode = async (bookingCode: string): Promise<IReservationDetailsResponse> => {
  try {
    const response = await axiosInstance.get(`/agent-platform/reservations/booking-code/${bookingCode}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || 'Failed to fetch reservation by booking code'
    };
  }
};

export const cancelReservation = async (
  reservationId: string, 
  payload: ICancelReservationPayload
): Promise<ICancelReservationResponse> => {
  try {
    const response = await axiosInstance.put(
      `/agent-platform/booking/cancel/${reservationId}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || 'Failed to cancel reservation'
    };
  }
};
