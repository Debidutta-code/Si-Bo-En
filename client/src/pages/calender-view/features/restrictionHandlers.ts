// // features/restrictionHandlers.ts

// import { InventoryDay } from "../types/inventory";
// import { formatDateForAPI, getRatePlans, generateKey } from "../utils/inventoryUtils";
// import {
//   removeCTAorCTDRestriction,
//   updateCTAorCTDRestriction,
// } from "../api/api";
// // Import from the correct location based on your project structure
// import { updateRatePlanSellStatus } from "../../rate-plan/map-rate-plan/API";
// import toast from "react-hot-toast";

// /**
//  * Handle rate plan toggle (open/close)
//  */
// export const handleRatePlanToggle = async (
//   ratePlanCode: string,
//   dayIndex: number,
//   roomTypeCode: string,
//   currentStatus: boolean,
//   days: InventoryDay[],
//   hotelCode: string,
//   accessToken: string,
//   toggledRatePlans: Set<string>,
//   setToggledRatePlans: (toggled: Set<string>) => void,
//   onDataUpdate?: () => void
// ) => {
//   const uniqueKey = generateKey.ratePlan(ratePlanCode, dayIndex, roomTypeCode);
//   const day = days[dayIndex];

//   if (!day) {
//     toast.error("Invalid date selection");
//     return;
//   }

//   // Optimistic update
//   const newToggled = new Set(toggledRatePlans);
//   if (currentStatus) {
//     newToggled.delete(uniqueKey);
//   } else {
//     newToggled.add(uniqueKey);
//   }
//   setToggledRatePlans(newToggled);

//   const formattedDate = formatDateForAPI(day);
//   const newStatus: "open" | "close" = currentStatus ? "close" : "open";

//   const payload = {
//     hotelCode: hotelCode,
//     ratePlanCode: ratePlanCode,
//     invTypeCode: [roomTypeCode],
//     dateStatusList: [
//       {
//         date: formattedDate,
//         status: newStatus,
//       },
//     ],
//   };

//   try {
//     await updateRatePlanSellStatus(payload, accessToken);
//     toast.success(
//       `Rate plan ${newStatus === "open" ? "opened" : "closed"} successfully`
//     );

//     if (onDataUpdate) {
//       onDataUpdate();
//     }
//   } catch (error: any) {
//     console.error("Failed to update rate plan status:", error);
//     toast.error(error.message || "Failed to update rate plan status");

//     // Revert on error
//     const revertToggled = new Set(toggledRatePlans);
//     if (!currentStatus) {
//       revertToggled.delete(uniqueKey);
//     } else {
//       revertToggled.add(uniqueKey);
//     }
//     setToggledRatePlans(revertToggled);
//   }
// };

// /**
//  * Handle CTA/CTD restriction toggle
//  */
// export const handleRestrictionToggle = async (
//   roomTypeCode: string,
//   dayIndex: number,
//   restrictionType: "CTA" | "CTD",
//   currentValue: boolean,
//   days: InventoryDay[],
//   hotelCode: string,
//   optimisticRestrictions: Map<string, boolean>,
//   setOptimisticRestrictions: (restrictions: Map<string, boolean>) => void,
//   ratePlanCode?: string,
//   onDataUpdate?: () => void
// ) => {
//   const uniqueKey = generateKey.restriction(
//     restrictionType,
//     dayIndex,
//     roomTypeCode,
//     ratePlanCode
//   );

//   const day = days[dayIndex];
//   if (!day) {
//     toast.error("Invalid date selection");
//     return;
//   }

//   // Optimistic update
//   const newRestrictions = new Map(optimisticRestrictions);
//   newRestrictions.set(uniqueKey, !currentValue);
//   setOptimisticRestrictions(newRestrictions);

//   const formattedDate = formatDateForAPI(day);

//   try {
//     if (currentValue) {
//       // Remove restriction
//       const removePayload: any = {
//         propertyCode: hotelCode,
//         restrictionType: restrictionType,
//         date: formattedDate,
//         roomTypeCode: roomTypeCode,
//         isActive: false,
//         notes: "",
//       };

//       if (ratePlanCode) {
//         removePayload.ratePlanCode = ratePlanCode;
//       }

//       await removeCTAorCTDRestriction(removePayload, accessToken);
//       toast.success(`${restrictionType} removed successfully`);
//     } else {
//       // Add restriction
//       let ratePlanCodes: string[] = [];
//       if (ratePlanCode) {
//         ratePlanCodes = [ratePlanCode];
//       } else {
//         ratePlanCodes = getRatePlans(days);
//       }

