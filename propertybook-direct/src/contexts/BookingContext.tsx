import  { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { 
  BookingSession, 
  SearchCriteria, 
  Room, 
  RatePlan, 
  GuestDetails, 
  BookingEngineConfig,
  PriceSummary,
  LoyaltyInfo,
  SelectedAddOn,
  AddOn
} from '@/types/booking';
import { differenceInDays, parseISO } from 'date-fns';

const STORAGE_KEY = 'hotel_booking_session';

type BookingAction =
  | { type: 'SET_SEARCH_CRITERIA'; payload: SearchCriteria }
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'SET_CONFIG'; payload: BookingEngineConfig }
  | { type: 'SELECT_ROOM'; payload: Room }
  | { type: 'SELECT_RATE_PLAN'; payload: RatePlan }
  | { type: 'SET_GUEST_DETAILS'; payload: GuestDetails }
  | { type: 'APPLY_LOYALTY_DISCOUNT'; payload: LoyaltyInfo }
  | { type: 'REMOVE_LOYALTY_DISCOUNT' }
  | { type: 'ADD_ADDON'; payload: { addOn: AddOn; quantity: number } }
  | { type: 'REMOVE_ADDON'; payload: string }
  | { type: 'UPDATE_ADDON_QUANTITY'; payload: { addOnId: string; quantity: number } }
  | { type: 'CLEAR_ADDONS' }
  | { type: 'RESET_BOOKING' }
  | { type: 'HYDRATE'; payload: BookingSession };

const initialState: BookingSession = {
  searchCriteria: null,
  selectedRoom: null,
  selectedRatePlan: null,
  guestDetails: null,
  config: null,
  rooms: [],
  loyaltyInfo: null,
  selectedAddOns: [],
};

function bookingReducer(state: BookingSession, action: BookingAction): BookingSession {
  switch (action.type) {
    case 'SET_SEARCH_CRITERIA':
      return { ...state, searchCriteria: action.payload };
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'SELECT_ROOM':
      return { ...state, selectedRoom: action.payload, selectedRatePlan: null };
    case 'SELECT_RATE_PLAN':
      return { ...state, selectedRatePlan: action.payload };
    case 'SET_GUEST_DETAILS':
      return { ...state, guestDetails: action.payload };
    case 'APPLY_LOYALTY_DISCOUNT':
      return { ...state, loyaltyInfo: action.payload };
    case 'REMOVE_LOYALTY_DISCOUNT':
      return { ...state, loyaltyInfo: null };
    case 'ADD_ADDON': {
      const existingIndex = state.selectedAddOns.findIndex(
        (sa) => sa.addOn.id === action.payload.addOn.id
      );
      if (existingIndex >= 0) {
        const updated = [...state.selectedAddOns];
        updated[existingIndex] = { ...updated[existingIndex], quantity: action.payload.quantity };
        return { ...state, selectedAddOns: updated };
      }
      return { ...state, selectedAddOns: [...state.selectedAddOns, action.payload] };
    }
    case 'REMOVE_ADDON':
      return { 
        ...state, 
        selectedAddOns: state.selectedAddOns.filter((sa) => sa.addOn.id !== action.payload) 
      };
    case 'UPDATE_ADDON_QUANTITY': {
      const updated = state.selectedAddOns.map((sa) =>
        sa.addOn.id === action.payload.addOnId
          ? { ...sa, quantity: action.payload.quantity }
          : sa
      );
      return { ...state, selectedAddOns: updated };
    }
    case 'CLEAR_ADDONS':
      return { ...state, selectedAddOns: [] };
    case 'RESET_BOOKING':
      return initialState;
    case 'HYDRATE':
      return action.payload;
    default:
      return state;
  }
}

interface BookingContextType {
  state: BookingSession;
  setSearchCriteria: (criteria: SearchCriteria) => void;
  setRooms: (rooms: Room[]) => void;
  setConfig: (config: BookingEngineConfig) => void;
  selectRoom: (room: Room) => void;
  selectRatePlan: (ratePlan: RatePlan) => void;
  setGuestDetails: (details: GuestDetails) => void;
  resetBooking: () => void;
  getPriceSummary: () => PriceSummary | null;
  applyTheme: (config: BookingEngineConfig) => void;
  applyLoyaltyDiscount: (discountPercentage: number, programName: string) => void;
  removeLoyaltyDiscount: () => void;
  addAddOn: (addOn: AddOn, quantity: number) => void;
  removeAddOn: (addOnId: string) => void;
  updateAddOnQuantity: (addOnId: string, quantity: number) => void;
  clearAddOns: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BookingSession;
        dispatch({ type: 'HYDRATE', payload: parsed });
        
