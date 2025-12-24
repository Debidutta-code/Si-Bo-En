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

const STORAGE_KEY = 'bookingstorage';

const DEFAULT_COLORS: BookingColors = {
  primaryColor: "#2F2A1F",
  secondaryColor: "#E8DFC9",
  tertiaryColor: "#7D7566",
  buttonTextColor: "#2F2A1F",
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

  // Save to localStorage when bookingContext has colors/logo
  useEffect(() => {
    if (bookingContext?.bookingEngineColor) {
      const engineColor = bookingContext.bookingEngineColor;
      
      // Calculate colors with fallbacks and contrast logic
      const primaryColor = engineColor.primaryColor || DEFAULT_COLORS.primaryColor;
      const secondaryColor = engineColor.primaryColor || DEFAULT_COLORS.secondaryColor; // Note: using primaryColor as fallback per your original code
      const tertiaryColor = engineColor.tertiaryColor || DEFAULT_COLORS.tertiaryColor;
      let buttonTextColor = engineColor.buttonTextColor || DEFAULT_COLORS.buttonTextColor;
      
      // Apply contrast logic if buttonTextColor not explicitly set
      if (!engineColor.buttonTextColor) {
        buttonTextColor = getContrastTextColor(secondaryColor);
      }

      const newColors: BookingColors = {
        primaryColor,
        secondaryColor,
        tertiaryColor,
        buttonTextColor,
        logoIcon: null, // logoIcon handled separately
      };

      const newLogoIcon = bookingContext.PropertyDetails?.bookingEngineConfig?.logo ||
                          engineColor.logo || null;

      // Update state
      setColors(newColors);
      setLogoIcon(newLogoIcon);

      // Save to localStorage
      const storageData: BookingStorage = {
        colors: newColors,
        logoIcon: newLogoIcon,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }, [bookingContext]);

  // Load from localStorage on mount (priority: bookingContext > localStorage > default)
  useEffect(() => {
    // Don't override if we already have bookingContext data
    if (bookingContext?.bookingEngineColor) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: BookingStorage = JSON.parse(stored);
        
        // Validate stored data structure
        if (parsed.colors && typeof parsed.logoIcon === 'string' || parsed.logoIcon === null) {
          setColors({
            ...DEFAULT_COLORS,
            ...parsed.colors,
          });
          setLogoIcon(parsed.logoIcon);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }

    // Fallback to defaults (already set in initial state)
  }, []); // Empty dependency array - only runs on mount

  return {
    colors,
    logoIcon,
  };
};