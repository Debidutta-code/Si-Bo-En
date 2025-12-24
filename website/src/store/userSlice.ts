import { createSlice, PayloadAction } from '@reduxjs/toolkit';


const initialState: UserState = {
  isLoggedIn: false,
  firstName: null,
  lastName: null,
  email: null,
  token: null,
  userId: null,
};

interface UserState {
  isLoggedIn: boolean;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  token: string | null;
  userId: string | null;
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ firstName: string; lastName: string; email: string; token: string; userId: string }>) {
      state.isLoggedIn = true;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.firstName = null;
      state.lastName = null;
      state.email = null;
      state.token = null;
      state.userId = null;
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions;

export default userSlice.reducer;
