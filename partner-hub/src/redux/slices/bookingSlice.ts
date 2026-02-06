import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Reservation, Guest, AddOn } from '@/lib/types';

interface BookingState {
  reservations: Reservation[];
  currentBooking: {
    checkIn: string | null;
    checkOut: string | null;
    guests: Guest[];
    addOns: AddOn[];
    paymentMethod: 'pay_at_hotel' | 'pay_online' | null;
    totalAmount: number;
  };
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
}

const initialState: BookingState = {
  reservations: [],
  currentBooking: {
    checkIn: null,
    checkOut: null,
    guests: [],
    addOns: [],
    paymentMethod: null,
    totalAmount: 0,
  },
  isLoading: false,
  totalCount: 0,
  currentPage: 1,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setReservations: (state, action: PayloadAction<Reservation[]>) => {
      state.reservations = action.payload;
    },
    setBookingDates: (state, action: PayloadAction<{ checkIn: string; checkOut: string }>) => {
      state.currentBooking.checkIn = action.payload.checkIn;
      state.currentBooking.checkOut = action.payload.checkOut;
    },
    addGuest: (state, action: PayloadAction<Guest>) => {
      state.currentBooking.guests.push(action.payload);
    },
    updateGuest: (state, action: PayloadAction<{ index: number; guest: Guest }>) => {
      state.currentBooking.guests[action.payload.index] = action.payload.guest;
    },
    removeGuest: (state, action: PayloadAction<number>) => {
      state.currentBooking.guests.splice(action.payload, 1);
    },
    setAddOns: (state, action: PayloadAction<AddOn[]>) => {
      state.currentBooking.addOns = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<'pay_at_hotel' | 'pay_online'>) => {
      state.currentBooking.paymentMethod = action.payload;
    },
    setTotalAmount: (state, action: PayloadAction<number>) => {
      state.currentBooking.totalAmount = action.payload;
    },
    resetBooking: (state) => {
      state.currentBooking = initialState.currentBooking;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTotalCount: (state, action: PayloadAction<number>) => {
      state.totalCount = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
});

export const {
  setReservations,
  setBookingDates,
  addGuest,
  updateGuest,
  removeGuest,
  setAddOns,
  setPaymentMethod,
  setTotalAmount,
  resetBooking,
  setLoading,
  setTotalCount,
  setCurrentPage,
} = bookingSlice.actions;

export default bookingSlice.reducer;
