import type { LanguageCode } from '@/components/language/language';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface LanguageState {
  selectedLanguage: LanguageCode;
}

const initialState: LanguageState = {
  selectedLanguage: 'en',
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.selectedLanguage = action.payload;
    },

    resetLanguage: (state) => {
      state.selectedLanguage = 'en';
    },
  },
});

export const { setLanguage, resetLanguage } = languageSlice.actions;

export default languageSlice.reducer;