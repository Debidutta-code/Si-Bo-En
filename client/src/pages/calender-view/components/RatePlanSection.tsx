// components/RatePlanSection.tsx

import React from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Save,
  X,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { PriceInput } from "./PriceInput";
import { AdditionalChargeInput } from "./AdditionalChargeInput";
import { getRatePlanDetails, generateKey, AGE_LABELS } from "../features";
import {
  handlePriceInputChange,
  handleAdditionalChargeChange,
  applyPriceToRow,
  applyAdditionalChargeToRow,
  // savePriceChanges,
} from "../features";
import {
  toggleOccupancyExpansion,
  addGuestTier,
  removeGuestTier,
  addAdditionalCharge,
  removeAdditionalCharge,
} from "../features";
import {
  handleLOSInputChange,
  applyLOSToRow,
  saveLOSChanges,
} from "../features";
import type { InventoryDay } from "../types/inventory";
import { Switch } from "@/components/ui/switch";
// import {updateRatePlanSellStatus} from "../../rate-plan/map-rate-plan/API/index";
interface RatePlanSectionProps {
  roomType: string;
  ratePlanType: string;
  days: InventoryDay[];
  state: any;
  hotelCode: string;
  onDataUpdate?: () => void;
  renderMode: "labels" | "data";
}

