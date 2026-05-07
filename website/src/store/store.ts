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
import roomsReducer from './roomsSlice';
import bookingReducer from './bookingSlice';
import userReducer from './userSlice';
import bookingViewReducer from './bookingviewSlice';
import loyaltyUserReducer from './loyaltyUserSlice';

// ── SSR-safe storage ──────────────────────────────────────────────────────────
const createNoopStorage = () => ({
  getItem(_key: string) { return Promise.resolve(null); },
  setItem(_key: string, value: unknown) { return Promise.resolve(value); },
  removeItem(_key: string) { return Promise.resolve(); },
});

const storage =
  typeof window !== "undefined"
    ? require("redux-persist/lib/storage").default
    : createNoopStorage();
// ─────────────────────────────────────────────────────────────────────────────

const bookingPersistConfig = {
  key: 'booking',
  storage,
  blacklist: ['startDate', 'endDate', 'PropertyDetails', 'bookingEngineColor', 'roomsData'],
};

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'loyaltyUser'],
};

const rootReducer = combineReducers({
  rooms: roomsReducer,
  booking: persistReducer(bookingPersistConfig, bookingReducer),
  user: userReducer,
  bookingView: bookingViewReducer,
  loyaltyUser: loyaltyUserReducer,
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;