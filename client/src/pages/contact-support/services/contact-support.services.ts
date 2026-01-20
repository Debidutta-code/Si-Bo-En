import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  updateTicketPriority,
  deleteTicket,
} from "../api";
import type {
  ICreateTicketRequest,
  IUpdateStatusRequest,
  IUpdatePriorityRequest,
} from "../interfaces";

export const createTicketService = async (
  data: ICreateTicketRequest
) => {
  try {
    if (!data.propertyId || data.propertyId.trim() === "") {
      return { success: false, message: "Property is required." };
    }
    if (!data.subject || data.subject.trim() === "") {
      return { success: false, message: "Subject is required." };
    }
    if (!data.description || data.description.trim() === "") {
      return { success: false, message: "Description is required." };
    }

    const response = await createTicket(data);
    return response;
  } catch (error) {
    return { success: false, message: "Failed to create ticket." };
  }
};

export const getAllTicketsService = async () => {
  try {
    const response = await getAllTickets();
    return response;
  } catch (error) {
    return { success: false, message: "Failed to fetch tickets." };
  }
};

export const getTicketByIdService = async (id: string) => {
  try {
    if (!id || id.trim() === "") {
      return { success: false, message: "Ticket ID is required." };
    }
    const response = await getTicketById(id);
    return response;
  } catch (error) {
    return { success: false, message: "Failed to fetch ticket." };
  }
};

export const updateTicketStatusService = async (
  id: string,
  data: IUpdateStatusRequest
) => {
  try {
    if (!id || id.trim() === "") {
      return { success: false, message: "Ticket ID is required." };
    }
    if (!data.status || data.status.trim() === "") {
      return { success: false, message: "Status is required." };
    }
    const response = await updateTicketStatus(id, data);
    return response;
  } catch (error) {
    return { success: false, message: "Failed to update ticket status." };
  }
};

export const updateTicketPriorityService = async (
  id: string,
  data: IUpdatePriorityRequest
) => {
  try {
    if (!id || id.trim() === "") {
      return { success: false, message: "Ticket ID is required." };
    }
    if (!data.priority || data.priority.trim() === "") {
      return { success: false, message: "Priority is required." };
    }
    const response = await updateTicketPriority(id, data);
    return response;
  } catch (error) {
    return { success: false, message: "Failed to update ticket priority." };
  }
};

export const deleteTicketService = async (id: string) => {
  try {
    if (!id || id.trim() === "") {
      return { success: false, message: "Ticket ID is required." };
    }
    const response = await deleteTicket(id);
    return response;
  } catch (error) {
    return { success: false, message: "Failed to delete ticket." };
  }
};
