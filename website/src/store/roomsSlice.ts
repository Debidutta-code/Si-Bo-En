import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IRoom } from "../app/(unauth)/Rooms/types";

interface RoomsState {
  rooms: IRoom[];
}

const initialState: RoomsState = {
  rooms: [],
};

const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    setRooms(state, action: PayloadAction<IRoom[]>) {
      state.rooms = action.payload;
    },
    clearRooms(state) {
      state.rooms = [];
    },
  },
});

export const { setRooms, clearRooms } = roomsSlice.actions;
export default roomsSlice.reducer;