export const RatePlanSection: React.FC<RatePlanSectionProps> = ({
  roomType,
  ratePlanType,
  days,
  state,
  hotelCode,
  onDataUpdate,
  renderMode,
}) => {
  const day = days[0];
  const ratePlanDetails = getRatePlanDetails(day, roomType, ratePlanType);
  const hasOccupancy =
    (ratePlanDetails?.ratePlan?.prices?.[0]?.baseByGuestAmts?.length ?? 0) > 0;
  const isExpanded = state.expandedOccupancy.has(`${roomType}-${ratePlanType}`);

  // Get custom tiers
  const customKey = generateKey.customTier(roomType, ratePlanType);
  const customData = state.customTiers.get(customKey) || {
    baseGuests: [],
    additionalCharges: [],
  };

  // Merge existing and custom base guests
  const existingTiers =
    ratePlanDetails?.ratePlan?.prices?.[0]?.baseByGuestAmts || [];
  const allBaseGuests = [...existingTiers];
  customData.baseGuests.forEach((numGuests: number) => {
    if (!allBaseGuests.find((g: any) => g.numberOfGuests === numGuests)) {
      allBaseGuests.push({ numberOfGuests: numGuests, amountBeforeTax: 0 });
    }
  });
  allBaseGuests.sort((a: any, b: any) => a.numberOfGuests - b.numberOfGuests);

  // Merge existing and custom additional charges
  const existingCharges =
    ratePlanDetails?.ratePlan?.prices?.[0]?.additionalGuestAmounts || [];
  const existingAsInstances = existingCharges.map(
    (charge: any, idx: number) => ({
      ageCode: charge.ageQualifyingCode,
      id: `existing-${charge.ageQualifyingCode}-${idx}`,
      isExisting: true,
    })
  );
  const customChargesWithFlag = customData.additionalCharges.map(
    (charge: any) => ({
      ...charge,
      isExisting: false,
    })
  );
  const allCharges = [...existingAsInstances, ...customChargesWithFlag];

  if (renderMode === "labels") {
    return (
      <>
        {/* Rate Plan Header */}
<div className={`${isExpanded ? 'h-14' : 'h-20'} flex border-b border-gray-300`}>
          <div className="w-40 flex flex-col items-start justify-center px-2 border-r border-gray-300 bg-gray-50 gap-1">
            <span
              className="font-semibold text-gray-700 text-xs truncate w-full"
              title={ratePlanType}
            >
              {ratePlanType}
            </span>
            {hasOccupancy && (
              <button
                onClick={() =>
                  toggleOccupancyExpansion(
                    roomType,
                    ratePlanType,
                    state.expandedOccupancy,
                    state.setExpandedOccupancy
                  )
                }
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
              >
                <Users className="w-3 h-3" />
                <span className="font-medium">Occupancy Based</span>
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          {/* Bulk Price Input */}
        {/* Bulk Open/Close Toggle and Price Input */}
         <div className="w-40 flex items-center justify-center px-2 bg-blue-100">
            {!isExpanded ? (
              // When collapsed: show both toggle and price input
              <div className="flex flex-col items-center justify-center gap-1.5">
                <Switch
                  checked={(() => {
                    // If ANY date is closed, show as closed (red)
                    return days.every((_day, idx) => {
                      const uniqueKey = generateKey.ratePlan(ratePlanType, idx, roomType);
                      return state.toggledRatePlans.has(uniqueKey);
                    });
                  })()}
                  // onCheckedChange={async (checked:any) => {
                  //   const monthNames = [
                  //     "January", "February", "March", "April", "May", "June",
                  //     "July", "August", "September", "October", "November", "December",
                  //   ];

                  //   // Collect dates that need to change
                  //   const dateStatusList: { date: string; status: 'open' | 'close' }[] = [];
                    
                  //   days.forEach((day, idx) => {
                  //     const uniqueKey = generateKey.ratePlan(ratePlanType, idx, roomType);
                  //     const isCurrentlyOpen = state.toggledRatePlans.has(uniqueKey);
                      
                  //     // Only add dates that need to change
                  //     if (isCurrentlyOpen !== checked) {
                  //       const monthNumber = monthNames.indexOf(day.month) + 1;
                  //       const formattedDate = `${day.year}-${String(monthNumber).padStart(2, "0")}-${String(day.date).padStart(2, "0")}`;
                  //       dateStatusList.push({
                  //         date: formattedDate,
                  //         status: checked ? 'open' : 'close'
                  //       });
                  //     }
                  //   });

                  //   if (dateStatusList.length === 0) {
                  //     toast("All dates are already in the desired state");
                  //     return;
                  //   }

                  //   // Optimistically update UI
                  //   const newToggles = new Set(state.toggledRatePlans);
                  //   days.forEach((day, idx) => {
                  //     const uniqueKey = generateKey.ratePlan(ratePlanType, idx, roomType);
                  //     if (checked) {
                  //       newToggles.add(uniqueKey);
                  //     } else {
                  //       newToggles.delete(uniqueKey);
                  //     }
                  //   });
                  //   state.setToggledRatePlans(newToggles);

                  //   try {
                  //     const payload = {
                  //       hotelCode: hotelCode,
                  //       ratePlanCode: ratePlanType,
                  //       invTypeCode: [roomType],
                  //       dateStatusList: dateStatusList
                  //     };

                  //     await updateRatePlanSellStatus(payload);
                      
                  //     toast.success(
                  //       `Rate plan ${checked ? 'opened' : 'closed'} for ${dateStatusList.length} dates`
                  //     );

                  //     if (onDataUpdate) {
                  //       onDataUpdate();
                  //     }
                  //   } catch (error: any) {
                  //     console.error("Failed to update bulk rate plan status:", error);
                  //     toast.error(error.message || "Failed to update rate plan status");

                  //     // Revert optimistic updates on error
                  //     const revertedToggles = new Set(state.toggledRatePlans);
                  //     days.forEach((day, idx) => {
                  //       const uniqueKey = generateKey.ratePlan(ratePlanType, idx, roomType);
                  //       const ratePlanDetails = getRatePlanDetails(day, roomType, ratePlanType);
                        
                  //       if (ratePlanDetails) {
                  //         revertedToggles.add(uniqueKey);
                  //       } else {
                  //         revertedToggles.delete(uniqueKey);
                  //       }
                  //     });
                  //     state.setToggledRatePlans(revertedToggles);
                  //   }
                  // }}
                  className={`${(() => {
                    const allOpen = days.every((_day, idx) => {
                      const uniqueKey = generateKey.ratePlan(ratePlanType, idx, roomType);
                      return state.toggledRatePlans.has(uniqueKey);
                    });
                    return allOpen
                      ? "data-[state=checked]:bg-green-500"
                      : "data-[state=unchecked]:bg-red-500";
                  })()} scale-75`}
                />
                
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Bulk"
                  className="w-24 h-7 text-center text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onChange={(e) => {
                    if (e.target.value) {
                      const newEdits = new Map(state.priceEdits);
                      const newPending = new Set(state.pendingChanges);
                      days.forEach((_, idx) => {
                        const dayRatePlan = getRatePlanDetails(
                          days[idx],
                          roomType,
                          ratePlanType
                        );
                        const hasOccupancy =
                          (dayRatePlan?.ratePlan?.prices?.[0]?.baseByGuestAmts
                            ?.length ?? 0) > 0;

                        let key;
                        if (hasOccupancy) {
                          key = generateKey.price(roomType, ratePlanType, idx, 1);
                          newEdits.set(key, {
                            roomType,
                            ratePlan: ratePlanType,
                            dayIndex: idx,
                            value: e.target.value,
                            numberOfGuests: 1,
                          });
                        } else {
                          key = generateKey.price(roomType, ratePlanType, idx);
                          newEdits.set(key, {
                            roomType,
                            ratePlan: ratePlanType,
                            dayIndex: idx,
                            value: e.target.value,
                          });
                        }
                        newPending.add(key);
                      });
                      state.setPriceEdits(newEdits);
                      state.setPendingChanges(newPending);
                      toast.success("Bulk price applied to all dates");
                    }
                  }}
                />
              </div>
            ) : (
              // When expanded: show only toggle
              <Switch
                checked={(() => {
                  return days.every((_day, idx) => {
                    const uniqueKey = generateKey.ratePlan(ratePlanType, idx, roomType);
                    return state.toggledRatePlans.has(uniqueKey);
                  });
                })()}
                // onCheckedChange={async (checked:any) => {
                //   const monthNames = [
                //     "January", "February", "March", "April", "May", "June",
                //     "July", "August", "September", "October", "November", "December",
                //   ];

                //   const dateStatusList: { date: string; status: 'open' | 'close' }[] = [];
                  
                //   days.forEach((day, idx) => {
                //     const uniqueKey = generateKey.ratePlan(ratePlanType, idx, roomType);
                //     const isCurrentlyOpen = state.toggledRatePlans.has(uniqueKey);
                    
                //     if (isCurrentlyOpen !== checked) {
                //       const monthNumber = monthNames.indexOf(day.month) + 1;
                //       const formattedDate = `${day.year}-${String(monthNumber).padStart(2, "0")}-${String(day.date).padStart(2, "0")}`;
                //       dateStatusList.push({
                //         date: formattedDate,
                //         status: checked ? 'open' : 'close'
                //       });
                //     }
                //   });

                //   if (dateStatusList.length === 0) {
                //     toast("All dates are already in the desired state");
                //     return;
                //   }

                //   const newToggles = new Set(state.toggledRatePlans);
                //   days.forEach((day, idx) => {
                //     const uniqueKey = generateKey.ratePlan(ratePlanType, idx, roomType);
                //     if (checked) {
                //       newToggles.add(uniqueKey);
                //     } else {
                //       newToggles.delete(uniqueKey);
                //     }
                //   });
                //   state.setToggledRatePlans(newToggles);

                //   try {
                //     const payload = {
                //       hotelCode: hotelCode,
                //       ratePlanCode: ratePlanType,
                //       invTypeCode: [roomType],
                //       dateStatusList: dateStatusList
                //     };

                //     await updateRatePlanSellStatus(payload, accessToken);
                    
                //     toast.success(
                //       `Rate plan ${checked ? 'opened' : 'closed'} for ${dateStatusList.length} dates`
                //     );

                //     if (onDataUpdate) {
                //       onDataUpdate();
                //     }
                //   } catch (error: any) {
                //     console.error("Failed to update bulk rate plan status:", error);
                //     toast.error(error.message || "Failed to update rate plan status");

                //     const revertedToggles = new Set(state.toggledRatePlans);
                //     days.forEach((day, idx) => {
                //       const uniqueKey = generateKey.ratePlan(ratePlanType, idx, roomType);
                //       const ratePlanDetails = getRatePlanDetails(day, roomType, ratePlanType);
                      
                //       if (ratePlanDetails) {
                //         revertedToggles.add(uniqueKey);
                //       } else {
                //         revertedToggles.delete(uniqueKey);
                //       }
                //     });
                //     state.setToggledRatePlans(revertedToggles);
                //   }
                // }}
                className={`${(() => {
                  const allOpen = days.every((_day, idx) => {
                    const uniqueKey = generateKey.ratePlan(ratePlanType, idx, roomType);
                    return state.toggledRatePlans.has(uniqueKey);
                  });
                  return allOpen
                    ? "data-[state=checked]:bg-green-500"
                    : "data-[state=unchecked]:bg-red-500";
                })()} scale-75`}
              />
            )}
          </div>
        </div>

        {/* Expanded Occupancy Tiers - Labels */}
        {isExpanded && (
          <>
            {/* Base Guest Amount Rows */}
            {allBaseGuests.map((guestTier: any, tierIndex: number) => (
              <div
                key={`label-tier-${tierIndex}`}
                className="h-12 flex border-b border-gray-300"
              >
                <div className="w-40 flex items-center justify-between px-2 border-r border-gray-300 bg-purple-50">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-purple-700 text-xs">
                      {guestTier.numberOfGuests}{" "}
                      {guestTier.numberOfGuests === 1 ? "Guest" : "Guests"}
                    </span>
                    <span className="text-xs text-gray-600">
                      {ratePlanDetails?.currencyCode || "USD"}
                    </span>
                  </div>
                  {customData.baseGuests.includes(guestTier.numberOfGuests) && (
                    <button
                      onClick={() =>
                        removeGuestTier(
                          roomType,
                          ratePlanType,
                          guestTier.numberOfGuests,
                          state.customTiers,
                          state.setCustomTiers
                        )
                      }
                      className="text-red-500 hover:text-red-700"
                      title="Remove tier"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
               <div className="w-40 flex items-center justify-center px-2 bg-purple-50">
                  {tierIndex === 0 && isExpanded ? (
                    // Show bulk price input for 1 Guest when expanded
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Bulk"
                      className="w-20 h-7 text-center text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      onChange={(e) => {
                        if (e.target.value) {
                          const newEdits = new Map(state.priceEdits);
                          const newPending = new Set(state.pendingChanges);
                          days.forEach((_, idx) => {
                            const key = generateKey.price(
                              roomType,
                              ratePlanType,
                              idx,
                              guestTier.numberOfGuests
                            );
                            newEdits.set(key, {
                              roomType,
                              ratePlan: ratePlanType,
                              dayIndex: idx,
                              value: e.target.value,
                              numberOfGuests: guestTier.numberOfGuests,
                            });
                            newPending.add(key);
                          });
                          state.setPriceEdits(newEdits);
                          state.setPendingChanges(newPending);
                          toast.success("Bulk price applied to all dates");
                        }
                      }}
                    />
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Bulk"
                      className="w-20 h-7 text-center text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      onChange={(e) => {
                        if (e.target.value) {
                          const newEdits = new Map(state.priceEdits);
                          const newPending = new Set(state.pendingChanges);
                          days.forEach((_, idx) => {
                            const key = generateKey.price(
                              roomType,
                              ratePlanType,
                              idx,
                              guestTier.numberOfGuests
                            );
                            newEdits.set(key, {
                              roomType,
                              ratePlan: ratePlanType,
                              dayIndex: idx,
                              value: e.target.value,
                              numberOfGuests: guestTier.numberOfGuests,
                            });
                            newPending.add(key);
                          });
                          state.setPriceEdits(newEdits);
                          state.setPendingChanges(newPending);
                          toast.success(
                            `Bulk ${guestTier.numberOfGuests} Guest price applied`
                          );
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Add New Guest Tier Button */}
            <div className="h-10 flex items-center px-2 border-b border-gray-300 bg-purple-100">
              <button
                onClick={() => {
                  const maxGuests = Math.max(
                    ...allBaseGuests.map((g: any) => g.numberOfGuests),
                    0
                  );
                  addGuestTier(
                    roomType,
                    ratePlanType,
                    maxGuests + 1,
                    days,
                    state.customTiers,
                    state.priceEdits,
                    state.pendingChanges,
                    state.setCustomTiers,
                    state.setPriceEdits,
                    state.setPendingChanges
                  );
                }}
                className="text-xs text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1"
              >
                <span>+ Add Guest Tier</span>
              </button>
            </div>

            {/* Additional Charge Rows */}
            {allCharges.length > 0 &&
              allCharges.map((charge: any) => (
                <div
                  key={`label-age-${charge.id}`}
                  className="h-12 flex border-b border-gray-300"
                >
                  <div className="w-40 flex items-center justify-between px-2 border-r border-gray-300 bg-blue-50">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-blue-700 text-xs">
                        Extra {AGE_LABELS[charge.ageCode] || "Guest"}
                      </span>
                      <span className="text-xs text-gray-600">
                        {ratePlanDetails?.currencyCode || "USD"}
                      </span>
                    </div>
                    {!charge.isExisting && (
                      <button
                        onClick={() =>
                          removeAdditionalCharge(
                            roomType,
                            ratePlanType,
                            charge.id,
                            days,
                            state.customTiers,
                            state.priceEdits,
                            state.pendingChanges,
                            state.setCustomTiers,
                            state.setPriceEdits,
                            state.setPendingChanges
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                        title="Remove charge type"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="w-40 flex items-center justify-center px-2 bg-blue-50">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Bulk"
                      className="w-20 h-7 text-center text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      onChange={(e) => {
                        if (e.target.value) {
                          const newEdits = new Map(state.priceEdits);
                          const newPending = new Set(state.pendingChanges);
                          days.forEach((_, idx) => {
                            const key = generateKey.additionalCharge(
                              roomType,
                              ratePlanType,
                              idx,
                              charge.id
                            );
                            newEdits.set(key, {
                              roomType,
                              ratePlan: ratePlanType,
                              dayIndex: idx,
                              value: e.target.value,
                              ageQualifyingCode: charge.id,
                            });
                            newPending.add(key);
                          });
                          state.setPriceEdits(newEdits);
                          state.setPendingChanges(newPending);
                          toast.success(
                            `Bulk ${AGE_LABELS[charge.ageCode]} charge applied`
                          );
                        }
                      }}
                    />
                  </div>
                </div>
              ))}

            
            <div className="h-10 flex items-center px-2 border-b border-gray-300 bg-blue-100">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addAdditionalCharge(
                      roomType,
                      ratePlanType,
                      e.target.value,
                      days,
                      state.customTiers,
                      state.priceEdits,
                      state.pendingChanges,
                      state.setCustomTiers,
                      state.setPriceEdits,
                      state.setPendingChanges
                    );
                    e.target.value = "";
                  }
                }}
                className="text-xs text-blue-700 hover:text-blue-900 font-medium bg-transparent border-none cursor-pointer focus:outline-none w-full"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add Charge Type
                </option>
                {/* Only show Adult if not already added */}
                {!allCharges.some((c) => c.ageCode === "10") && (
                  <option value="10">Adult</option>
                )}
                {/* Only show Child if not already added */}
                {!allCharges.some((c) => c.ageCode === "8") && (
                  <option value="8">Child</option>
                )}
                {/* Only show Infant if not already added */}
                {!allCharges.some((c) => c.ageCode === "7") && (
                  <option value="7">Infant</option>
                )}
              </select>
            </div>
          </>
        )}

        {/* Restrictions Labels */}
        {/* Bulk Restrictions for Rate Plan */}
        {state.showRestrictions && (
          <>
            {/* Bulk CTA */}
            <div className="h-12 flex border-b border-gray-300">
              <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-purple-50">
                <span className="font-semibold text-purple-700 text-xs">
                  Plan CTA
                </span>
              </div>
              <div className="w-40 flex items-center justify-center px-2 bg-purple-50">
                <Switch
                  checked={(() => {
                    return days.every((day, idx) => {
                      const uniqueKey = generateKey.restriction(
                        "CTA",
                        idx,
                        roomType,
                        ratePlanType
                      );
                      const ratePlan = day.ratePlans?.find(
                        (rp) => rp.ratePlanCode === ratePlanType
                      );
                      const ctaValue = ratePlan?.cta || false;
                      return state.optimisticRestrictions.has(uniqueKey)
                        ? state.optimisticRestrictions.get(uniqueKey)!
                        : ctaValue;
                    });
                  })()}
                  // onCheckedChange={async (checked) => {
                  //   const datesToChange: string[] = [];
                  //   const monthNames = [
                  //     "January",
                  //     "February",
                  //     "March",
                  //     "April",
                  //     "May",
                  //     "June",
                  //     "July",
                  //     "August",
                  //     "September",
                  //     "October",
                  //     "November",
                  //     "December",
                  //   ];

                  //   days.forEach((day, idx) => {
                  //     const uniqueKey = generateKey.restriction(
                  //       "CTA",
                  //       idx,
                  //       roomType,
                  //       ratePlanType
                  //     );
                  //     const ratePlan = day.ratePlans?.find(
                  //       (rp) => rp.ratePlanCode === ratePlanType
                  //     );
                  //     const currentValue = ratePlan?.cta || false;
                  //     const effectiveValue = state.optimisticRestrictions.has(
                  //       uniqueKey
                  //     )
                  //       ? state.optimisticRestrictions.get(uniqueKey)!
                  //       : currentValue;

                  //     if (effectiveValue !== checked) {
                  //       const monthNumber = monthNames.indexOf(day.month) + 1;
                  //       const formattedDate = `${day.year}-${String(
                  //         monthNumber
                  //       ).padStart(2, "0")}-${String(day.date).padStart(
                  //         2,
                  //         "0"
                  //       )}`;
                  //       datesToChange.push(formattedDate);

                  //       const newRestrictions = new Map(
                  //         state.optimisticRestrictions
                  //       );
                  //       newRestrictions.set(uniqueKey, checked);
                  //       state.setOptimisticRestrictions(newRestrictions);
                  //     }
                  //   });

                  //   if (datesToChange.length === 0) {
                  //     toast("All dates are already in the desired state");
                  //     return;
                  //   }

                  //   try {
                  //     const {
                  //       updateCTAorCTDRestriction,
                  //       removeCTAorCTDRestriction,
                  //     } = await import("../api/api");

                  //     if (checked) {
                  //       const payload = {
                  //         propertyCode: hotelCode,
                  //         restrictionType: "CTA" as const,
                  //         dates: datesToChange,
                  //         notes: "",
                  //         isActive: true,
                  //         roomRestrictions: [
                  //           {
                  //             roomTypeCode: roomType,
                  //             ratePlanCodes: [ratePlanType],
                  //           },
                  //         ],
                  //         globalRatePlans: [],
                  //       };
                  //       await updateCTAorCTDRestriction(payload, accessToken);
                  //       toast.success(
                  //         `CTA enabled for ${datesToChange.length} dates`
                  //       );
                  //     } else {
                  //       const payload = {
                  //         propertyCode: hotelCode,
                  //         restrictionType: "CTA" as const,
                  //         dates: datesToChange,
                  //         notes: "",
                  //         isActive: false,
                  //         roomRestrictions: [
                  //           {
                  //             roomTypeCode: roomType,
                  //             ratePlanCodes: [ratePlanType],
                  //           },
                  //         ],
                  //         globalRatePlans: [],
                  //       };
                  //       await removeCTAorCTDRestriction(payload, accessToken);
                  //       toast.success(
                  //         `CTA disabled for ${datesToChange.length} dates`
                  //       );
                  //     }

                  //     if (onDataUpdate) {
                  //       onDataUpdate();
                  //     }
                  //   } catch (error: any) {
                  //     console.error("Failed to update bulk CTA:", error);
                  //     toast.error(error.message || "Failed to update CTA");

                  //     days.forEach((day, idx) => {
                  //       const uniqueKey = generateKey.restriction(
                  //         "CTA",
                  //         idx,
                  //         roomType,
                  //         ratePlanType
                  //       );
                  //       const ratePlan = day.ratePlans?.find(
                  //         (rp) => rp.ratePlanCode === ratePlanType
                  //       );
                  //       const currentValue = ratePlan?.cta || false;
                  //       const newRestrictions = new Map(
                  //         state.optimisticRestrictions
                  //       );
                  //       newRestrictions.set(uniqueKey, currentValue);
                  //       state.setOptimisticRestrictions(newRestrictions);
                  //     });
                  //   }
                  // }}
                  className={`${(() => {
                    const allEnabled = days.every((day, idx) => {
                      const uniqueKey = generateKey.restriction(
                        "CTA",
                        idx,
                        roomType,
                        ratePlanType
                      );
                      const ratePlan = day.ratePlans?.find(
                        (rp) => rp.ratePlanCode === ratePlanType
                      );
                      const ctaValue = ratePlan?.cta || false;
                      return state.optimisticRestrictions.has(uniqueKey)
                        ? state.optimisticRestrictions.get(uniqueKey)!
                        : ctaValue;
                    });
                    return allEnabled
                      ? "data-[state=checked]:bg-red-500"
                      : "data-[state=unchecked]:bg-gray-300";
                  })()} scale-75`}
                />
              </div>
            </div>

            {/* Bulk CTD */}
            <div className="h-12 flex border-b border-gray-300">
              <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-purple-50">
                <span className="font-semibold text-purple-700 text-xs">
                  Plan CTD
                </span>
              </div>
              <div className="w-40 flex items-center justify-center px-2 bg-purple-50">
                <Switch
                  checked={(() => {
                    return days.every((day, idx) => {
                      const uniqueKey = generateKey.restriction(
                        "CTD",
                        idx,
                        roomType,
                        ratePlanType
                      );
                      const ratePlan = day.ratePlans?.find(
                        (rp) => rp.ratePlanCode === ratePlanType
                      );
                      const ctdValue = ratePlan?.ctd || false;
                      return state.optimisticRestrictions.has(uniqueKey)
                        ? state.optimisticRestrictions.get(uniqueKey)!
                        : ctdValue;
                    });
                  })()}
                  // onCheckedChange={async (checked) => {
                  //   const datesToChange: string[] = [];
                  //   const monthNames = [
                  //     "January",
                  //     "February",
                  //     "March",
                  //     "April",
                  //     "May",
                  //     "June",
                  //     "July",
                  //     "August",
                  //     "September",
                  //     "October",
                  //     "November",
                  //     "December",
                  //   ];

                  //   days.forEach((day, idx) => {
                  //     const uniqueKey = generateKey.restriction(
                  //       "CTD",
                  //       idx,
                  //       roomType,
                  //       ratePlanType
                  //     );
                  //     const ratePlan = day.ratePlans?.find(
                  //       (rp) => rp.ratePlanCode === ratePlanType
                  //     );
                  //     const currentValue = ratePlan?.ctd || false;
                  //     const effectiveValue = state.optimisticRestrictions.has(
                  //       uniqueKey
                  //     )
                  //       ? state.optimisticRestrictions.get(uniqueKey)!
                  //       : currentValue;

                  //     if (effectiveValue !== checked) {
                  //       const monthNumber = monthNames.indexOf(day.month) + 1;
                  //       const formattedDate = `${day.year}-${String(
                  //         monthNumber
                  //       ).padStart(2, "0")}-${String(day.date).padStart(
                  //         2,
                  //         "0"
                  //       )}`;
                  //       datesToChange.push(formattedDate);

                  //       const newRestrictions = new Map(
                  //         state.optimisticRestrictions
                  //       );
                  //       newRestrictions.set(uniqueKey, checked);
                  //       state.setOptimisticRestrictions(newRestrictions);
                  //     }
                  //   });

                  //   if (datesToChange.length === 0) {
                  //     toast("All dates are already in the desired state");
                  //     return;
                  //   }

                  //   try {
                  //     const {
                  //       updateCTAorCTDRestriction,
                  //       removeCTAorCTDRestriction,
                  //     } = await import("../api/api");

                  //     if (checked) {
                  //       const payload = {
                  //         propertyCode: hotelCode,
                  //         restrictionType: "CTD" as const,
                  //         dates: datesToChange,
                  //         notes: "",
                  //         isActive: true,
                  //         roomRestrictions: [
                  //           {
                  //             roomTypeCode: roomType,
                  //             ratePlanCodes: [ratePlanType],
                  //           },
                  //         ],
                  //         globalRatePlans: [],
                  //       };
                  //       await updateCTAorCTDRestriction(payload, accessToken);
                  //       toast.success(
                  //         `CTD enabled for ${datesToChange.length} dates`
                  //       );
                  //     } else {
                  //       const payload = {
                  //         propertyCode: hotelCode,
                  //         restrictionType: "CTD" as const,
                  //         dates: datesToChange,
                  //         notes: "",
                  //         isActive: false,
                  //         roomRestrictions: [
                  //           {
                  //             roomTypeCode: roomType,
                  //             ratePlanCodes: [ratePlanType],
                  //           },
                  //         ],
                  //         globalRatePlans: [],
                  //       };
                  //       await removeCTAorCTDRestriction(payload, accessToken);
                  //       toast.success(
                  //         `CTD disabled for ${datesToChange.length} dates`
                  //       );
                  //     }

                  //     if (onDataUpdate) {
                  //       onDataUpdate();
                  //     }
                  //   } catch (error: any) {
                  //     console.error("Failed to update bulk CTD:", error);
                  //     toast.error(error.message || "Failed to update CTD");

                  //     days.forEach((day, idx) => {
                  //       const uniqueKey = generateKey.restriction(
                  //         "CTD",
                  //         idx,
                  //         roomType,
                  //         ratePlanType
                  //       );
                  //       const ratePlan = day.ratePlans?.find(
                  //         (rp) => rp.ratePlanCode === ratePlanType
                  //       );
                  //       const currentValue = ratePlan?.ctd || false;
                  //       const newRestrictions = new Map(
                  //         state.optimisticRestrictions
                  //       );
                  //       newRestrictions.set(uniqueKey, currentValue);
                  //       state.setOptimisticRestrictions(newRestrictions);
                  //     });
                  //   }
                  // }}
                  className={`${(() => {
                    const allEnabled = days.every((day, idx) => {
                      const uniqueKey = generateKey.restriction(
                        "CTD",
                        idx,
                        roomType,
                        ratePlanType
                      );
                      const ratePlan = day.ratePlans?.find(
                        (rp) => rp.ratePlanCode === ratePlanType
                      );
                      const ctdValue = ratePlan?.ctd || false;
                      return state.optimisticRestrictions.has(uniqueKey)
                        ? state.optimisticRestrictions.get(uniqueKey)!
                        : ctdValue;
                    });
                    return allEnabled
                      ? "data-[state=checked]:bg-red-500"
                      : "data-[state=unchecked]:bg-gray-300";
                  })()} scale-75`}
                />
              </div>
            </div>

            {/* Bulk Min LOS */}
            <div className="h-12 flex border-b border-gray-300">
              <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-purple-50">
                <span className="font-semibold text-purple-700 text-xs">
                  Plan Min LOS
                </span>
              </div>
              <div className="w-40 flex items-center justify-center px-2 bg-purple-50">
                <input
                  type="number"
                  min="0"
                  placeholder="Bulk"
                  className="w-20 h-7 text-center text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  onChange={(e) => {
                    if (e.target.value) {
                      const newEdits = new Map(state.losEdits);
                      const newPending = new Set(state.pendingChanges);
                      days.forEach((_, idx) => {
                        const key = generateKey.los(
                          roomType,
                          ratePlanType,
                          idx,
                          "min"
                        );
                        newEdits.set(key, {
                          roomType,
                          ratePlan: ratePlanType,
                          dayIndex: idx,
                          type: "min",
                          value: e.target.value,
                        });
                        newPending.add(key);
                      });
                      state.setLosEdits(newEdits);
                      state.setPendingChanges(newPending);
                      toast.success("Bulk Min LOS applied to all dates");
                    }
                  }}
                />
              </div>
            </div>

            {/* Bulk Max LOS */}
            <div className="h-12 flex border-b border-gray-300">
              <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-purple-50">
                <span className="font-semibold text-purple-700 text-xs">
                  Plan Max LOS
                </span>
              </div>
              <div className="w-40 flex items-center justify-center px-2 bg-purple-50">
                <input
                  type="number"
                  min="0"
                  placeholder="Bulk"
                  className="w-20 h-7 text-center text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  onChange={(e) => {
                    if (e.target.value) {
                      const newEdits = new Map(state.losEdits);
                      const newPending = new Set(state.pendingChanges);
                      days.forEach((_, idx) => {
                        const key = generateKey.los(
                          roomType,
                          ratePlanType,
                          idx,
                          "max"
                        );
                        newEdits.set(key, {
                          roomType,
                          ratePlan: ratePlanType,
                          dayIndex: idx,
                          type: "max",
                          value: e.target.value,
                        });
                        newPending.add(key);
                      });
                      state.setLosEdits(newEdits);
                      state.setPendingChanges(newPending);
                      toast.success("Bulk Max LOS applied to all dates");
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // DATA MODE
  return (
    <>
      {/* Rate Plan Price Row */}
<div className={`flex ${isExpanded ? 'h-14' : 'h-20'} border-b border-gray-300`}>
        {days.map((day, index) => {
          const ratePlanDetails = getRatePlanDetails(
            day,
            roomType,
            ratePlanType
          );
          const uniqueKey = generateKey.ratePlan(ratePlanType, index, roomType);
          const isToggled = state.toggledRatePlans.has(uniqueKey);
          // const hasOccupancyPricing =
          //   (ratePlanDetails?.ratePlan?.prices?.[0]?.baseByGuestAmts?.length ??
          //     0) > 0;

          return (
            <div
              key={index}
className={`${isExpanded ? 'h-14' : 'h-20'} w-32 flex-shrink-0 flex flex-col items-center justify-center py-1.5 border-r border-b border-gray-300 bg-white text-xs`}
            >
              {ratePlanDetails ? (
                <>
                  <div className="flex items-center justify-center mb-1">
                    <Switch
                      checked={isToggled}
                      // onCheckedChange={() =>
                      //   handleRatePlanToggle(
                      //     ratePlanType,
                      //     index,
                      //     roomType,
                      //     isToggled,
                      //     days,
                      //     hotelCode,
                      //     state.toggledRatePlans,
                      //     state.setToggledRatePlans,
                      //     onDataUpdate
                      //   )
                      // }
                      className={`${
                        isToggled
                          ? "data-[state=checked]:bg-green-500"
                          : "data-[state=unchecked]:bg-red-500"
                      } scale-50`}
                    />
                  </div>

                  {(() => {
                    // const priceKey = generateKey.price(
                    //   roomType,
                    //   ratePlanType,
                    //   index
                    // );
                    // const occupancyKey = generateKey.price(
                    //   roomType,
                    //   ratePlanType,
                    //   index,
                    //   1
                    // );
                    // const hasPriceEdit =
                    //   state.priceEdits.has(priceKey) ||
                    //   state.priceEdits.has(occupancyKey);
                    const baseByGuest =
                      ratePlanDetails?.ratePlan?.prices?.[0]?.baseByGuestAmts;
                    const hasBaseByGuest =
                      baseByGuest && baseByGuest.length > 0;

                    if (isExpanded) {
                      return (
                        <span
                          className={`text-xs font-medium ${
                            isToggled ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isToggled ? "Open" : "Closed"}
                        </span>
                      );
                    }

                    return (
                      <div className="text-center flex items-center gap-1 px-2">
                        <PriceInput
                          roomType={roomType}
                          ratePlan={ratePlanType}
                          dayIndex={index}
                          currentPrice={
                            hasBaseByGuest
                              ? baseByGuest[0].amountBeforeTax
                              : ratePlanDetails?.price ?? 0
                          }
                          currencyCode={ratePlanDetails?.currencyCode ?? "USD"}
                          numberOfGuests={
                            hasBaseByGuest
                              ? baseByGuest[0].numberOfGuests
                              : undefined
                          }
                          priceEdits={state.priceEdits}
                               commissionAmount={
        hasBaseByGuest
          ? baseByGuest[0].commissionAmount || 0
          : 0
      }
      totalAfterCommission={
        hasBaseByGuest
          ? baseByGuest[0].amountAfterCommission || 0
          : 0
      }
                          pendingChanges={state.pendingChanges}
                          generateKey={generateKey.price}
                          onPriceChange={(rt, rp, di, val, ng) =>
                            handlePriceInputChange(
                              rt,
                              rp,
                              di,
                              val,
                              ng,
                              state.priceEdits,
                              state.pendingChanges,
                              state.setPriceEdits,
                              state.setPendingChanges
                            )
                          }
                          onApplyToRow={(rt, rp, di, ng) =>
                            applyPriceToRow(
                              rt,
                              rp,
                              di,
                              ng,
                              days,
                              state.priceEdits,
                              state.pendingChanges,
                              state.setPriceEdits,
                              state.setPendingChanges
                            )
                          }
                        />
                      </div>
                    );
                  })()}
                </>
              ) : (
                <span className="text-gray-400 italic">Not available</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Expanded Occupancy Tiers - Data */}
      {isExpanded && (
        <>
          {/* Base Guest Amount Data Rows */}
          {allBaseGuests.map((guestTier: any, tierIndex: number) => (
            <div
              key={`tier-${tierIndex}`}
              className="flex h-12 border-b border-gray-300"
            >
              {days.map((day, dayIndex) => {
                const ratePlanDetails = getRatePlanDetails(
                  day,
                  roomType,
                  ratePlanType
                );
                const tierData =
                  ratePlanDetails?.ratePlan?.prices?.[0]?.baseByGuestAmts?.find(
                    (t: any) => t.numberOfGuests === guestTier.numberOfGuests
                  );

                return (
                  <div
                    key={dayIndex}
                    className="h-12 w-32 flex-shrink-0 flex items-center justify-center border-r border-b border-gray-300 bg-purple-50 px-2"
                  >
                    <PriceInput
                      roomType={roomType}
                      ratePlan={ratePlanType}
                      dayIndex={dayIndex}
                      currentPrice={tierData?.amountBeforeTax || 0}
                      currencyCode={ratePlanDetails?.currencyCode || "USD"}
                      numberOfGuests={guestTier.numberOfGuests}
                      showOnlyInput={true}
                      priceEdits={state.priceEdits}
                      commissionAmount={tierData?.commissionAmount || 0}
  totalAfterCommission={tierData?.amountAfterCommission || 0}
                      pendingChanges={state.pendingChanges}
                      generateKey={generateKey.price}
                      onPriceChange={(rt, rp, di, val, ng) =>
                        handlePriceInputChange(
                          rt,
                          rp,
                          di,
                          val,
                          ng,
                          state.priceEdits,
                          state.pendingChanges,
                          state.setPriceEdits,
                          state.setPendingChanges
                        )
                      }
                      onApplyToRow={(rt, rp, di, ng) =>
                        applyPriceToRow(
                          rt,
                          rp,
                          di,
                          ng,
                          days,
                          state.priceEdits,
                          state.pendingChanges,
                          state.setPriceEdits,
                          state.setPendingChanges
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>
          ))}

          {/* Spacer after tiers */}
          {allBaseGuests.length > 0 && (
            <div className="flex h-10 border-b border-gray-300 bg-purple-100">
              {days.map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="w-32 flex-shrink-0 border-r border-gray-300"
                />
              ))}
            </div>
          )}

          {/* Additional Charge Data Rows */}
         {/* Additional Charge Data Rows */}
{allCharges.length > 0 &&
  allCharges.map((charge: any) => (
    <div
      key={`age-row-${charge.id}`}
      className="flex h-12 border-b border-gray-300"
    >
      {days.map((day, dayIndex) => {
        const ratePlanDetails = getRatePlanDetails(
          day,
          roomType,
          ratePlanType
        );
        const hasData =
          (ratePlanDetails?.ratePlan?.prices?.[0]
            ?.additionalGuestAmounts?.length ?? 0) > 0;
        const chargeData = hasData
          ? ratePlanDetails?.ratePlan?.prices?.[0]?.additionalGuestAmounts?.find(
              (c: any) => c.ageQualifyingCode === charge.ageCode
            )
          : null;

        return (
          <div
            key={dayIndex}
            className="h-12 w-32 flex-shrink-0 flex items-center justify-center border-r border-b border-gray-300 bg-blue-50 px-2"
          >
            <AdditionalChargeInput
              roomType={roomType}
              ratePlan={ratePlanType}
              dayIndex={dayIndex}
              currentAmount={chargeData?.amount || 0}
              currencyCode={ratePlanDetails?.currencyCode || "USD"}
              ageQualifyingCode={charge.id}
              showOnlyInput={true}
              priceEdits={state.priceEdits}
              commissionAmount={chargeData?.commissionAmount || 0}
              totalAfterCommission={chargeData?.amountAfterCommission || 0}
              pendingChanges={state.pendingChanges}
              generateKey={generateKey.additionalCharge}
              onChargeChange={(rt, rp, di, val, ac) =>
                handleAdditionalChargeChange(
                  rt,
                  rp,
                  di,
                  val,
                  ac,
                  state.priceEdits,
                  state.pendingChanges,
                  state.setPriceEdits,
                  state.setPendingChanges
                )
              }
              onApplyToRow={(rt, rp, di, ac) =>
                applyAdditionalChargeToRow(
                  rt,
                  rp,
                  di,
                  ac,
                  days,
                  state.priceEdits,
                  state.pendingChanges,
                  state.setPriceEdits,
                  state.setPendingChanges
                )
              }
            />
          </div>
        );
      })}
    </div>
  ))}

{/* Spacer after charges - ALWAYS SHOW */}
<div className="flex h-10 border-b border-gray-300 bg-blue-100">
  {days.map((_, dayIndex) => (
    <div
      key={dayIndex}
      className="w-32 flex-shrink-0 border-r border-gray-300"
    />
  ))}
</div>

          {/* Spacer after charges */}
          {/* {allCharges.length > 0 && (
            <div className="flex h-10 border-b border-gray-300 bg-blue-100">
              {days.map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="w-32 flex-shrink-0 border-r border-gray-300"
                />
              ))}
            </div>
          )} */}
        </>
      )}

      {/* Restrictions Data Rows */}
      {state.showRestrictions && (
        <>
          {/* CTA Data */}
          <div className="flex h-12 border-b border-gray-300">
            {days.map((day, index) => {
              const uniqueKey = generateKey.restriction(
                "CTA",
                index,
                roomType,
                ratePlanType
              );
              const ratePlan = day.ratePlans?.find(
                (rp) => rp.ratePlanCode === ratePlanType
              );
              const ctaValue = ratePlan?.cta || false;
              const effectiveValue = state.optimisticRestrictions.has(uniqueKey)
                ? state.optimisticRestrictions.get(uniqueKey)!
                : ctaValue;

              return (
                <div
                  key={index}
                  className="h-12 w-32 flex-shrink-0 flex items-center justify-center border-r border-b border-gray-300 bg-purple-50"
                >
                  <Switch
                    checked={effectiveValue}
                    // onCheckedChange={() =>
                    //   handleRestrictionToggle(
                    //     roomType,
                    //     index,
                    //     "CTA",
                    //     effectiveValue,
                    //     days,
                    //     hotelCode,
                    //     state.optimisticRestrictions,
                    //     state.setOptimisticRestrictions,
                    //     ratePlanType,
                    //     onDataUpdate
                    //   )
                    // }
                    className={`${
                      effectiveValue
                        ? "data-[state=checked]:bg-red-500"
                        : "data-[state=unchecked]:bg-gray-300"
                    } scale-50`}
                  />
                </div>
              );
            })}
          </div>

          {/* CTD Data */}
          <div className="flex h-12 border-b border-gray-300">
            {days.map((day, index) => {
              const uniqueKey = generateKey.restriction(
                "CTD",
                index,
                roomType,
                ratePlanType
              );
              const ratePlan = day.ratePlans?.find(
                (rp) => rp.ratePlanCode === ratePlanType
              );
              const ctdValue = ratePlan?.ctd || false;
              const effectiveValue = state.optimisticRestrictions.has(uniqueKey)
                ? state.optimisticRestrictions.get(uniqueKey)!
                : ctdValue;

              return (
                <div
                  key={index}
                  className="h-12 w-32 flex-shrink-0 flex items-center justify-center border-r border-b border-gray-300 bg-purple-50"
                >
                  <Switch
                    checked={effectiveValue}
                    // onCheckedChange={() =>
                    //   handleRestrictionToggle(
                    //     roomType,
                    //     index,
                    //     "CTD",
                    //     effectiveValue,
                    //     days,
                    //     hotelCode,
                    //     state.optimisticRestrictions,
                    //     state.setOptimisticRestrictions,
                    //     ratePlanType,
                    //     onDataUpdate
                    //   )
                    // }
                    className={`${
                      effectiveValue
                        ? "data-[state=checked]:bg-red-500"
                        : "data-[state=unchecked]:bg-gray-300"
                    } scale-50`}
                  />
                </div>
              );
            })}
          </div>

          {/* Min LOS Data */}
          <div className="flex h-12 border-b border-gray-300">
            {days.map((day, index) => {
              const key = generateKey.los(roomType, ratePlanType, index, "min");
              const edit = state.losEdits.get(key);
              const ratePlan = day.ratePlans?.find(
                (rp:any) => rp.ratePlanCode === ratePlanType
              );
              const currentValue = ratePlan?.minLengthOfStay || 0;
              const displayValue =
                edit !== undefined ? edit.value : currentValue || "";
              const hasChanges = state.pendingChanges.has(key);

              return (
                <div
                  key={index}
                  className="h-12 w-32 flex-shrink-0 flex items-center justify-center gap-1 border-r border-b border-gray-300 bg-purple-50 px-2"
                >
                  <input
                    type="number"
                    min="0"
                    value={displayValue}
                    onChange={(e) =>
                      handleLOSInputChange(
                        roomType,
                        ratePlanType,
                        index,
                        "min",
                        e.target.value,
                        state.losEdits,
                        state.pendingChanges,
                        state.setLosEdits,
                        state.setPendingChanges
                      )
                    }
                    className={`w-12 h-7 text-center text-sm rounded border ${
                      hasChanges
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-purple-400`}
                  />
                  {edit && (
                    <button
                      onClick={() =>
                        applyLOSToRow(
                          roomType,
                          ratePlanType,
                          index,
                          "min",
                          days,
                          state.losEdits,
                          state.pendingChanges,
                          state.setLosEdits,
                          state.setPendingChanges
                        )
                      }
                      className="p-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                      title="Apply to entire row"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Max LOS Data */}
          <div className="flex h-12 border-b border-gray-300">
            {days.map((day, index) => {
              const key = generateKey.los(roomType, ratePlanType, index, "max");
              const edit = state.losEdits.get(key);
              const ratePlan = day.ratePlans?.find(
                (rp:any) => rp.ratePlanCode === ratePlanType
              );
              const currentValue = ratePlan?.maxLengthOfStay || 0;
              const displayValue =
                edit !== undefined ? edit.value : currentValue || "";
              const hasChanges = state.pendingChanges.has(key);

              return (
                <div
                  key={index}
                  className="h-12 w-32 flex-shrink-0 flex items-center justify-center gap-1 border-r border-b border-gray-300 bg-purple-50 px-2"
                >
                  <input
                    type="number"
                    min="0"
                    value={displayValue}
                    onChange={(e) =>
                      handleLOSInputChange(
                        roomType,
                        ratePlanType,
                        index,
                        "max",
                        e.target.value,
                        state.losEdits,
                        state.pendingChanges,
                        state.setLosEdits,
                        state.setPendingChanges
                      )
                    }
                    className={`w-12 h-7 text-center text-sm rounded border ${
                      hasChanges
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-purple-400`}
                  />
                  {edit && (
                    <button
                      onClick={() =>
                        applyLOSToRow(
                          roomType,
                          ratePlanType,
                          index,
                          "max",
                          days,
                          state.losEdits,
                          state.pendingChanges,
                          state.setLosEdits,
                          state.setPendingChanges
                        )
                      }
                      className="p-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                      title="Apply to entire row"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save Button Row */}
          {/* Save Button Label */}
          {(Array.from(state.pendingChanges) as string[]).some(
            (k) =>
              k.includes(`${roomType}-${ratePlanType}-`) &&
              (k.includes("-min") || k.includes("-max"))
          ) && (
            <div className="flex h-12 border-b border-gray-300 bg-purple-50">
              {days.map((_, index) => (
                <div
                  key={index}
                  className="w-32 flex-shrink-0 border-gray-300"
                />
              ))}
              <div className="absolute left-0 right-0 h-12 flex items-center justify-center pointer-events-none">
                <button
                  onClick={() =>
                    saveLOSChanges(
                      roomType,
                      ratePlanType,
                      days,
                      state.losEdits,
                      state.pendingChanges,
                      hotelCode,
                      state.setLosEdits,
                      state.setPendingChanges,
                      onDataUpdate
                    )
                  }
                  className="flex items-center gap-2 px-4 py-1.5 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition-colors shadow-lg pointer-events-auto sticky left-1/2 -ml-24"
                >
                  <Save className="w-3 h-3" />
                  Save {ratePlanType} Changes
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
