import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CurrencyCode } from "../components/currencyCode/currency-code.type";


interface BookingEngineConfig {
  id: string;
  propertyId: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  buttonTextColor: string;
  bannerImage: string;
  logo: string;
  url: string;
}
interface PropertyConfigs {
  isSpaModuleEnabled: boolean;
  isLoyaltyProgramEnabled: boolean;
  showVideo: boolean;
  isB2cAvailable: boolean;
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
  _translations?: {
    addressLine1: string;
    addressLine2?: string;
    country: string;
    state: string;
    city: string;
    location: string;
    landmark: string;
  }
}

interface Guests {
  adults: number;
  children: number;
  rooms: number | Room[]; // ✅ Allow rooms to be either number or array
  roomsArray?: Room[]; // ✅ Add optional roomsArray for detailed data
}
interface Room {
  adults: number;
  children: number;
  childAges: number[];
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
  image: string[];
  description: string;
  isDraft: boolean;
  brand: string | null;
}
export interface BookingEngineColor {
  primaryColor: string;  // Note: "colour" vs "color" - be consistent
  secondaryColor: string;
  tertiaryColor: string;
  buttonTextColor: string;
  bgImage?: string;
  logo?: string;
  url?: string;
}

interface FinalPrice {
  totalAmount: number;
  amountBeforeTax: number;
  taxedAmount: number;
  totalAddonAmount: number;
  totalPromotionAmount: number;
  currentChargeableAmount: number;
  latterpayableAmount: number;
  loyalityDiscount: number;
  promoCodeDiscount: number;
  currencyCode: CurrencyCode;
  dailyPriceBrakeDown: any[];
  taxBrakeDown: any[];
  addonBrakeDown: any[];
  promotionBrakeDown: any[];
  numberOfNights: number;
  baseRatePerNight: number;
  requestedRooms: number;
  additionalGuestCharges: number;
  totalTaxAmount: number;
  availableRooms?: number;
}

interface BookingState {
  PropertyCode: string;
  startDate: string;
  endDate: string;
  guests: Guests;
  promocode: string;
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
  finalPrice?: any;
  bookingStatus?: string;

  numberOfRooms: number | null;
  bookingCode?: string;
  roomTypeCode?: string;
  senderUrl?: string;
  PropertyDetails?: PropertyDetails;
  bookingEngineColor?: BookingEngineColor;
  bookingSource?: string;
  selectedAddons?: any[];
  selectedPromotions?: any[];
  paymentMethod?: string;
  loyalityMemberEmail?: string;
  propertyConfigs?: PropertyConfigs | null;
  propertyAddress?: PropertyAddress | null;
  propertyId?: string | null;
}

const initialState: BookingState = {
  PropertyCode: "",
  startDate: "",
  endDate: "",
  guests: {
    adults: 1,
    children: 0,
    rooms: 1,
    roomsArray: [{
      adults: 1,
      children: 0,
      childAges: [],
    }],
  },
  promocode: "",
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
  paymentMethod: "pay_at_hotel",
  loyalityMemberEmail: undefined,
  propertyConfigs: null,
  propertyAddress: null,
  propertyId: null,
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

    setFullBookingDetails(state, action: PayloadAction<any>) {
      return {
        ...state,
        bookingCode: action.payload.bookingCode ?? state.bookingCode,
        bookingStatus: action.payload.bookingStatus ?? state.bookingStatus,
        guestDetails: action.payload.guestDetails ?? state.guestDetails,
        finalPrice: action.payload.finalPrice ?? state.finalPrice,
        roomName: action.payload.roomName ?? state.roomName,
        roomTypeCode: action.payload.roomTypeCode ?? state.roomTypeCode,
        ratePlanCode: action.payload.ratePlanCode ?? state.ratePlanCode,
        numberOfRooms: action.payload.numberOfRooms ?? state.numberOfRooms,
        selectedAddons: action.payload.selectedAddons ?? state.selectedAddons,
        selectedPromotions: action.payload.selectedPromotions ?? state.selectedPromotions,
        paymentMethod: action.payload.paymentMethod ?? state.paymentMethod,
        loyalityMemberEmail: action.payload.loyalityMemberEmail ?? state.loyalityMemberEmail,

        // ✅ Handle both shapes: API response uses bookingUserEmail, onSubmit dispatch uses email
        email: action.payload.bookingUserEmail  // from reservation API response
          ?? action.payload.email             // from onSubmit dispatch in Rooms.tsx
          ?? state.email,

        phone: action.payload.bookingUserPhone  // from reservation API response
          ?? action.payload.phone             // from onSubmit dispatch in Rooms.tsx
          ?? state.phone,
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
    setBookingSource(state, action: PayloadAction<string>) {
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
