import createAxiosInstance from "@/components/axiosInstance";

const axiosInstance = createAxiosInstance();

export const fetchReservations = async (filters: {
  startDate: string;
  endDate: string;
  propertyId?: string;
  propertyCode?: string;
  bookingStatus?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 10).toString(),
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.propertyCode && { propertyCode: filters.propertyCode }),
      ...(filters.bookingStatus && { bookingStatus: filters.bookingStatus })
    });

    const response = await axiosInstance.get(`pms/front-office/reservations/date-range?${params.toString()}`);
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

export const fetchArrivals = async (filters: {
  startDate: string;
  endDate: string;
  propertyId?: string;
  propertyCode?: string;
  bookingStatus?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 10).toString(),
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.propertyCode && { propertyCode: filters.propertyCode }),
      ...(filters.bookingStatus && { bookingStatus: filters.bookingStatus })
    });

    const response = await axiosInstance.get(`/pms/front-office/reservations/arrivals?${params.toString()}`);
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

export const fetchDepartures = async (filters: {
  startDate: string;
  endDate: string;
  propertyId?: string;
  propertyCode?: string;
  bookingStatus?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 10).toString(),
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.propertyCode && { propertyCode: filters.propertyCode }),
      ...(filters.bookingStatus && { bookingStatus: filters.bookingStatus })
    });

    const response = await axiosInstance.get(`/pms/front-office/reservations/departures?${params.toString()}`);
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

export const fetchCheckIns = async (filters: {
  startDate: string;
  endDate: string;
  propertyId?: string;
  propertyCode?: string;
  bookingStatus?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 10).toString(),
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.propertyCode && { propertyCode: filters.propertyCode }),
      ...(filters.bookingStatus && { bookingStatus: filters.bookingStatus })
    });

    const response = await axiosInstance.get(`/pms/front-office/reservations/checkins?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || "Failed to fetch check-ins"
    };
  }
};

export const fetchCheckOuts = async (filters: {
  startDate: string;
  endDate: string;
  propertyId?: string;
  propertyCode?: string;
  bookingStatus?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 10).toString(),
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.propertyCode && { propertyCode: filters.propertyCode }),
      ...(filters.bookingStatus && { bookingStatus: filters.bookingStatus })
    });

    const response = await axiosInstance.get(`/pms/front-office/reservations/checkouts?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error?.message || "Failed to fetch check-outs"
    };
  }
};

export const fetchReservationByCode = async (bookingCode: string) => {
  try {
    const response = await axiosInstance.get(`/pms/front-office/reservations/${bookingCode}`);
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
    const response = await axiosInstance.put(`/pms/front-office/reservations/cancel/${reservationId}`);
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
    const response = await axiosInstance.patch(`/pms/front-office/reservations/no-show/${reservationId}`);
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
    const response = await axiosInstance.patch(`/pms/front-office/reservations/amend/${reservationId}`, {
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