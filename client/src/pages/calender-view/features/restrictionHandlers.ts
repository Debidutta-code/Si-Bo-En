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