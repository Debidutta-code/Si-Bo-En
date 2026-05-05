export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface IUser {
  firstName: string;
  lastName: string;
  role: string;
}

export interface ITicket {
  id: string;
  ticketNo: string;
  propertyId: string;
  subject: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: string;
  createdAt: string;
  CreatedBy: IUser;
}

export interface ICreateTicketRequest {
  propertyId: string;
  subject: string;
  description: string | null;
}

export interface IUpdateStatusRequest {
  status: TicketStatus;
}

export interface IUpdatePriorityRequest {
  priority: TicketPriority;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
