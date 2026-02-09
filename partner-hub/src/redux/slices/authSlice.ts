import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { IAgentsWA } from '@/pages/login/interface';

interface AuthState {
  user: IAgentsWA | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IAgentsWA>) => {
      state.user = action.payload;
    },
  
  },
});

export const { setUser,  } = authSlice.actions;
export default authSlice.reducer;
