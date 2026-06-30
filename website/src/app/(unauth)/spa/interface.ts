import { CurrencyCode } from "@/src/components/currencyCode/currency-code.type";

export interface ISpaApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ISpaCategory {
  name?: string;
  _translations?:{
    name: string;
  }
}
export interface ISpaSubCategory{
  name?: string;
  categoryId?: string;
  isActive?: boolean;
  _translations?:{
    name: string;
  }
}
export interface ISpaSlotReservation {
  id?: string;
  bookingCode: string;
}

export interface ISlotsAvailable {
  id: string;
  status: 'active' | 'inactive' | 'booked' | 'completed' | 'cancelled';
  reservationId: string | null;
}

export interface ISpaSlot {
  id: string;
  startTime: string;
  endTime?: string | null;
  isBooked: boolean;
  slotsAvailable?: ISlotsAvailable[]; // add this
  availableCount?: number; // active slotsAvailable count
  totalCount?: number; // total slotsAvailable count
  reservationId?: string | null;
  SlotBooking?: {
    spaBookingId: string;
  } | null;
  Reservation?: ISpaSlotReservation | null;
}

export interface ISpaDate {
  id: string;
  date: string;
  Slots?: ISpaSlot[];
}

export interface ISpa {
  id: string;
  name: string;
  description?: string | null;
  location: string | null;
  Category: ISpaCategory;
  SubCategory: ISpaSubCategory;
  isInclusive?: boolean;
  discountValue?: number | null;
  currencyCode?: string | null;
  serviceTime: number | null;
  images:string[]
  SpaDates?: ISpaDate[];
  _translations?:{
    name: string;
    description: string;
    location: string;
  }
}

export interface ICreateSpaReservationSlot {
  spaId: string;
  slotsAvailableId: string;
  amount: number;
  userName?: string;
  userEmail?: string;
}

export interface ICreateSpaReservationRequest {
  userEmail: string;
  userContactNumber: string;
  userName: string;
  slots: ICreateSpaReservationSlot[];
  currencyCode: CurrencyCode;
  bookingCode?: string;
}