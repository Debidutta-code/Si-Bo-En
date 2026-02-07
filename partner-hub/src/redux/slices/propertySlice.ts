import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Property, Room } from '@/lib/types';

interface PropertyState {
  properties: Property[];
  selectedProperty: Property | null;
  rooms: Room[];
  selectedRoom: Room | null;
  isLoading: boolean;
}

const initialState: PropertyState = {
  properties: [],
  selectedProperty: null,
  rooms: [],
  selectedRoom: null,
  isLoading: false,
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setProperties: (state, action: PayloadAction<Property[]>) => {
      state.properties = action.payload;
    },
    setSelectedProperty: (state, action: PayloadAction<Property | null>) => {
      state.selectedProperty = action.payload;
    },
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
    },
    setSelectedRoom: (state, action: PayloadAction<Room | null>) => {
      state.selectedRoom = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setProperties, setSelectedProperty, setRooms, setSelectedRoom, setLoading } = propertySlice.actions;
export default propertySlice.reducer;
