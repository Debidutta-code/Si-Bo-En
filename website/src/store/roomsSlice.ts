import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface baseByGuestAmts{
  amountBeforeTax:number;
  numberOfGuests:number;
}
export interface room_price{
  baseByGuestAmts?:baseByGuestAmts[];
  currencyCode?:string;
  ratePlanCode?:string;
  ratePlanName?:string;
}
export interface Room {
  amenities: any;
  id: string;
  room_name: string;
  room_type: string;
  room_size: number;
  max_occupancy: number;
  room_price: room_price[];
  currency_code: string;
  rate_plan_code: string;
  has_valid_rate: boolean;
  images:string[];
  description:string;
  room_unit: string
  room_view: string
}

interface RoomsState {
  rooms: Room[];
}

const initialState: RoomsState = {
  rooms: [],
};

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setRooms(state, action: PayloadAction<Room[]>) {
      state.rooms = action.payload;
    },
    clearRooms(state) {
      state.rooms = [];
    },
  },
});

export const { setRooms, clearRooms } = roomsSlice.actions;
export default roomsSlice.reducer;
