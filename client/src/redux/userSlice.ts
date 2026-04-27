
import type { Role } from '@/components/layout/SideBar/Sidebar';
import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

// Your User interface
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  userLevel: number;
  name?: string; 
  creation?: string;
  propertyId?: string;
}

// Define the user state
interface UserState {
  user: User | null;
  error: string | null;
}

// Initial state
const initialState: UserState = {
  user: null,
  error: null,
};

// Create the user slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.error = null;
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
    
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Extract the action creators and reducer
export const { setUser, updateUser, clearUser, setError } = userSlice.actions;
export default userSlice.reducer;