//       const payload = {
//         propertyCode: hotelCode,
//         restrictionType: restrictionType,
//         dates: [formattedDate],
//         notes: "",
//         isActive: true,
//         roomRestrictions: [
//           {
//             roomTypeCode: roomTypeCode,
//             ratePlanCodes: ratePlanCodes,
//           },
//         ],
//         globalRatePlans: [],
//       };

//       await updateCTAorCTDRestriction(payload, accessToken);
//       toast.success(`${restrictionType} enabled successfully`);
//     }

//     if (onDataUpdate) {
//       onDataUpdate();
//     }
//   } catch (error: any) {
//     console.error(`Failed to update ${restrictionType}:`, error);
//     toast.error(error.message || `Failed to update ${restrictionType}`);

//     // Revert on error
//     const revertRestrictions = new Map(optimisticRestrictions);
//     revertRestrictions.set(uniqueKey, currentValue);
//     setOptimisticRestrictions(revertRestrictions);
//   }
// };

// /**
//  * Initialize toggle state from days data
//  */
// export const initializeToggleState = (days: InventoryDay[]): Set<string> => {
//   const initialToggles = new Set<string>();

//   days.forEach((day, dayIndex) => {
//     if (day.ratePlans && Array.isArray(day.ratePlans)) {
//       day.ratePlans.forEach((ratePlan) => {
//         if (ratePlan.prices && Array.isArray(ratePlan.prices)) {
//           ratePlan.prices.forEach((price) => {
//             if (price.sellStatus === "open") {
//               const uniqueKey = generateKey.ratePlan(
//                 ratePlan.ratePlanCode,
//                 dayIndex,
//                 price.invTypeCode
//               );
//               initialToggles.add(uniqueKey);
//             }
//           });
//         }
//       });
//     }
//   });

//   return initialToggles;
// };
// features/restrictionHandlers.ts

import toast from "react-hot-toast";
import type { InventoryDay } from "../types/inventory";
import { generateKey } from "../utils/inventoryUtils";
import { applyRestrictionService } from "@/pages/cta-ctd/services";

/**
 * Get all rate plans for a specific room type across all days
 */
const getRatePlansForRoomType = (
  roomType: string,
  days: InventoryDay[]
): string[] => {
  const ratePlanSet = new Set<string>();
  
  days.forEach(day => {
    day.ratePlans?.forEach(rp => {
      const hasRoomType = rp.prices?.some(p => p.invTypeCode === roomType);
      if (hasRoomType) {
        ratePlanSet.add(rp.ratePlanCode);
      }
    });
  });
  
  return Array.from(ratePlanSet);
};

/**
 * Format date from InventoryDay to YYYY-MM-DD format
 */
const formatDateForAPI = (day: InventoryDay): string => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthNumber = monthNames.indexOf(day.month) + 1;
  return `${day.year}-${String(monthNumber).padStart(2, "0")}-${String(day.date).padStart(2, "0")}`;
};

/**
 * Handle ROOM LEVEL restriction toggle (CTA/CTD)
 * This applies to ALL rate plans for the room type
 */
export const handleRoomRestrictionToggle = async (
  roomType: string,
  dayIndex: number,
  restrictionType: "CTA" | "CTD",
  currentValue: boolean,
  days: InventoryDay[],
  hotelCode: string,
  optimisticRestrictions: Map<string, boolean>,
  setOptimisticRestrictions: (restrictions: Map<string, boolean>) => void,
  onDataUpdate?: () => void
) => {
  const uniqueKey = generateKey.restriction(
    restrictionType,
    dayIndex,
    roomType
  );

  const day = days[dayIndex];
  if (!day) {
    toast.error("Invalid date selection");
    return;
  }

  // Optimistic update
  const newRestrictions = new Map(optimisticRestrictions);
  newRestrictions.set(uniqueKey, !currentValue);
  setOptimisticRestrictions(newRestrictions);

  const formattedDate = formatDateForAPI(day);
  
  // Get ALL rate plans for this room type
  const ratePlansForRoom = getRatePlansForRoomType(roomType, days);

  try {
    const payload = {
      propertyCode: hotelCode,
      restrictionType: restrictionType,
      dates: [formattedDate], // Single date
      notes: "",
      isActive: !currentValue, // Toggle the current value
      roomRestrictions: [
        {
          roomTypeCode: roomType,
          ratePlanCodes: ratePlansForRoom, // ALL rate plans for this room
        },
      ],
      globalRatePlans: [],
    };

    const result = await applyRestrictionService(payload);

    if (!result.success) {
      throw new Error(result.message || `Failed to update ${restrictionType}`);
    }

    toast.success(
      `${restrictionType} ${!currentValue ? 'enabled' : 'disabled'} for ${roomType}`
    );

    if (onDataUpdate) {
      onDataUpdate();
    }
  } catch (error: any) {
    console.error(`Failed to update ${restrictionType}:`, error);
    toast.error(error.message || `Failed to update ${restrictionType}`);

    // Revert on error
    const revertRestrictions = new Map(optimisticRestrictions);
    revertRestrictions.set(uniqueKey, currentValue);
    setOptimisticRestrictions(revertRestrictions);
  }
};

