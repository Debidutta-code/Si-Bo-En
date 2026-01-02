// components/RoomTypeSection.tsx

import React from "react";
// import { InventoryDay } from "../types/inventory";
import { ArrowRight, Save } from "lucide-react";
// import { Switch } from "../../../../components/ui/switch";
import toast from "react-hot-toast";

import { RatePlanSection } from "./RatePlanSection";
import {
  getRoomTypeData,
  calculateOccupancyPercent,
  getRatePlansForRoomType,
  generateKey,
} from "../features";
import {
  handleAvailabilityInputChange,
  applyAvailabilityToRow,
  // saveAvailabilityChanges,
  handleLOSInputChange,
  applyLOSToRow,
  saveLOSChanges,
  // handleRestrictionToggle,
} from "../features";
import { Switch } from "@/components/ui/switch";
import type { InventoryDay } from "../types/inventory";
// import {
//   removeCTAorCTDRestriction,
//   updateCTAorCTDRestriction,
// } from "../api/api";

interface RoomTypeSectionProps {
  roomType: string;
  days: InventoryDay[];
  state: any;
  hotelCode: string;
  onMouseEnter: (index: number) => void;
  onMouseLeave: () => void;
  onDataUpdate?: () => void;
}

export const RoomTypeSection: React.FC<RoomTypeSectionProps> = ({
  roomType,
  days,
  state,
  hotelCode,
  onMouseEnter,
  onMouseLeave,
  onDataUpdate,
}) => {
  const roomTypeData = getRoomTypeData(roomType, days);

  return (
    <div className="mb-6 border border-gray-300 rounded-lg">
      <div className="flex">
        {/* LEFT COLUMN - Labels */}
        <div className="w-80 flex-shrink-0 bg-gray-50 border-r border-b border-gray-300 sticky left-0 z-10">
          {/* Room Type Header */}
          <div className="h-14 flex border-b border-gray-300">
            <div className="w-40 flex items-center px-2 border-r border-gray-300 text-gray-700 font-bold">
              {roomType}
            </div>
            <div className="w-40 flex items-center justify-center px-2 bg-blue-100 text-blue-800 font-bold text-sm">
              BULK
            </div>
          </div>

          {/* Basic Info Rows */}
          {["Status", "Availability", "Sold", "Occupancy %"].map((label) => (
            <div key={label} className="h-9 flex border-b border-gray-300">
              <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-gray-50">
                <span className="font-semibold text-gray-700 text-xs">
                  {label}
                </span>
              </div>
              <div className="w-40 flex items-center justify-center px-2 bg-gray-50">
                {label === "Availability" && (
                  <input
                    type="number"
                    min="0"
                    placeholder="Bulk"
                    className="w-20 h-7 text-center text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => {
                      if (e.target.value) {
                        const newEdits = new Map(state.availabilityEdits);
                        const newPending = new Set(state.pendingChanges);
                        days.forEach((_, idx) => {
                          const key = generateKey.availability(roomType, idx);
                          newEdits.set(key, {
                            roomType,
                            dayIndex: idx,
                            value: e.target.value,
                          });
                          newPending.add(key);
                        });
                        state.setAvailabilityEdits(newEdits);
                        state.setPendingChanges(newPending);
                        toast.success("Bulk availability applied to all dates");
                      }
                    }}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Restrictions Section */}
          {state.showRestrictions && (
            <>
              {/* Room CTA */}
              <div className="h-12 flex border-b border-gray-300">
                <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-blue-50">
                  <span className="font-semibold text-blue-700 text-xs">
                    Room CTA
                  </span>
                </div>
                <div className="w-40 flex items-center justify-center px-2 bg-blue-50">
                  <Switch
                    checked={(() => {
                      // Check if ALL days have CTA enabled
                      return days.every((day, idx) => {
                        const uniqueKey = generateKey.restriction(
                          "CTA",
                          idx,
                          roomType
                        );
                        const ctaValue = day.restrictions?.CTA || false;
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

                    //   // ✅ NEW: Get all rate plans for this room type
                    //   const ratePlansForRoom = getRatePlansForRoomType(
                    //     roomType,
                    //     days
                    //   );

                    //   // Collect dates and update optimistic state
                    //   days.forEach((day, idx) => {
                    //     const uniqueKey = generateKey.restriction(
                    //       "CTA",
                    //       idx,
                    //       roomType
                    //     );
                    //     const currentValue = day.restrictions?.CTA || false;
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
                    //     if (checked) {
                    //       // Enable CTA - single API call
                    //       const payload = {
                    //         propertyCode: hotelCode,
                    //         restrictionType: "CTA" as const,
                    //         dates: datesToChange,
                    //         notes: "",
                    //         isActive: true,
                    //         roomRestrictions: [
                    //           {
                    //             roomTypeCode: roomType,
                    //             ratePlanCodes: ratePlansForRoom, // ✅ Send all rate plans
                    //           },
                    //         ],
                    //         globalRatePlans: [],
                    //       };

                    //       await updateCTAorCTDRestriction(payload);
                    //       toast.success(
                    //         `CTA enabled for ${datesToChange.length} dates`
                    //       );
                    //     } else {
                    //       // Disable CTA - single API call
                    //       const payload = {
                    //         propertyCode: hotelCode,
                    //         restrictionType: "CTA" as const,
                    //         dates: datesToChange,
                    //         notes: "",
                    //         isActive: false,
                    //         roomRestrictions: [
                    //           {
                    //             roomTypeCode: roomType,
                    //             ratePlanCodes: ratePlansForRoom, // ✅ Send all rate plans
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

                    //     // Revert optimistic state
                    //     days.forEach((day, idx) => {
                    //       const uniqueKey = generateKey.restriction(
                    //         "CTA",
                    //         idx,
                    //         roomType
                    //       );
                    //       const currentValue = day.restrictions?.CTA || false;
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
                          roomType
                        );
                        const ctaValue = day.restrictions?.CTA || false;
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
              {/* Room CTD */}
              <div className="h-12 flex border-b border-gray-300">
                <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-blue-50">
                  <span className="font-semibold text-blue-700 text-xs">
                    Room CTD
                  </span>
                </div>
                <div className="w-40 flex items-center justify-center px-2 bg-blue-50">
                  <Switch
                    checked={(() => {
                      // Check if ALL days have CTD enabled
                      return days.every((day, idx) => {
                        const uniqueKey = generateKey.restriction(
                          "CTD",
                          idx,
                          roomType
                        );
                        const ctdValue = day.restrictions?.CTD || false;
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

                    //   // ✅ NEW: Get all rate plans for this room type
                    //   const ratePlansForRoom = getRatePlansForRoomType(
                    //     roomType,
                    //     days
                    //   );

                    //   // Collect dates and update optimistic state
                    //   days.forEach((day, idx) => {
                    //     const uniqueKey = generateKey.restriction(
                    //       "CTD",
                    //       idx,
                    //       roomType
                    //     );
                    //     const currentValue = day.restrictions?.CTD || false;
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
                    //     if (checked) {
                    //       // Enable CTD - single API call
                    //       const payload = {
                    //         propertyCode: hotelCode,
                    //         restrictionType: "CTD" as const,
                    //         dates: datesToChange,
                    //         notes: "",
                    //         isActive: true,
                    //         roomRestrictions: [
                    //           {
                    //             roomTypeCode: roomType,
                    //             ratePlanCodes: ratePlansForRoom, // ✅ Send all rate plans
                    //           },
                    //         ],
                    //         globalRatePlans: [],
                    //       };

                    //       await updateCTAorCTDRestriction(payload, accessToken);
                    //       toast.success(
                    //         `CTD enabled for ${datesToChange.length} dates`
                    //       );
                    //     } else {
                    //       // Disable CTD - single API call
                    //       const payload = {
                    //         propertyCode: hotelCode,
                    //         restrictionType: "CTD" as const,
                    //         dates: datesToChange,
                    //         notes: "",
                    //         isActive: false,
                    //         roomRestrictions: [
                    //           {
                    //             roomTypeCode: roomType,
                    //             ratePlanCodes: ratePlansForRoom, // ✅ Send all rate plans
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

                    //     // Revert optimistic state
                    //     days.forEach((day, idx) => {
                    //       const uniqueKey = generateKey.restriction(
                    //         "CTD",
                    //         idx,
                    //         roomType
                    //       );
                    //       const currentValue = day.restrictions?.CTD || false;
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
                          roomType
                        );
                        const ctdValue = day.restrictions?.CTD || false;
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

              {/* Room Min LOS */}
              <div className="h-12 flex border-b border-gray-300">
                <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-blue-50">
                  <span className="font-semibold text-blue-700 text-xs">
                    Room Min LOS
                  </span>
                </div>
                <div className="w-40 flex items-center justify-center px-2 bg-blue-50">
                  <input
                    type="number"
                    min="0"
                    placeholder="Bulk"
                    className="w-20 h-7 text-center text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => {
                      if (e.target.value) {
                        const newEdits = new Map(state.losEdits);
                        const newPending = new Set(state.pendingChanges);
                        days.forEach((_, idx) => {
                          const key = generateKey.los(
                            roomType,
                            null,
                            idx,
                            "min"
                          );
                          newEdits.set(key, {
                            roomType,
                            ratePlan: null,
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

              {/* Room Max LOS */}
              <div className="h-12 flex border-b border-gray-300">
                <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-blue-50">
                  <span className="font-semibold text-blue-700 text-xs">
                    Room Max LOS
                  </span>
                </div>
                <div className="w-40 flex items-center justify-center px-2 bg-blue-50">
                  <input
                    type="number"
                    min="0"
                    placeholder="Bulk"
                    className="w-20 h-7 text-center text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => {
                      if (e.target.value) {
                        const newEdits = new Map(state.losEdits);
                        const newPending = new Set(state.pendingChanges);
                        days.forEach((_, idx) => {
                          const key = generateKey.los(
                            roomType,
                            null,
                            idx,
                            "max"
                          );
                          newEdits.set(key, {
                            roomType,
                            ratePlan: null,
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

              {/* Room Type Save Button */}
              {(Array.from(state.pendingChanges) as string[]).some(
                (k) =>
                  k.includes(`${roomType}-roomtype-`) &&
                  (k.includes("-min") || k.includes("-max"))
              ) && (
                <div className="h-12 flex items-center px-2 border-b border-gray-300 bg-green-50">
                  <span className="font-semibold text-green-700 text-xs">
                    Save Changes
                  </span>
                </div>
              )}
            </>
          )}

          {/* Rate Plans Labels */}
          {state.showRatePlans &&
            getRatePlansForRoomType(roomType, days).map((ratePlanType) => (
              <RatePlanSection
                key={ratePlanType}
                roomType={roomType}
                ratePlanType={ratePlanType}
                days={days}
                state={state}
                hotelCode={hotelCode}
                onDataUpdate={onDataUpdate}
                renderMode="labels"
              />
            ))}
        </div>

        {/* DATA COLUMNS - Right Side */}
        <div className="flex-1">
          <div className="min-w-max">
            {/* Date Header */}
            <div className="flex border-b border-gray-300 bg-gray-100 h-14">
              {days.map((day, index) => (
                <div
                  key={index}
                  onMouseEnter={() => onMouseEnter(index)}
                  onMouseLeave={onMouseLeave}
                  className="w-32 flex-shrink-0 flex flex-col items-center justify-center py-2 border-r border-gray-300"
                >
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {day.dayOfWeek}
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mt-0.5">
                    {day.month.slice(0, 3)} {day.date}
                  </div>
                </div>
              ))}
            </div>

            {/* Status Row */}
            <div className="flex h-9 border-b border-gray-300">
              {roomTypeData.map((roomData, index) => {
                const isBookable = roomData && roomData.status === "open";
                const badgeClass = isBookable
                  ? "bg-green-100 border border-green-300 text-green-700"
                  : "bg-red-100 border border-red-300 text-red-700";
                const message = isBookable ? "Bookable" : "Sell Stopped";

                return (
                  <div
                    key={index}
                    className="w-32 h-9 flex-shrink-0 flex items-center justify-center border-r border-gray-300"
                  >
                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-medium text-center ${badgeClass}`}
                    >
                      {message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Availability Row */}
            <div className="flex h-9 border-b border-gray-300">
              {roomTypeData.map((roomData, index) => {
                const key = generateKey.availability(roomType, index);
                const edit = state.availabilityEdits.get(key);
                const currentValue = roomData ? roomData.available : 0;
                const displayValue =
                  edit !== undefined ? edit.value : currentValue;
                const hasChanges = state.pendingChanges.has(key);

                return (
                  <div
                    key={index}
                    className="w-32 h-9 flex-shrink-0 flex items-center justify-center gap-1 border-r border-b border-gray-300 bg-white px-2"
                  >
                    <input
                      type="number"
                      min="0"
                      value={displayValue}
                      onChange={(e) =>
                        handleAvailabilityInputChange(
                          roomType,
                          index,
                          e.target.value,
                          state.availabilityEdits,
                          state.pendingChanges,
                          state.setAvailabilityEdits,
                          state.setPendingChanges
                        )
                      }
                      className={`w-14 h-7 text-center text-sm font-bold rounded border ${
                        hasChanges
                          ? "border-orange-400 bg-orange-50"
                          : "border-transparent"
                      } focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-300 transition-colors`}
                    />
                    {edit && (
                      <button
                        onClick={() =>
                          applyAvailabilityToRow(
                            roomType,
                            index,
                            days,
                            state.availabilityEdits,
                            state.pendingChanges,
                            state.setAvailabilityEdits,
                            state.setPendingChanges
                          )
                        }
                        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        title="Apply to entire row"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sold Row */}
            <div className="flex h-9 border-b border-gray-300">
              {roomTypeData.map((roomData, index) => (
                <div
                  key={index}
                  className="w-32 h-9 flex-shrink-0 flex items-center justify-center border-r border-b border-gray-300 bg-white text-blue-800 cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <span className="text-sm font-bold">
                    {roomData ? roomData.sold : 0}
                  </span>
                </div>
              ))}
            </div>

            {/* Occupancy % Row */}
            <div className="flex h-9 border-b border-gray-300">
              {roomTypeData.map((roomData, index) => {
                const total = roomData ? roomData.available + roomData.sold : 0;
                const sold = roomData ? roomData.sold : 0;
                const percent = calculateOccupancyPercent(total, sold);

                return (
                  <div
                    key={index}
                    className="w-32 h-9 flex-shrink-0 flex items-center justify-center border-r border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <span className="text-sm font-bold">{percent}%</span>
                  </div>
                );
              })}
            </div>

            {/* Restrictions Data Rows */}
            {state.showRestrictions && (
              <>
                {/* CTA Row */}
                <div className="flex h-12 border-b border-gray-300">
                  {days.map((day, index) => {
                    const uniqueKey = generateKey.restriction(
                      "CTA",
                      index,
                      roomType
                    );
                    const ctaValue = day.restrictions?.CTA || false;
                    const effectiveValue = state.optimisticRestrictions.has(
                      uniqueKey
                    )
                      ? state.optimisticRestrictions.get(uniqueKey)!
                      : ctaValue;

                    return (
                      <div
                        key={index}
                        className="h-12 w-32 flex-shrink-0 flex items-center justify-center border-r border-b border-gray-300 bg-blue-50"
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
                              
                          //     // onDataUpdate
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

                {/* CTD Row */}
                <div className="flex h-12 border-b border-gray-300">
                  {days.map((day, index) => {
                    const uniqueKey = generateKey.restriction(
                      "CTD",
                      index,
                      roomType
                    );
                    const ctdValue = day.restrictions?.CTD || false;
                    const effectiveValue = state.optimisticRestrictions.has(
                      uniqueKey
                    )
                      ? state.optimisticRestrictions.get(uniqueKey)!
                      : ctdValue;

                    return (
                      <div
                        key={index}
                        className="h-12 w-32 flex-shrink-0 flex items-center justify-center border-r border-b border-gray-300 bg-blue-50"
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
                          //     undefined,
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

                {/* Min LOS Row */}
                <div className="flex h-12 border-b border-gray-300">
                  {days.map((day, index) => {
                    const key = generateKey.los(roomType, null, index, "min");
                    const edit = state.losEdits.get(key);
                    // Find the rate plan that has prices for this room type
                    const ratePlanForRoom = day.ratePlans?.find((rp:any ) =>
                      rp.prices?.some((p:any) => p.invTypeCode === roomType)
                    );
                    const currentValue = ratePlanForRoom?.minLengthOfStay || 0;
                    const displayValue =
                      edit !== undefined ? edit.value : currentValue || "";
                    const hasChanges = state.pendingChanges.has(key);

                    return (
                      <div
                        key={index}
                        className="h-12 w-32 flex-shrink-0 flex items-center justify-center gap-1 border-r border-b border-gray-300 bg-blue-50 px-2"
                      >
                        <input
                          type="number"
                          min="0"
                          value={displayValue}
                          onChange={(e) =>
                            handleLOSInputChange(
                              roomType,
                              null,
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
                          } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        />
                        {edit && (
                          <button
                            onClick={() =>
                              applyLOSToRow(
                                roomType,
                                null,
                                index,
                                "min",
                                days,
                                state.losEdits,
                                state.pendingChanges,
                                state.setLosEdits,
                                state.setPendingChanges
                              )
                            }
                            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            title="Apply to entire row"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Max LOS Row */}
                <div className="flex h-12 border-b border-gray-300">
                  {days.map((day, index) => {
                    const key = generateKey.los(roomType, null, index, "max");
                    const edit = state.losEdits.get(key);
                    // Find the rate plan that has prices for this room type
                    const ratePlanForRoom = day.ratePlans?.find((rp:any) =>
                      rp.prices?.some((p:any) => p.invTypeCode === roomType)
                    );
                    const currentValue = ratePlanForRoom?.maxLengthOfStay || 0;
                    const displayValue =
                      edit !== undefined ? edit.value : currentValue || "";
                    const hasChanges = state.pendingChanges.has(key);

                    return (
                      <div
                        key={index}
                        className="h-12 w-32 flex-shrink-0 flex items-center justify-center gap-1 border-r border-b border-gray-300 bg-blue-50 px-2"
                      >
                        <input
                          type="number"
                          min="0"
                          value={displayValue}
                          onChange={(e) =>
                            handleLOSInputChange(
                              roomType,
                              null,
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
                          } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        />
                        {edit && (
                          <button
                            onClick={() =>
                              applyLOSToRow(
                                roomType,
                                null,
                                index,
                                "max",
                                days,
                                state.losEdits,
                                state.pendingChanges,
                                state.setLosEdits,
                                state.setPendingChanges
                              )
                            }
                            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
                {(Array.from(state.pendingChanges) as string[]).some(
                  (k) =>
                    k.includes(`${roomType}-roomtype-`) &&
                    (k.includes("-min") || k.includes("-max"))
                ) && (
                  <div className="flex h-12 border-b border-gray-300 bg-blue-50">
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
                            null,
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
                        Save Room Type Changes
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Rate Plans Data */}
            {state.showRatePlans &&
              getRatePlansForRoomType(roomType, days).map((ratePlanType) => (
                <RatePlanSection
                  key={ratePlanType}
                  roomType={roomType}
                  ratePlanType={ratePlanType}
                  days={days}
                  state={state}
                  hotelCode={hotelCode}
                  onDataUpdate={onDataUpdate}
                  renderMode="data"
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
