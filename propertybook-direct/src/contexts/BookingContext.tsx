import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type {
  ISearchCriteria,
  IPropertyDetails,
  IRoom,
  IRoomPrice,
  IAddon,
  IPromotion,
  IBookingEngineConfig,
} from '@/pages/rooms/interfaces';
import { differenceInDays, parseISO } from 'date-fns';
import { IBookingSession, IGuestDetails, ILoyaltyInfo, IPriceSummary } from '@/types/booking';

type BookingAction =
  | { type: 'SET_SEARCH_CRITERIA'; payload: ISearchCriteria }
  | { type: 'SET_PROPERTY_DETAILS'; payload: IPropertyDetails }
  | { type: 'SET_ROOMS'; payload: IRoom[] }
  | { type: 'SELECT_ROOM'; payload: IRoom }
  | { type: 'SELECT_RATE_PLAN'; payload: IRoomPrice }
  | { type: 'SET_GUEST_DETAILS'; payload: IGuestDetails }
  | { type: 'APPLY_LOYALTY_DISCOUNT'; payload: ILoyaltyInfo }
  | { type: 'REMOVE_LOYALTY_DISCOUNT' }
  | { type: 'SELECT_PROMOTION'; payload: IPromotion }
  | { type: 'REMOVE_PROMOTION' }
  | { type: 'ADD_ADDON'; payload: { addOn: IAddon; quantity: number; ratePlanCode: string } }
  | { type: 'REMOVE_ADDON'; payload: string }
  | { type: 'UPDATE_ADDON_QUANTITY'; payload: { addOnId: string; quantity: number } }
  | { type: 'CLEAR_ADDONS' }
  | { type: 'RESET_BOOKING' };

const initialState: IBookingSession = {
  searchCriteria: null,
  propertyDetails: null,
  selectedRoom: null,
  selectedRatePlan: null,
  guestDetails: null,
  rooms: [],
  loyaltyInfo: null,
  selectedAddOns: [],
  selectedPromotion: null,
};