        // Re-apply theme if config exists
        if (parsed.config) {
          applyTheme(parsed.config);
        }
      }
    } catch (error) {
      console.error('Failed to hydrate booking session:', error);
    }
  }, []);

  // Persist to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist booking session:', error);
    }
  }, [state]);

  const applyTheme = useCallback((config: BookingEngineConfig) => {
    const root = document.documentElement;
    
    if (config.primaryColor) {
      root.style.setProperty('--primary', hexToHSL(config.primaryColor));
    }
    if (config.secondaryColor) {
      root.style.setProperty('--secondary', hexToHSL(config.secondaryColor));
      root.style.setProperty('--accent', hexToHSL(config.secondaryColor));
    }
    if (config.tertiaryColor) {
      root.style.setProperty('--tertiary', hexToHSL(config.tertiaryColor));
    }
    if (config.buttonTextColor) {
      root.style.setProperty('--primary-foreground', hexToHSL(config.buttonTextColor));
      root.style.setProperty('--button-text', hexToHSL(config.buttonTextColor));
    }
  }, []);

  const setSearchCriteria = useCallback((criteria: SearchCriteria) => {
    dispatch({ type: 'SET_SEARCH_CRITERIA', payload: criteria });
  }, []);

  const setRooms = useCallback((rooms: Room[]) => {
    dispatch({ type: 'SET_ROOMS', payload: rooms });
  }, []);

  const setConfig = useCallback((config: BookingEngineConfig) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
    applyTheme(config);
  }, [applyTheme]);

  const selectRoom = useCallback((room: Room) => {
    dispatch({ type: 'SELECT_ROOM', payload: room });
  }, []);

  const selectRatePlan = useCallback((ratePlan: RatePlan) => {
    dispatch({ type: 'SELECT_RATE_PLAN', payload: ratePlan });
  }, []);

  const setGuestDetails = useCallback((details: GuestDetails) => {
    dispatch({ type: 'SET_GUEST_DETAILS', payload: details });
  }, []);

  const resetBooking = useCallback(() => {
    dispatch({ type: 'RESET_BOOKING' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const applyLoyaltyDiscount = useCallback((discountPercentage: number, programName: string) => {
    dispatch({ 
      type: 'APPLY_LOYALTY_DISCOUNT', 
      payload: { isApplied: true, discountPercentage, programName } 
    });
  }, []);

  const removeLoyaltyDiscount = useCallback(() => {
    dispatch({ type: 'REMOVE_LOYALTY_DISCOUNT' });
  }, []);

  const getPriceSummary = useCallback((): PriceSummary | null => {
    const { searchCriteria, selectedRoom, selectedRatePlan, loyaltyInfo, selectedAddOns } = state;
    
    if (!searchCriteria || !selectedRoom || !selectedRatePlan) {
      return null;
    }

    const startDate = parseISO(searchCriteria.startDate);
    const endDate = parseISO(searchCriteria.endDate);
    const nights = differenceInDays(endDate, startDate);

    if (nights <= 0) return null;

    let basePrice = selectedRatePlan.price_per_night * nights * searchCriteria.guests.rooms;
    
    // Apply loyalty discount if present
    const loyaltyDiscount = loyaltyInfo?.isApplied 
      ? basePrice * (loyaltyInfo.discountPercentage / 100) 
      : 0;
    basePrice = basePrice - loyaltyDiscount;

    // Calculate add-ons total (handle undefined for old localStorage data)
    const addOnsTotal = (selectedAddOns || []).reduce((acc, sa) => {
      let addOnPrice = sa.addOn.price * sa.quantity;
      if (sa.addOn.priceType === 'per_night') {
        addOnPrice *= nights;
      } else if (sa.addOn.priceType === 'per_person') {
        addOnPrice *= searchCriteria.guests.adults + searchCriteria.guests.children;
      }
      return acc + addOnPrice;
    }, 0);

    const taxRate = 0.12; // 12% tax
    const taxes = selectedRatePlan.includes_tax ? 0 : (basePrice + addOnsTotal) * taxRate;
    const total = basePrice + addOnsTotal + taxes;

    return {
      nights,
      basePrice,
      taxes,
      total,
      currency: selectedRatePlan.currency,
      roomName: selectedRoom.name,
      ratePlanName: selectedRatePlan.name,
      loyaltyDiscount: loyaltyDiscount > 0 ? loyaltyDiscount : undefined,
      loyaltyProgramName: loyaltyInfo?.programName,
      addOnsTotal: addOnsTotal > 0 ? addOnsTotal : undefined,
    };
  }, [state]);

  const addAddOn = useCallback((addOn: AddOn, quantity: number) => {
    dispatch({ type: 'ADD_ADDON', payload: { addOn, quantity } });
  }, []);

  const removeAddOn = useCallback((addOnId: string) => {
    dispatch({ type: 'REMOVE_ADDON', payload: addOnId });
  }, []);

  const updateAddOnQuantity = useCallback((addOnId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_ADDON_QUANTITY', payload: { addOnId, quantity } });
  }, []);

  const clearAddOns = useCallback(() => {
    dispatch({ type: 'CLEAR_ADDONS' });
  }, []);

  return (
    <BookingContext.Provider
      value={{
        state,
        setSearchCriteria,
        setRooms,
        setConfig,
        selectRoom,
        selectRatePlan,
        setGuestDetails,
        resetBooking,
        getPriceSummary,
        applyTheme,
        applyLoyaltyDiscount,
        removeLoyaltyDiscount,
        addAddOn,
        removeAddOn,
        updateAddOnQuantity,
        clearAddOns,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
