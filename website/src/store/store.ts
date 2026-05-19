import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import roomsReducer from './roomsSlice';
import bookingReducer from './bookingSlice';
import userReducer from './userSlice';
import bookingViewReducer from './bookingviewSlice';
import loyaltyUserReducer from './loyaltyUserSlice';
import customerReducer from './customerSlice';

const bookingPersistConfig = {
  key: 'booking',
  storage,
  blacklist: ['startDate', 'endDate', 'PropertyDetails', 'bookingEngineColor', 'roomsData'],
};

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'loyaltyUser', 'customer'],
};

const rootReducer = combineReducers({
  rooms: roomsReducer,
  booking: persistReducer(bookingPersistConfig, bookingReducer),
  user: userReducer,
  bookingView: bookingViewReducer,
  loyaltyUser: loyaltyUserReducer,
  customer: customerReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
