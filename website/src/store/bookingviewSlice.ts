import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BookingViewState {
  bookingData: any | null; // Replace `any` with BookingData if you have types
}

const initialState: BookingViewState = {
  bookingData: null,
};

const bookingViewSlice = createSlice({
  name: "bookingView",
  initialState,
  reducers: {
    setBookingData(state, action: PayloadAction<any>) {
      state.bookingData = action.payload;
    },
    clearBookingData(state) {
      state.bookingData = null;
    },
  },
});

export const { setBookingData, clearBookingData } = bookingViewSlice.actions;
export default bookingViewSlice.reducer;
