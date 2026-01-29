// hooks/useInventoryState.ts

import { useState, useRef } from "react";
import type { InventoryDay } from "../types/inventory";

interface LOSEdit {
  roomType: string;
  ratePlan: string | null;
  dayIndex: number;
  type: "min" | "max";
  value: string;
}

interface AvailabilityEdit {
  roomType: string;
  dayIndex: number;
  value: string;
}

interface PriceEdit {
  roomType: string;
  ratePlan: string;
  dayIndex: number;
  value: string;
  numberOfGuests?: number;
  ageQualifyingCode?: string;
}

interface CustomTier {
  baseGuests: number[];
  additionalCharges: Array<{ ageCode: string; id: string }>;
}

export const useInventoryState = (_days: InventoryDay[]) => {
  // Scroll management
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  // UI toggles
  const [showRatePlans, setShowRatePlans] = useState(true);
  const [showRestrictions, setShowRestrictions] = useState(false);
  const [expandedOccupancy, setExpandedOccupancy] = useState<Set<string>>(new Set());

  // Rate plan toggles
  const [toggledRatePlans, setToggledRatePlans] = useState<Set<string>>(new Set());

  // Edits
  const [priceEdits, setPriceEdits] = useState<Map<string, PriceEdit>>(new Map());
  const [losEdits, setLosEdits] = useState<Map<string, LOSEdit>>(new Map());
  const [availabilityEdits, setAvailabilityEdits] = useState<Map<string, AvailabilityEdit>>(new Map());
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());

  // Custom tiers
  const [customTiers, setCustomTiers] = useState<Map<string, CustomTier>>(new Map());

  // Optimistic restrictions
  const [optimisticRestrictions, setOptimisticRestrictions] = useState<Map<string, boolean>>(new Map());

  // Unsaved changes dialog
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Initialize toggle state from days data
  // useEffect(() => {
  //   const initialToggles = initializeToggleState(days);
  //   setToggledRatePlans(initialToggles);
  // }, [days]);

  // Scroll handlers
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  return {
    // Refs
    scrollContainerRef,
    
    // State
    scrollLeft,
    showRatePlans,
    showRestrictions,
    expandedOccupancy,
    toggledRatePlans,
    priceEdits,
    losEdits,
    availabilityEdits,
    pendingChanges,
    customTiers,
    optimisticRestrictions,
    showUnsavedDialog,
    pendingAction,

    // Setters
    setShowRatePlans,
    setShowRestrictions,
    setExpandedOccupancy,
    setToggledRatePlans,
    setPriceEdits,
    setLosEdits,
    setAvailabilityEdits,
    setPendingChanges,
    setCustomTiers,
    setOptimisticRestrictions,
    setShowUnsavedDialog,
    setPendingAction,

    // Handlers
    scroll,
    handleScroll,
  };
};