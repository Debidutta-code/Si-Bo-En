"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setBookingContext } from "@/src/store/bookingSlice";
import { IPropertyContextState, IPropertyDetailsData } from "@/src/app/(unauth)/Rooms/types";
import { deriveBookingEngineColor, getPropertyDetailsService } from "@/src/app/(unauth)/Rooms/services";
import { DEFAULT_BOOKING_ENGINE_COLOR } from "../../app/(unauth)/Rooms/services";



interface IPropertyContext extends IPropertyContextState {
  propertyDetails: IPropertyDetailsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: (code: string) => Promise<void>;
}

const PropertyContext = createContext<IPropertyContext | null>(null);


export function PropertyProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const fetchedCodeRef = useRef<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyDetails, setPropertyDetails] =
    useState<IPropertyDetailsData | null>(null);
  const [contextState, setContextState] = useState<IPropertyContextState>({
    propertyId: null,
    propertyCode: null,
    hotelName: null,
    propertyConfigs: null,
    propertyAddress: null,
    bookingEngineColor: DEFAULT_BOOKING_ENGINE_COLOR,
  });

  const loadProperty = async (code: string) => {
    if (!code || fetchedCodeRef.current === code) return;
    fetchedCodeRef.current = code;

    setIsLoading(true);
    setError(null);

    const { success, message, data } = await getPropertyDetailsService(code);

    if (!success || !data) {
      setError(message);
      setIsLoading(false);
      return;
    }

    const bookingEngineColor = deriveBookingEngineColor(data.bookingEngineConfig);
    const hotelName =
      (data as any)._translations?.propertyName ?? data.propertyName;

    const derived: IPropertyContextState = {
      propertyId: data.id,
      propertyCode: data.propertyCode,
      hotelName,
      propertyConfigs: data.propertyConfigs,
      propertyAddress: data.propertyAddress,
      bookingEngineColor,
    };

    setPropertyDetails(data);
    setContextState(derived);

    // Keep Redux booking slice in sync so the rest of the
    // app (SearchWidget, Rooms page, etc.) still works unchanged
    dispatch(
      setBookingContext({
        PropertyCode: data.propertyCode,
        hotelName,
        PropertyDetails: data,
        bookingEngineColor,
        propertyConfigs: data.propertyConfigs ?? null,
        propertyAddress: data.propertyAddress ?? null,
        propertyId: data.id,
      } as any)
    );

    setIsLoading(false);
  };

  // Auto-fetch whenever the `code` query param changes
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      // Reset the guard when the code actually changes so
      // navigating between properties works correctly
      if (fetchedCodeRef.current && fetchedCodeRef.current !== code) {
        fetchedCodeRef.current = null;
      }
      loadProperty(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("code")]);

  const value: IPropertyContext = {
    ...contextState,
    propertyDetails,
    isLoading,
    error,
    refetch: async (code) => {
      fetchedCodeRef.current = null; // force re-fetch
      await loadProperty(code);
    },
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePropertyContext(): IPropertyContext {
  const ctx = useContext(PropertyContext);
  if (!ctx) {
    throw new Error("usePropertyContext must be used inside <PropertyProvider>");
  }
  return ctx;
}