/**
 * Handle RATE PLAN LEVEL restriction toggle (CTA/CTD)
 * This applies to a specific rate plan for a specific room type
 */
export const handleRatePlanRestrictionToggle = async (
  roomType: string,
  ratePlanCode: string,
  dayIndex: number,
  restrictionType: "CTA" | "CTD",
  currentValue: boolean,
  days: InventoryDay[],
  hotelCode: string,
  optimisticRestrictions: Map<string, boolean>,
  setOptimisticRestrictions: (restrictions: Map<string, boolean>) => void,
  onDataUpdate?: () => void
) => {
  const uniqueKey = generateKey.restriction(
    restrictionType,
    dayIndex,
    roomType,
    ratePlanCode
  );

  const day = days[dayIndex];
  if (!day) {
    toast.error("Invalid date selection");
    return;
  }

  // Optimistic update
  const newRestrictions = new Map(optimisticRestrictions);
  newRestrictions.set(uniqueKey, !currentValue);
  setOptimisticRestrictions(newRestrictions);

  const formattedDate = formatDateForAPI(day);

  try {
    const payload = {
      propertyCode: hotelCode,
      restrictionType: restrictionType,
      dates: [formattedDate], // Single date
      notes: "",
      isActive: !currentValue, // Toggle the current value
      roomRestrictions: [
        {
          roomTypeCode: roomType,
          ratePlanCodes: [ratePlanCode], // Specific rate plan only
        },
      ],
      globalRatePlans: [],
    };

    const result = await applyRestrictionService(payload);

    if (!result.success) {
      throw new Error(result.message || `Failed to update ${restrictionType}`);
    }

    toast.success(
      `${restrictionType} ${!currentValue ? 'enabled' : 'disabled'} for ${ratePlanCode}`
    );

    if (onDataUpdate) {
      onDataUpdate();
    }
  } catch (error: any) {
    console.error(`Failed to update ${restrictionType}:`, error);
    toast.error(error.message || `Failed to update ${restrictionType}`);

    // Revert on error
    const revertRestrictions = new Map(optimisticRestrictions);
    revertRestrictions.set(uniqueKey, currentValue);
    setOptimisticRestrictions(revertRestrictions);
  }
};

/**
 * Handle BULK ROOM LEVEL restriction toggle (CTA/CTD)
 * This applies to ALL dates and ALL rate plans for the room type
 */
