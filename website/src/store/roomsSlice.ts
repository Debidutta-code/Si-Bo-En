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
  roomName: string;
  roomType: string;
  roomSize: number;
  maxOccupancy: number;
  roomPrice: room_price[];
  currencyCode: string;
  ratePlanCode: string;
  hasValidRate: boolean;
  images:string[];
  description:string;
  roomUnit: string
  roomView: string;
  roomVideos:IRoomVideo|null;
}
interface IRoomVideo{
  id:string;
  roomId: string,
  url: string,
  thumbnail: string,
               
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
