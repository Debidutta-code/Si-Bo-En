// hooks/useBookingColors.ts
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export const useBookingColors = () => {
  const bookingColors = useSelector((state: RootState) => state.booking.bookingEngineColor) ;

  return {
    primaryColor: bookingColors?.primaryColour || "#F97316",
    secondaryColor: bookingColors?.secondaryColour || "#FB923C",
    textColor: bookingColors?.TextColour || "#FFFFFF",
    buttonBgColor: bookingColors?.ButtonbgColor || "#F97316",
    buttonTextColor: bookingColors?.buttonTextColour || "#FFFFFF",
    buttonHoverColor: bookingColors?.buttonHover || "#EA580C",
  };
};
