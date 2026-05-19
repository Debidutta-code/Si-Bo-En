import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../app/(auth)/login/types';

interface CustomerState {
  customer: Customer | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: CustomerState = {
  customer: null,
  isAuthenticated: false,
  loading: false,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomer(state, action: PayloadAction<Customer>) {
      state.customer = action.payload;
      state.isAuthenticated = true;
    },
    clearCustomer(state) {
      state.customer = null;
      state.isAuthenticated = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setCustomer, clearCustomer, setLoading } = customerSlice.actions;
export default customerSlice.reducer;