// hooks/useBookingColors.ts
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export const useBookingColors = () => {
  const bookingColors = useSelector((state: RootState) => state.booking.bookingEngineColor) ;

  return {
    primaryColor: bookingColors?.primaryColor || "#F97316",
    secondaryColor: bookingColors?.secondaryColor || "#FB923C",
    textColor: bookingColors?.secondaryColor || "#FFFFFF",
    buttonBgColor: bookingColors?.primaryColor || "#F97316",
    buttonTextColor: bookingColors?.buttonTextColor || "#FFFFFF",
    buttonHoverColor: bookingColors?.secondaryColor || "#EA580C",
  };
};
