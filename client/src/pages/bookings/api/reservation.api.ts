import createAxiosInstance from "@/components/axiosInstance";
import type { IAmendFinalPrice, IPriceCheckRequest,  } from "../types";

const axiosInstance = createAxiosInstance();

// Common filter type for all API calls
interface ReservationFilters {
  startDate: string;
  endDate: string;
  dateFilterType?: 'checkin' | 'booking' | 'modification';
  propertyId?: string;
  propertyCode?: string;
  bookingStatus?: string;
  bookingSource?: string;
  deviceType?: string;
  bookingCode?: string;
  guestName?: string;
  promoCode?: string;
  countryCode?: string;
  page?: number;
  limit?: number;
}

// Helper function to build query params
const buildQueryParams = (filters: ReservationFilters): URLSearchParams => {
  const params = new URLSearchParams({
    startDate: filters.startDate,
    endDate: filters.endDate,
    page: (filters.page || 1).toString(),
    limit: (filters.limit || 10).toString(),
  });

  // Add optional parameters only if they exist and are not 'all'
  if (filters.dateFilterType) {
    params.append('dateFilterType', filters.dateFilterType);
  }
  if (filters.propertyId) {
    params.append('propertyId', filters.propertyId);
  }
  if (filters.propertyCode) {
    params.append('propertyCode', filters.propertyCode);
  }
  if (filters.bookingStatus && filters.bookingStatus !== 'all') {
    params.append('bookingStatus', filters.bookingStatus);
  }
  if (filters.bookingSource && filters.bookingSource !== 'all') {
    params.append('bookingSource', filters.bookingSource);
  }
  if (filters.deviceType && filters.deviceType !== 'all') {
    params.append('deviceType', filters.deviceType);
  }
  if (filters.bookingCode) {
    params.append('bookingCode', filters.bookingCode);
  }
  if (filters.guestName) {
    params.append('guestName', filters.guestName);
  }
  if (filters.promoCode) {
    params.append('promoCode', filters.promoCode);
  }
  if (filters.countryCode && filters.countryCode !== 'all') {
    params.append('countryCode', filters.countryCode);
  }

  return params;
};

// Updated API functions
export const fetchReservations = async (filters: ReservationFilters) => {
  try {
    const params = buildQueryParams(filters);
    const response = await axiosInstance.get(`/reservations/date-range?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || "Failed to fetch reservations"
    };
  }
};

export const fetchArrivals = async (filters: ReservationFilters) => {
  try {
    const params = buildQueryParams(filters);
    const response = await axiosInstance.get(`/reservations/arrivals?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || "Failed to fetch arrivals"
    };
  }
};

export const fetchDepartures = async (filters: ReservationFilters) => {
  try {
    const params = buildQueryParams(filters);
    const response = await axiosInstance.get(`/reservations/departures?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || "Failed to fetch departures"
    };
  }
};



export const fetchReservationByCode = async (bookingCode: string) => {
  try {
    const response = await axiosInstance.get(`/reservations/${bookingCode}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || "Failed to fetch reservation"
    };
  }
};

export const cancelReservation = async (reservationId: string) => {
  try {
    const response = await axiosInstance.put(
      `/reservations/cancel/${reservationId}`,
      {},

    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || "Failed to cancel reservation"
    };
  }
};
export const noShowReservation = async (reservationId: string) => {
  try {
    const response = await axiosInstance.patch(`/reservations/no-show/${reservationId}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || "Failed to no show reservation"
    };
  }
};
export const amendReservation = async (reservationId: string, newCheckoutDate: string) => {
  try {
    const response = await axiosInstance.patch(`/reservations/amend/${reservationId}`, {
      newCheckoutDate
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || "Failed to amend reservation"
    };
  }
};

// Property API (reuse from dashboard)
export const fetchProperties = async () => {
  try {
    const response = await axiosInstance.get("/dash/properties");
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || "Failed to fetch properties"
    };
  }
};

// Add to your existing api/index.ts or create new file
export const downloadBookingVoucher = async (bookingCode: string) => {
  try {
    const response = await axiosInstance.get(
      `/reports/booking-voucher/${bookingCode}`,
      { responseType: 'blob' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `voucher-${bookingCode}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to download voucher"
    };
  }
};

export const downloadBookingInvoice = async (bookingCode: string) => {
  try {
    const response = await axiosInstance.get(
      `/reports/booking-invoice/${bookingCode}`,
      { responseType: 'blob' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${bookingCode}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to download invoice"
    };
  }
};





export const checkAmendPrice = async (
  payload: IPriceCheckRequest
): Promise<{ success: boolean; data?: IAmendFinalPrice; message?: string }> => {
  try {
    const response = await axiosInstance.post(
      "/booking-engine/pricing/get-price",
      payload
    );

    const resData = response.data;

    if (!resData || resData.success === false) {
      return {
        success: false,
        message: resData?.message || "Failed to fetch updated price",
      };
    }

    // The actual price data might be nested under resData.data
    return {
      success: true,
      data: resData.data ?? resData,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch updated price",
    };
  }
};

// ─── Amend / Update Reservation ──────────────────────────────────────────────

export const amendReservationApi = async (
  bookingCode: string,
  payload: Record<string, unknown>
): Promise<{ success: boolean; message?: string; data?: any }> => {
  try {
    const response = await axiosInstance.patch(
      `/reservations/update/${bookingCode}`,
      payload
    );

    const resData = response.data;

    if (!resData || resData.success === false) {
      return {
        success: false,
        message: resData?.message || "Failed to amend reservation",
      };
    }

    return { success: true, data: resData };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.",
    };
  }
};