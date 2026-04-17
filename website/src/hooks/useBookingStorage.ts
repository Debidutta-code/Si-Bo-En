import { useState, useEffect } from 'react';

interface BookingColors {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  buttonTextColor: string;
  logoIcon: string | null;
}

interface BookingStorage {
  colors: BookingColors;
  logoIcon: string | null;
}

const DEFAULT_COLORS: BookingColors = {
  primaryColor: "#1E3A8A",      
  secondaryColor: "#0d7a87",    
  tertiaryColor: "#3B82F6",     
  buttonTextColor: "#FFFFFF",
  logoIcon: null,
};

const getContrastTextColor = (bgColor: string): string => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#2F2A1F' : '#FFFFFF';
};

export const useBookingStorage = (bookingContext: any): BookingStorage => {
  const [colors, setColors] = useState<BookingColors>(DEFAULT_COLORS);
  const [logoIcon, setLogoIcon] = useState<string | null>(null);

  useEffect(() => {
    if (bookingContext?.bookingEngineColor) {
      const engineColor = bookingContext.bookingEngineColor;
      
      const primaryColor = engineColor.primaryColor || DEFAULT_COLORS.primaryColor;
      const secondaryColor = engineColor.primaryColor || DEFAULT_COLORS.secondaryColor;
      const tertiaryColor = engineColor.tertiaryColor || DEFAULT_COLORS.tertiaryColor;
      let buttonTextColor = engineColor.buttonTextColor || DEFAULT_COLORS.buttonTextColor;
      
      if (!engineColor.buttonTextColor) {
        buttonTextColor = getContrastTextColor(secondaryColor);
      }

      const newColors: BookingColors = {
        primaryColor,
        secondaryColor,
        tertiaryColor,
        buttonTextColor,
        logoIcon: null,
      };

      const newLogoIcon = bookingContext.PropertyDetails?.bookingEngineConfig?.logo ||
                          engineColor.logo || null;

      setColors(newColors);
      setLogoIcon(newLogoIcon);
    }
  }, [bookingContext]);

  return {
    colors,
    logoIcon,
  };
};