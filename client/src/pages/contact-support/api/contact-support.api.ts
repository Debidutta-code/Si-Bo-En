import createAxiosInstance from "@/components/axiosInstance";
import type {
  IApiResponse,
  ICreateTicketRequest,
  ITicket,
  IUpdatePriorityRequest,
  IUpdateStatusRequest,
} from "../interfaces";

const axiosInstance = createAxiosInstance();

export const createTicket = async (
  data: ICreateTicketRequest
): Promise<IApiResponse<ITicket>> => {
  try {
    const { propertyId, ...ticketData } = data;
    const response = await axiosInstance.post(`/contact-support/${propertyId}`, ticketData);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const getAllTickets = async (): Promise<IApiResponse<ITicket[]>> => {
  try {
    const response = await axiosInstance.get("/contact-support");
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const getTicketById = async (
  id: string
): Promise<IApiResponse<ITicket>> => {
  try {
    const response = await axiosInstance.get(`/contact-support/${id}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const updateTicketStatus = async (
  id: string,
  data: IUpdateStatusRequest
): Promise<IApiResponse<ITicket>> => {
  try {
    const response = await axiosInstance.patch(
      `/contact-support/${id}/status`,
      data
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const updateTicketPriority = async (
  id: string,
  data: IUpdatePriorityRequest
): Promise<IApiResponse<ITicket>> => {
  try {
    const response = await axiosInstance.patch(
      `/contact-support/${id}/priority`,
      data
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const deleteTicket = async (
  id: string
): Promise<IApiResponse<ITicket>> => {
  try {
    const response = await axiosInstance.delete(`/contact-support/${id}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};
