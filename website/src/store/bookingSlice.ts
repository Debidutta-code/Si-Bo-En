import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface BookingEngineConfig {
  id: string;
  propertyId: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  buttonTextColor: string;
  bannerImage: string;
  logo: string;
}

interface PropertyAddress {
  id: string;
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  location: string;
  landmark: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  propertyId: string;
}

interface Guests {
  adults: number;
  children: number;
  rooms: number;
  // childAges: number[];
}

interface GuestDetail {
  type: "adult" | "child";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}
interface PropertyDetails {
  id: string;
  propertyName: string;
  propertyCode: string;
  starRating: number;
  bookingEngineConfig: BookingEngineConfig;
  address: PropertyAddress;
  _id: string;
  user_id: string;
  property_name: string;
  property_email: string;
  property_contact: string;
  star_rating: string;
  property_code: string;
  property_category: string;
  property_type: string;
  property_room: string[];
  image: string[];
  description: string;
  isDraft: boolean;
  rate_plan: string[];
  brand: string | null;
  __v: number;
  property_address: string;
  property_amenities: string;
  room_Aminity: string;
}
export interface BookingEngineColor {
  primaryColor: string;  // Note: "colour" vs "color" - be consistent
  secondaryColor: string;
  tertiaryColor: string;
  buttonTextColor: string;
  bgImage?: string;
  logo?: string;
}

interface FinalPrice {
  totalAmount: number;
  numberOfNights: number;
  baseRatePerNight: number;
  additionalGuestCharges: number;
  breakdown: {
    totalBaseAmount: number;
    totalAdditionalCharges: number;
    totalAmount: number;
    numberOfNights: number;
    averagePerNight: number;
  };
  dailyBreakdown: any | null;
  availableRooms: number;
  requestedRooms: number;
}

interface BookingState {
  PropertyCode: string;
  startDate: string;
  endDate: string;
  guests: Guests;
  location: string;
  roomId?: string;
  currency?: string;
  email?: string;
  phone?: string;
  userId?: string;
  hotelName?: string;
  roomName?: string;
  ratePlanCode?: string;
  guestDetails?: GuestDetail[];
  finalPrice?: FinalPrice;
  bookingStatus?: string;

  numberOfRooms: number | null;
  bookingCode?: string;
  roomTypeCode?: string;
  senderUrl?: string;
  PropertyDetails?: PropertyDetails;
  bookingEngineColor?: BookingEngineColor;
  bookingSource?: string;
}

const initialState: BookingState = {
  PropertyCode: "",
  startDate: "",
  endDate: "",
  guests: {
    adults: 1,
    children: 0,
    rooms: 1,
    //  childAges: []
  },
  location: "",
  roomId: undefined,
  currency: undefined,
  email: undefined,
  phone: undefined,
  userId: undefined,
  hotelName: undefined,
  roomName: undefined,
  ratePlanCode: undefined,
  roomTypeCode: undefined,
  guestDetails: undefined,
  numberOfRooms: null,
  bookingCode: undefined,
  PropertyDetails: undefined,
  bookingSource: "direct",
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setCurrency(state, action: PayloadAction<string>) {
      state.currency = action.payload;
    },
    setBookingContext(state, action: PayloadAction<BookingState>) {
      return {
        ...state,
        ...action.payload,
      };
    },

    setFullBookingDetails(state, action: PayloadAction<BookingState>) {
      return {
        ...state,
        ...action.payload,
      };
    },
    clearBookingContext() {
      return initialState;
    },
    setBookingCode(state, action: PayloadAction<string>) {
      state.bookingCode = action.payload;
    },
    setBookingStatus(state, action: PayloadAction<string>) {
      state.bookingStatus = action.payload;
    },
    setSenderUrl(state, action: PayloadAction<string>) {
      state.senderUrl = action.payload;
    },
    setBookingSource(state, action: PayloadAction<string>) { // ADD THIS
      state.bookingSource = action.payload;
    },
    clearSenderUrl(state) {
      state.senderUrl = undefined;
    },
  },
});

export const {
  setBookingContext,
  setFullBookingDetails,
  clearBookingContext,
  setBookingCode,
  setBookingStatus,
  setSenderUrl,
  clearSenderUrl,
  setCurrency,
  setBookingSource
} = bookingSlice.actions;
export default bookingSlice.reducer;