export const handleBulkRoomRestrictionToggle = async (
  roomType: string,
  restrictionType: "CTA" | "CTD",
  checked: boolean,
  days: InventoryDay[],
  hotelCode: string,
  optimisticRestrictions: Map<string, boolean>,
  setOptimisticRestrictions: (restrictions: Map<string, boolean>) => void,
  onDataUpdate?: () => void
) => {
  const datesToChange: string[] = [];

  // Get ALL rate plans for this room type
  const ratePlansForRoom = getRatePlansForRoomType(roomType, days);

  // Collect dates where the restriction needs to change
  days.forEach((day, idx) => {
    const uniqueKey = generateKey.restriction(
      restrictionType,
      idx,
      roomType
    );
    const currentValue = day.restrictions?.[restrictionType] || false;
    const effectiveValue = optimisticRestrictions.has(uniqueKey)
      ? optimisticRestrictions.get(uniqueKey)!
      : currentValue;

    if (effectiveValue !== checked) {
      const formattedDate = formatDateForAPI(day);
      datesToChange.push(formattedDate);

      // Optimistic update
      const newRestrictions = new Map(optimisticRestrictions);
      newRestrictions.set(uniqueKey, checked);
      setOptimisticRestrictions(newRestrictions);
    }
  });

  if (datesToChange.length === 0) {
    toast("All dates are already in the desired state");
    return;
  }

  try {
    const payload = {
      propertyCode: hotelCode,
      restrictionType: restrictionType,
      dates: datesToChange, // Multiple dates
      notes: "",
      isActive: checked,
      roomRestrictions: [
        {
          roomTypeCode: roomType,
          ratePlanCodes: ratePlansForRoom, // ALL rate plans for this room
        },
      ],
      globalRatePlans: [],
    };

    const result = await applyRestrictionService(payload);

    if (!result.success) {
      throw new Error(result.message || `Failed to update ${restrictionType}`);
    }

    toast.success(
      `${restrictionType} ${checked ? 'enabled' : 'disabled'} for ${datesToChange.length} dates`
    );

    if (onDataUpdate) {
      onDataUpdate();
    }
  } catch (error: any) {
    console.error("Failed to update bulk restriction:", error);
    toast.error(error.message || "Failed to update restriction");

    // Revert optimistic updates on error
    days.forEach((day, idx) => {
      const uniqueKey = generateKey.restriction(
        restrictionType,
        idx,
        roomType
      );
      const currentValue = day.restrictions?.[restrictionType] || false;
      const newRestrictions = new Map(optimisticRestrictions);
      newRestrictions.set(uniqueKey, currentValue);
      setOptimisticRestrictions(newRestrictions);
    });
  }
};

/**
 * Handle BULK RATE PLAN LEVEL restriction toggle (CTA/CTD)
 * This applies to ALL dates for a specific rate plan
 */
export const handleBulkRatePlanRestrictionToggle = async (
  roomType: string,
  ratePlanCode: string,
  restrictionType: "CTA" | "CTD",
  checked: boolean,
  days: InventoryDay[],
  hotelCode: string,
  optimisticRestrictions: Map<string, boolean>,
  setOptimisticRestrictions: (restrictions: Map<string, boolean>) => void,
  onDataUpdate?: () => void
) => {
  const datesToChange: string[] = [];

  // Collect dates where the restriction needs to change
  days.forEach((day, idx) => {
    const uniqueKey = generateKey.restriction(
      restrictionType,
      idx,
      roomType,
      ratePlanCode
    );
    const ratePlan = day.ratePlans?.find(
      (rp) => rp.ratePlanCode === ratePlanCode
    );
    const currentValue = ratePlan?.[restrictionType.toLowerCase() as 'cta' | 'ctd'] || false;
    const effectiveValue = optimisticRestrictions.has(uniqueKey)
      ? optimisticRestrictions.get(uniqueKey)!
      : currentValue;

    if (effectiveValue !== checked) {
      const formattedDate = formatDateForAPI(day);
      datesToChange.push(formattedDate);

      // Optimistic update
      const newRestrictions = new Map(optimisticRestrictions);
      newRestrictions.set(uniqueKey, checked);
      setOptimisticRestrictions(newRestrictions);
    }
  });

  if (datesToChange.length === 0) {
    toast("All dates are already in the desired state");
    return;
  }

  try {
    const payload = {
      propertyCode: hotelCode,
      restrictionType: restrictionType,
      dates: datesToChange, // Multiple dates
      notes: "",
      isActive: checked,
      roomRestrictions: [
        {
          roomTypeCode: roomType,
          ratePlanCodes: [ratePlanCode], // Specific rate plan only
        },
      ],
      globalRatePlans: [],
    };

    const result = await applyRestrictionService(payload);

    if (!result.success) {
      throw new Error(result.message || `Failed to update ${restrictionType}`);
    }

    toast.success(
      `${restrictionType} ${checked ? 'enabled' : 'disabled'} for ${datesToChange.length} dates`
    );

    if (onDataUpdate) {
      onDataUpdate();
    }
  } catch (error: any) {
    console.error("Failed to update bulk restriction:", error);
    toast.error(error.message || "Failed to update restriction");

    // Revert optimistic updates on error
    days.forEach((day, idx) => {
      const uniqueKey = generateKey.restriction(
        restrictionType,
        idx,
        roomType,
        ratePlanCode
      );
      const ratePlan = day.ratePlans?.find(
        (rp) => rp.ratePlanCode === ratePlanCode
      );
      const currentValue = ratePlan?.[restrictionType.toLowerCase() as 'cta' | 'ctd'] || false;
      const newRestrictions = new Map(optimisticRestrictions);
      newRestrictions.set(uniqueKey, currentValue);
      setOptimisticRestrictions(newRestrictions);
    });
  }
};