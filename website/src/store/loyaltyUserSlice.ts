import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfileData } from './loyaltyUserTypes';

// ─── State ────────────────────────────────────────────────────────────────────

interface LoyaltyUserState {
  isLoggedIn: boolean;
  id: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  /** Full profile fetched from /me — includes all CreationGuest, loyalty configs, levels, properties */
  profile: ProfileData | null;
}

const initialState: LoyaltyUserState = {
  isLoggedIn: false,
  id: null,
  email: null,
  firstName: null,
  lastName: null,
  profile: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const loyaltyUserSlice = createSlice({
  name: 'loyaltyUser',
  initialState,
  reducers: {
    /** Called immediately after login API success */
    loyaltyLoginSuccess(
      state,
      action: PayloadAction<{ id: string; email: string; firstName?: string; lastName?: string }>
    ) {
      state.isLoggedIn = true;
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.firstName = action.payload.firstName ?? null;
      state.lastName = action.payload.lastName ?? null;
    },

    /**
     * Called after fetching /me — stores the complete loyalty profile tree:
     *   ProfileData → CreationGuest[] → CreationLoyaltyConfig →
     *     LoyalityLevels[], PropertyLoyaltyConfig[], BasicLoyaltyProgram
     */
    setLoyaltyProfile(state, action: PayloadAction<ProfileData>) {
      state.profile = action.payload;
      // Sync name fields from guest sub-object if available
      if (action.payload.guest) {
        state.firstName = action.payload.guest.firstName;
        state.lastName = action.payload.guest.lastName;
      }
    },

    /** Clear all state on logout */
    loyaltyLogout(state) {
      state.isLoggedIn = false;
      state.id = null;
      state.email = null;
      state.firstName = null;
      state.lastName = null;
      state.profile = null;
    },
  },
});

export const { loyaltyLoginSuccess, setLoyaltyProfile, loyaltyLogout } = loyaltyUserSlice.actions;
export default loyaltyUserSlice.reducer;
