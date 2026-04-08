import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoyaltyUserState {
  isLoggedIn: boolean;
  id: string | null;
  email: string | null;
}

const initialState: LoyaltyUserState = {
  isLoggedIn: false,
  id: null,
  email: null,
};

const loyaltyUserSlice = createSlice({
  name: 'loyaltyUser',
  initialState,
  reducers: {
    loyaltyLoginSuccess(state, action: PayloadAction<{ id: string; email: string }>) {
      state.isLoggedIn = true;
      state.id = action.payload.id;
      state.email = action.payload.email;
    },
    loyaltyLogout(state) {
      state.isLoggedIn = false;
      state.id = null;
      state.email = null;
    },
  },
});

export const { loyaltyLoginSuccess, loyaltyLogout } = loyaltyUserSlice.actions;
export default loyaltyUserSlice.reducer;