function bookingReducer(state: IBookingSession, action: BookingAction): IBookingSession {
  switch (action.type) {
    case 'SET_SEARCH_CRITERIA':
      return { ...state, searchCriteria: action.payload };
    
    case 'SET_PROPERTY_DETAILS':
      return { ...state, propertyDetails: action.payload };
    
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    
    case 'SELECT_ROOM':
      return { 
        ...state, 
        selectedRoom: action.payload, 
        selectedRatePlan: null,
        selectedAddOns: [], // Clear add-ons when changing room
      };
    
    case 'SELECT_RATE_PLAN':
      return { 
        ...state, 
        selectedRatePlan: action.payload,
        selectedAddOns: [], // Clear add-ons when changing rate plan
      };
    
    case 'SET_GUEST_DETAILS':
      return { ...state, guestDetails: action.payload };
    
    case 'APPLY_LOYALTY_DISCOUNT':
      return { ...state, loyaltyInfo: action.payload };
    
    case 'REMOVE_LOYALTY_DISCOUNT':
      return { ...state, loyaltyInfo: null };
    
    case 'SELECT_PROMOTION':
      return { ...state, selectedPromotion: action.payload };
    
    case 'REMOVE_PROMOTION':
      return { ...state, selectedPromotion: null };
    
    case 'ADD_ADDON': {
      const existingIndex = state.selectedAddOns.findIndex(
        (sa) => sa.addOn.id === action.payload.addOn.id
      );
      if (existingIndex >= 0) {
        const updated = [...state.selectedAddOns];
        updated[existingIndex] = { 
          ...updated[existingIndex], 
          quantity: action.payload.quantity 
        };
        return { ...state, selectedAddOns: updated };
      }
      return { 
        ...state, 
        selectedAddOns: [...state.selectedAddOns, action.payload] 
      };
    }
    
    case 'REMOVE_ADDON':
      return {
        ...state,
        selectedAddOns: state.selectedAddOns.filter((sa) => sa.addOn.id !== action.payload),
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
    
    default:
      return state;
  }
}

interface BookingContextType {
  state: IBookingSession;
  setSearchCriteria: (criteria: ISearchCriteria) => void;
  setPropertyDetails: (details: IPropertyDetails) => void;
  setRooms: (rooms: IRoom[]) => void;
  selectRoom: (room: IRoom) => void;
  selectRatePlan: (ratePlan: IRoomPrice) => void;
  setGuestDetails: (details: IGuestDetails) => void;
  resetBooking: () => void;
  getPriceSummary: () => IPriceSummary | null;
  applyTheme: (config: IBookingEngineConfig) => void;
  applyLoyaltyDiscount: (loyaltyInfo: ILoyaltyInfo) => void;
  removeLoyaltyDiscount: () => void;
  selectPromotion: (promotion: IPromotion) => void;
  removePromotion: () => void;
  addAddOn: (addOn: IAddon, quantity: number, ratePlanCode: string) => void;
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

  // Apply theme when property details change
  useEffect(() => {
    if (state.propertyDetails?.bookingEngineConfig) {
      applyTheme(state.propertyDetails.bookingEngineConfig);
    }
  }, [state.propertyDetails]);

  const applyTheme = useCallback((config: IBookingEngineConfig) => {
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

  const setSearchCriteria = useCallback((criteria: ISearchCriteria) => {
    dispatch({ type: 'SET_SEARCH_CRITERIA', payload: criteria });
  }, []);

  const setPropertyDetails = useCallback((details: IPropertyDetails) => {
    dispatch({ type: 'SET_PROPERTY_DETAILS', payload: details });
    if (details.bookingEngineConfig) {
      applyTheme(details.bookingEngineConfig);
    }
  }, [applyTheme]);

  const setRooms = useCallback((rooms: IRoom[]) => {
    dispatch({ type: 'SET_ROOMS', payload: rooms });
  }, []);

  const selectRoom = useCallback((room: IRoom) => {
    dispatch({ type: 'SELECT_ROOM', payload: room });
  }, []);

  const selectRatePlan = useCallback((ratePlan: IRoomPrice) => {
    dispatch({ type: 'SELECT_RATE_PLAN', payload: ratePlan });
  }, []);

  const setGuestDetails = useCallback((details: IGuestDetails) => {
    dispatch({ type: 'SET_GUEST_DETAILS', payload: details });
  }, []);

  const resetBooking = useCallback(() => {
    dispatch({ type: 'RESET_BOOKING' });
  }, []);

  const applyLoyaltyDiscount = useCallback((loyaltyInfo: ILoyaltyInfo) => {
    dispatch({
      type: 'APPLY_LOYALTY_DISCOUNT',
      payload: loyaltyInfo,
    });
  }, []);

  const removeLoyaltyDiscount = useCallback(() => {
    dispatch({ type: 'REMOVE_LOYALTY_DISCOUNT' });
  }, []);

  const selectPromotion = useCallback((promotion: IPromotion) => {
    dispatch({ type: 'SELECT_PROMOTION', payload: promotion });
  }, []);

  const removePromotion = useCallback(() => {
    dispatch({ type: 'REMOVE_PROMOTION' });
  }, []);

  const getPriceSummary = useCallback((): IPriceSummary | null => {
    const { searchCriteria, selectedRoom, selectedRatePlan, loyaltyInfo, selectedAddOns, selectedPromotion } = state;

    if (!searchCriteria || !selectedRoom || !selectedRatePlan) {
      return null;
    }

    const startDate = parseISO(searchCriteria.startDate);
    const endDate = parseISO(searchCriteria.endDate);
    const nights = differenceInDays(endDate, startDate);

    if (nights <= 0) return null;

    // Base price from rate plan
    let basePrice = selectedRatePlan.totalAmount;

    // Tourist tax
    const touristTax = selectedRatePlan.touristTax?.calculatedTaxAmount || 0;

    // Calculate promotion discount
    let promotionDiscount = 0;
    if (selectedPromotion) {
      if (selectedPromotion.discountType === 'PERCENTAGE') {
        promotionDiscount = basePrice * (selectedPromotion.discountValue / 100);
      } else if (selectedPromotion.discountType === 'FIXED') {
        promotionDiscount = selectedPromotion.discountValue;
      }
    }

    // Calculate loyalty discount
    let loyaltyDiscount = 0;
    if (loyaltyInfo?.isApplied) {
      const discountableAmount = basePrice - promotionDiscount;
      if (loyaltyInfo.discountType === 'PERCENTAGE') {
        loyaltyDiscount = discountableAmount * (loyaltyInfo.discountValue / 100);
      } else if (loyaltyInfo.discountType === 'FIXED') {
        loyaltyDiscount = loyaltyInfo.discountValue;
      }
    }

    // Calculate add-ons total
    const addOnsBreakdown = (selectedAddOns || []).map((sa) => {
      let totalPrice = sa.addOn.price * sa.quantity;
      
      // Handle posting rhythm (per night, per stay, etc.)
      if (sa.addOn.postingRhythm === 'PER_NIGHT') {
        totalPrice *= nights;
      } else if (sa.addOn.postingRhythm === 'PER_PERSON') {
        totalPrice *= (searchCriteria.guests.adults + searchCriteria.guests.children);
      } else if (sa.addOn.postingRhythm === 'PER_PERSON_PER_NIGHT') {
        totalPrice *= (searchCriteria.guests.adults + searchCriteria.guests.children) * nights;
      }

      return {
        name: sa.addOn.name,
        quantity: sa.quantity,
        unitPrice: sa.addOn.price,
        totalPrice,
      };
    });

    const addOnsTotal = addOnsBreakdown.reduce((sum, addon) => sum + addon.totalPrice, 0);

    // Calculate taxes (assuming tax is not included in total amount)
    const taxRate = 0.12; // You might want to get this from property config
    const taxableAmount = basePrice - promotionDiscount - loyaltyDiscount + addOnsTotal;
    const taxes = taxableAmount * taxRate;

    // Calculate final total
    const total = basePrice - promotionDiscount - loyaltyDiscount + addOnsTotal + taxes + touristTax;

    return {
      nights,
      basePrice,
      taxes,
      touristTax,
      promotionDiscount,
      loyaltyDiscount,
      addOnsTotal,
      total,
      currency: selectedRatePlan.currencyCode,
      roomName: selectedRoom.room_name,
      ratePlanName: selectedRatePlan.ratePlanName,
      breakdown: {
        baseByGuestAmts: selectedRatePlan.baseByGuestAmts,
        selectedAddOns: addOnsBreakdown,
      },
    };
  }, [state]);

  const addAddOn = useCallback((addOn: IAddon, quantity: number, ratePlanCode: string) => {
    dispatch({ type: 'ADD_ADDON', payload: { addOn, quantity, ratePlanCode } });
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
        setPropertyDetails,
        setRooms,
        selectRoom,
        selectRatePlan,
        setGuestDetails,
        resetBooking,
        getPriceSummary,
        applyTheme,
        applyLoyaltyDiscount,
        removeLoyaltyDiscount,
        selectPromotion,
        removePromotion,
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