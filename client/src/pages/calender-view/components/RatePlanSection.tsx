
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Users,
  ArrowRight,
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
} from "../features";
import {
  toggleOccupancyExpansion,
  addGuestTier,
  removeGuestTier,
  addAdditionalCharge,
  removeAdditionalCharge,
} from "../features";
import { saveLOSChanges, saveBookingOffsetChanges } from "../features";
import type { InventoryDay } from "../types/inventory";
import { Switch } from "@/components/ui/switch";
import {
  handleBulkRatePlanRestrictionToggle,
  handleRatePlanRestrictionToggle,
} from "../features/restrictionHandlers";
import { useStartStopSellService } from "@/pages/start-stop-sell/services";
import { fetchBookingOffsetsService } from "../services/inventory.service";
import type { IBookingOffset } from "@/pages/booking-offset/interfaces";

interface RatePlanSectionProps {
  roomType: string;
  ratePlanType: string;
  days: InventoryDay[];
  state: any;
  hotelCode: string;
  propertyId: string;
  ratePlanMap: Record<string, string>;
  onDataUpdate?: () => void;
  renderMode: "labels" | "data";
}
function getGuestTierLabel(numberOfGuests: number, ageQualifyingCode: string): string {
  const ageLabel = AGE_LABELS[ageQualifyingCode] || "Guest";

  if (numberOfGuests > 1) {
    if (ageLabel === "Adult") return `${numberOfGuests} Adults`;
    if (ageLabel === "Child") return `${numberOfGuests} Children`;
    if (ageLabel === "Infant") return `${numberOfGuests} Infants`;
    return `${numberOfGuests} Guests`;
  }

  return `${numberOfGuests} ${ageLabel}`;
}
export const RatePlanSection: React.FC<RatePlanSectionProps> = ({
  roomType,
  ratePlanType,
  days,
  state,
  hotelCode,
  propertyId,
  ratePlanMap,
  onDataUpdate,
  renderMode,
}) => {
  const day = days[0];
  const ratePlanDetails = getRatePlanDetails(day, roomType, ratePlanType);
  const hasOccupancy = (ratePlanDetails?.baseByGuestAmts?.length ?? 0) > 0;
  const isExpanded = state.expandedOccupancy.has(`${roomType}-${ratePlanType}`);

  const customKey = generateKey.customTier(roomType, ratePlanType);
  const customData = state.customTiers.get(customKey) || {
    baseGuests: [],
    additionalCharges: [],
  };

  const existingTiers =
    ratePlanDetails?.baseByGuestAmts || [];
  const allBaseGuests = [...existingTiers];
  customData.baseGuests.forEach((numGuests: number) => {
    if (!allBaseGuests.find((g: any) => g.numberOfGuests === numGuests)) {
      allBaseGuests.push({ numberOfGuests: numGuests, amountBeforeTax: 0, ageQualifyingCode: "10" });
    }
  });
  allBaseGuests.sort((a: any, b: any) => a.numberOfGuests - b.numberOfGuests);

  const existingCharges =
    ratePlanDetails?.additionalGuestAmounts || [];
  const existingAsInstances = existingCharges.map(
    (charge: any, idx: number) => ({
      ageCode: charge.ageQualifyingCode,
      id: `existing-${charge.ageQualifyingCode}-${idx}`,
      isExisting: true,
    }),
  );
  const customChargesWithFlag = customData.additionalCharges.map(
    (charge: any) => ({
      ...charge,
      isExisting: false,
    }),
  );
  const allCharges = [...existingAsInstances, ...customChargesWithFlag];

  // ============================================
  // BOOKING OFFSET DATA
  // ============================================
  const [bookingOffsetData, setBookingOffsetData] = useState<IBookingOffset[]>(
    [],
  );

  useEffect(() => {
    const fetchBookingOffsets = async () => {
      const ratePlanId = ratePlanMap[ratePlanType];
      if (!propertyId || !ratePlanId || days.length === 0) return;

      try {
        const startDate = days[0]?.fullDate || null;
        const endDate = days[days.length - 1]?.fullDate || null;
        const response = await fetchBookingOffsetsService(
          propertyId,
          ratePlanId,
          startDate,
          endDate,
        );
        if (response.success && response.data) {
          setBookingOffsetData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch booking offsets:", error);
      }
    };

    fetchBookingOffsets();
  }, [propertyId, ratePlanType, ratePlanMap, days]);

  // Helper to find offset data for a given day
  const getOffsetForDay = (day: InventoryDay): IBookingOffset | undefined => {
    return bookingOffsetData.find((offset) => {
      const offsetDate = new Date(offset.date).toISOString().split("T")[0];
      return offsetDate === day.fullDate;
    });
  };

  // ============================================
  // PER-CELL UNIT STATE  (key = `${field}-${dayIndex}`)
  // ============================================
  type OffsetField =
    | "maximumAdvanceBookingOffset"
    | "minimumAdvanceBookingOffset"
    | "maximumAmendBookingOffset"
    | "minimumAmendBookingOffset"
    | "maximumCancelBookingOffset"
    | "minimumCancelBookingOffset";

  type CellUnitKey = `${OffsetField}-${number}`;
  const [cellUnits, setCellUnits] = useState<Map<CellUnitKey, "hours" | "days">>(new Map());

  const getCellUnit = (field: OffsetField, dayIndex: number): "hours" | "days" => {
    return cellUnits.get(`${field}-${dayIndex}` as CellUnitKey) ?? "hours";
  };

  const setCellUnit = (field: OffsetField, dayIndex: number, unit: "hours" | "days") => {
    setCellUnits((prev) => {
      const next = new Map(prev);
      next.set(`${field}-${dayIndex}` as CellUnitKey, unit);
      return next;
    });
  };

  // Convert hours→display value based on cell unit
  const toDisplay = (hours: number | null | undefined, unit: "hours" | "days"): string => {
    if (hours == null) return "";
    if (unit === "days") {
      // Show whole days if divisible, otherwise fractional
      return String(hours % 24 === 0 ? hours / 24 : +(hours / 24).toFixed(2));
    }
    return String(hours);
  };

  // Convert user input→hours to store
  const toHours = (val: string, unit: "hours" | "days"): string => {
    if (val === "") return "";
    return unit === "days" ? String(Number(val) * 24) : val;
  };

  // Build a reusable offset cell renderer
  const renderOffsetCell = (
    day: InventoryDay,
    index: number,
    field: OffsetField,
  ) => {
    const offset = getOffsetForDay(day);
    const editKey = generateKey.bookingOffset(roomType, ratePlanType, index, field);
    const edit = state.bookingOffsetEdits.get(editKey);
    const apiValue: number | null | undefined = offset?.[field];
    // raw value stored is always in HOURS
    const rawHours: number | null = edit != null ? Number(edit.value) : (apiValue ?? null);
    const unit = getCellUnit(field, index);
    const displayValue = toDisplay(rawHours, unit);
    const hasChanges = state.pendingChanges.has(editKey);

    return (
      <div
        key={index}
        className={`w-32 flex-shrink-0 flex flex-col items-center justify-center border-r border-gray-300 px-1 gap-1 ${hasChanges ? "bg-orange-50" : "bg-purple-50"}`}
      >
        {/* Unit selector */}
        <div className="flex rounded overflow-hidden border border-purple-300 text-[9px] font-semibold">
          <button
            onClick={() => setCellUnit(field, index, "hours")}
            className={`px-1.5 py-1 transition-colors ${unit === "hours" ? "bg-purple-600 text-white" : "bg-white text-purple-600 hover:bg-purple-50"}`}
          >
            Hr
          </button>
          <button
            onClick={() => setCellUnit(field, index, "days")}
            className={`px-1.5 py-1 transition-colors ${unit === "days" ? "bg-purple-600 text-white" : "bg-white text-purple-600 hover:bg-purple-50"}`}
          >
            Day
          </button>
        </div>
        {/* Value input + apply-to-right button */}
        <div className="flex items-center">
          <input
            type="number"
            min="0"
            value={displayValue}
            placeholder="-"
            onChange={(e) => {
              const newEdits = new Map(state.bookingOffsetEdits);
              const newPending = new Set(state.pendingChanges);
              newEdits.set(editKey, {
                roomType,
                ratePlan: ratePlanType,
                dayIndex: index,
                field,
                value: toHours(e.target.value, unit),
              });
              newPending.add(editKey);
              state.setBookingOffsetEdits(newEdits);
              state.setPendingChanges(newPending);
            }}
            className={`w-14 h-7 text-center text-xs font-bold rounded border ${hasChanges ? "border-orange-400 bg-orange-50" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-400`}
          />
          {edit && (
            <button
              onClick={() => {
                const newEdits = new Map(state.bookingOffsetEdits);
                const newPending = new Set(state.pendingChanges);
                days.forEach((_, idx) => {
                  if (idx >= index) {
                    const k = generateKey.bookingOffset(roomType, ratePlanType, idx, field);
                    newEdits.set(k, {
                      roomType,
                      ratePlan: ratePlanType,
                      dayIndex: idx,
                      field,
                      value: edit.value, // already stored in hours
                    });
                    newPending.add(k);
                    // propagate same unit to remaining cells
                    setCellUnit(field, idx, unit);
                  }
                });
                state.setBookingOffsetEdits(newEdits);
                state.setPendingChanges(newPending);
              }}
              className="p-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex-shrink-0"
              title="Apply to remaining dates"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const formatDateForStartStop = (day: InventoryDay): string => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthNumber = monthNames.indexOf(day.month) + 1;
    const dateStr = `${day.year}-${String(monthNumber).padStart(2, "0")}-${String(day.date).padStart(2, "0")}`;
    return new Date(dateStr).toISOString();
  };

  if (renderMode === "labels") {
    return (
      <>
        {/* Rate Plan Header */}
        <div
          className={`${isExpanded ? "h-14" : "h-20"} flex border-b border-gray-300`}
        >
          <div className="w-40 flex flex-col items-start justify-center px-2 border-r border-gray-300 bg-gray-50 gap-1">
            <span
              className="font-semibold text-gray-700 text-xs truncate w-full"
              title={ratePlanDetails?.ratePlan?.ratePlanName || ratePlanType}
            >
              {ratePlanDetails?.ratePlan?.ratePlanName || ratePlanType}
            </span>
            {hasOccupancy && (
              <button
                onClick={() =>
                  toggleOccupancyExpansion(
                    roomType,
                    ratePlanType,
                    state.expandedOccupancy,
                    state.setExpandedOccupancy,
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

          {/* Bulk Open/Close Toggle and Price Input */}
          <div className="w-40 flex items-center justify-center px-2 bg-blue-100">
            {!isExpanded ? (
              <div className="flex flex-col items-center justify-center gap-1.5">
                <Switch
                  checked={(() => {
                    return days.every((day) => {
                      const ratePlanDetails = getRatePlanDetails(
                        day,
                        roomType,
                        ratePlanType,
                      );
                      return (
                        ratePlanDetails?.sellStatus === "open"
                      );
                    });
                  })()}
                  onCheckedChange={async (checked) => {
                    try {
                      const firstDate = formatDateForStartStop(days[0]);
                      const lastDate = formatDateForStartStop(
                        days[days.length - 1],
                      );

                      const response = await useStartStopSellService(
                        propertyId,
                        {
                          from: firstDate,
                          to: lastDate,
                          ratePlanCode: ratePlanType,
                          roomTypeCode: roomType,
                          isSellStop: !checked,
                        },
                      );

                      if (response.success) {
                        toast.success(
                          `Rate plan ${checked ? "opened" : "closed"} for ${days.length} dates`,
                        );
                        if (onDataUpdate) await onDataUpdate();
                      } else {
                        throw new Error(response.message);
                      }
                    } catch (error: any) {
                      console.error(
                        "Failed to update bulk rate plan status:",
                        error,
                      );
                      toast.error(
                        error.message || "Failed to update rate plan status",
                      );
                    }
                  }}
                  className={`${(() => {
                    const allOpen = days.every((day) => {
                      const ratePlanDetails = getRatePlanDetails(
                        day,
                        roomType,
                        ratePlanType,
                      );
                      return (
                        ratePlanDetails?.ratePlan?.prices?.[0]?.sellStatus ===
                        "open"
                      );
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
                          ratePlanType,
                        );
                        const hasOccupancy = (dayRatePlan?.baseByGuestAmts?.length ?? 0) > 0;
                        let key;
                        if (hasOccupancy) {
                          const firstTierAgeCode = dayRatePlan?.baseByGuestAmts?.[0]?.ageQualifyingCode || "10";
                          key = generateKey.price(
                            roomType,
                            ratePlanType,
                            idx,
                            1,
                            firstTierAgeCode,
                          );
                          newEdits.set(key, {
                            roomType,
                            ratePlan: ratePlanType,
                            dayIndex: idx,
                            value: e.target.value,
                            numberOfGuests: 1,
                            ageQualifyingCode: firstTierAgeCode,
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
                    }
                  }}
                />
              </div>
            ) : (
              <Switch
                checked={(() => {
                  return days.every((day) => {
                    const ratePlanDetails = getRatePlanDetails(
                      day,
                      roomType,
                      ratePlanType,
                    );
                    return (
                      ratePlanDetails?.sellStatus === "open"
                    );
                  });
                })()}
                onCheckedChange={async (checked) => {
                  try {
                    const firstDate = formatDateForStartStop(days[0]);
                    const lastDate = formatDateForStartStop(
                      days[days.length - 1],
                    );

                    const response = await useStartStopSellService(propertyId, {
                      from: firstDate,
                      to: lastDate,
                      ratePlanCode: ratePlanType,
                      roomTypeCode: roomType,
                      isSellStop: !checked,
                    });

                    if (response.success) {
                      toast.success(
                        `Rate plan ${checked ? "opened" : "closed"} for ${days.length} dates`,
                      );
                      if (onDataUpdate) await onDataUpdate();
                    } else {
                      throw new Error(response.message);
                    }
                  } catch (error: any) {
                    console.error(
                      "Failed to update bulk rate plan status:",
                      error,
                    );
                    toast.error(
                      error.message || "Failed to update rate plan status",
                    );
                  }
                }}
                className={`${(() => {
                  const allOpen = days.every((day) => {
                    const ratePlanDetails = getRatePlanDetails(
                      day,
                      roomType,
                      ratePlanType,
                    );
                    return (
                      ratePlanDetails?.sellStatus === "open"
                    );
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
            {allBaseGuests.map((guestTier: any, tierIndex: number) => (
              <div
                key={`label-tier-${tierIndex}`}
                className="h-12 flex border-b border-gray-300"
              >
                <div className="w-40 flex items-center justify-between px-2 border-r border-gray-300 bg-purple-50">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-purple-700 text-xs">
                      {getGuestTierLabel(guestTier.numberOfGuests, guestTier.ageQualifyingCode)}
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
                          state.setCustomTiers,
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
                            guestTier.numberOfGuests,
                            guestTier.ageQualifyingCode,
                          );
                          newEdits.set(key, {
                            roomType,
                            ratePlan: ratePlanType,
                            dayIndex: idx,
                            value: e.target.value,
                            numberOfGuests: guestTier.numberOfGuests,
                            ageQualifyingCode: guestTier.ageQualifyingCode,
                          });
                          newPending.add(key);
                        });
                        state.setPriceEdits(newEdits);
                        state.setPendingChanges(newPending);
                      }
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="h-10 flex items-center px-2 border-b border-gray-300 bg-purple-100">
              <button
                onClick={() => {
                  const maxGuests = Math.max(
                    ...allBaseGuests.map((g: any) => g.numberOfGuests),
                    0,
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
                    state.setPendingChanges,
                  );
                }}
                className="text-xs text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1"
              >
                <span>+ Add Guest Tier</span>
              </button>
            </div>

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
                            state.setPendingChanges,
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
                              charge.id,
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
                          // toast.success(`Bulk ${AGE_LABELS[charge.ageCode]} charge applied`);
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
                      state.setPendingChanges,
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
                {!allCharges.some((c) => c.ageCode === "10") && (
                  <option value="10">Adult</option>
                )}
                {!allCharges.some((c) => c.ageCode === "8") && (
                  <option value="8">Child</option>
                )}
                {!allCharges.some((c) => c.ageCode === "7") && (
                  <option value="7">Infant</option>
                )}
              </select>
            </div>
          </>
        )}

        {/* Restrictions Labels */}
        {state.showRestrictions && (
          <>
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
                        ratePlanType,
                      );
                      const ratePlan = day.ratePlans?.find(
                        (rp) => rp.ratePlanCode === ratePlanType,
                      );
                      const ctaValue = ratePlan?.cta || false;
                      return state.optimisticRestrictions.has(uniqueKey)
                        ? state.optimisticRestrictions.get(uniqueKey)!
                        : ctaValue;
                    });
                  })()}
                  onCheckedChange={async (checked) => {
                    await handleBulkRatePlanRestrictionToggle(
                      roomType,
                      ratePlanType,
                      "CTA",
                      checked,
                      days,
                      hotelCode,
                      state.optimisticRestrictions,
                      state.setOptimisticRestrictions,
                      onDataUpdate,
                    );
                  }}
                  className={`${(() => {
                    const allEnabled = days.every((day, idx) => {
                      const uniqueKey = generateKey.restriction(
                        "CTA",
                        idx,
                        roomType,
                        ratePlanType,
                      );
                      const ratePlan = day.ratePlans?.find(
                        (rp) => rp.ratePlanCode === ratePlanType,
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
                        ratePlanType,
                      );
                      const ratePlan = day.ratePlans?.find(
                        (rp) => rp.ratePlanCode === ratePlanType,
                      );
                      const ctdValue = ratePlan?.ctd || false;
                      return state.optimisticRestrictions.has(uniqueKey)
                        ? state.optimisticRestrictions.get(uniqueKey)!
                        : ctdValue;
                    });
                  })()}
                  onCheckedChange={async (checked) => {
                    await handleBulkRatePlanRestrictionToggle(
                      roomType,
                      ratePlanType,
                      "CTD",
                      checked,
                      days,
                      hotelCode,
                      state.optimisticRestrictions,
                      state.setOptimisticRestrictions,
                      onDataUpdate,
                    );
                  }}
                  className={`${(() => {
                    const allEnabled = days.every((day, idx) => {
                      const uniqueKey = generateKey.restriction(
                        "CTD",
                        idx,
                        roomType,
                        ratePlanType,
                      );
                      const ratePlan = day.ratePlans?.find(
                        (rp) => rp.ratePlanCode === ratePlanType,
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

            {/* ✅ BULK MIN LOS with Input */}
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
                          "min",
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
                      // toast.success("Bulk Min LOS applied to all dates");
                    }
                  }}
                />
              </div>
            </div>

            {/* ✅ BULK MAX LOS with Input */}
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
                          "max",
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
                      // toast.success("Bulk Max LOS applied to all dates");
                    }
                  }}
                />
              </div>
            </div>
            {/* Cut-off Unit Toggle — applies to bulk inputs below */}
            <div className="h-10 flex border-b border-gray-300">
              <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-purple-100">
                <span className="font-semibold text-purple-700 text-xs">
                  Bulk Cut-off Unit
                </span>
              </div>
              <div className="w-40 flex items-center justify-center px-2 bg-purple-100">
                <div className="flex rounded-md overflow-hidden border border-purple-300">
                  <button
                    onClick={() => state.setCutoffUnit("hours")}
                    className={`px-2 py-0.5 text-[10px] font-semibold transition-colors ${state.cutoffUnit === "hours" ? "bg-purple-600 text-white" : "bg-white text-purple-600 hover:bg-purple-50"}`}
                  >
                    Hours
                  </button>
                  <button
                    onClick={() => state.setCutoffUnit("days")}
                    className={`px-2 py-0.5 text-[10px] font-semibold transition-colors ${state.cutoffUnit === "days" ? "bg-purple-600 text-white" : "bg-white text-purple-600 hover:bg-purple-50"}`}
                  >
                    Days
                  </button>
                </div>
              </div>
            </div>
            {/* Max Booking  Cut-off */}
            <div className="h-20 flex border-b border-gray-300">
              <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-purple-50">
                <span className="font-semibold text-purple-700 text-xs">
                  Max Booking Cut-off
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
                      const newEdits = new Map(state.bookingOffsetEdits);
                      const newPending = new Set(state.pendingChanges);
                      days.forEach((_, idx) => {
                        const key = generateKey.bookingOffset(
                          roomType,
                          ratePlanType,
                          idx,
                          "maximumAdvanceBookingOffset",
                        );
                        newEdits.set(key, {
                          roomType,
                          ratePlan: ratePlanType,
                          dayIndex: idx,
                          field: "maximumAdvanceBookingOffset",
                          value:
                            state.cutoffUnit === "days"
                              ? String(Number(e.target.value) * 24)
                              : e.target.value,
                        });
                        newPending.add(key);
                      });
                      state.setBookingOffsetEdits(newEdits);
                      state.setPendingChanges(newPending);
                    }
                  }}
                />
              </div>
            </div>
            {/* Min Booking Cut-off */}
            <div className="h-20 flex border-b border-gray-300">
              <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-purple-50">
                <span className="font-semibold text-purple-700 text-xs">
                  {" "}
                  Min Booking Cut-off
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
                      const newEdits = new Map(state.bookingOffsetEdits);
                      const newPending = new Set(state.pendingChanges);
                      days.forEach((_, idx) => {
                        const key = generateKey.bookingOffset(
                          roomType,
                          ratePlanType,
                          idx,
                          "minimumAdvanceBookingOffset",
                        );
                        newEdits.set(key, {
                          roomType,
                          ratePlan: ratePlanType,
                          dayIndex: idx,
                          field: "minimumAdvanceBookingOffset",
                          value:
                            state.cutoffUnit === "days"
                              ? String(Number(e.target.value) * 24)
                              : e.target.value,
                        });
                        newPending.add(key);
                      });
                      state.setBookingOffsetEdits(newEdits);
                      state.setPendingChanges(newPending);
                    }
                  }}
                />
              </div>
            </div>
            {/* Max Booking Amend Cut-off */}
            <div className="h-20 flex border-b border-gray-300">
              <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-purple-50">
                <span className="font-semibold text-purple-700 text-xs">
                  Max Booking Amend Cut-off
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
                      const newEdits = new Map(state.bookingOffsetEdits);
                      const newPending = new Set(state.pendingChanges);
                      days.forEach((_, idx) => {
                        const key = generateKey.bookingOffset(
                          roomType,
                          ratePlanType,
                          idx,
                          "maximumAmendBookingOffset",
                        );
                        newEdits.set(key, {
                          roomType,
                          ratePlan: ratePlanType,
                          dayIndex: idx,
                          field: "maximumAmendBookingOffset",
                          value:
                            state.cutoffUnit === "days"
                              ? String(Number(e.target.value) * 24)
                              : e.target.value,
                        });
                        newPending.add(key);
                      });
                      state.setBookingOffsetEdits(newEdits);
                      state.setPendingChanges(newPending);
                    }
                  }}
                />
              </div>
            </div>
            {/* Min Booking Amend Cut-off */}
            <div className="h-20 flex border-b border-gray-300">
              <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-purple-50">
                <span className="font-semibold text-purple-700 text-xs">
                  {" "}
                  Min Booking Amend Cut-off
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
                      const newEdits = new Map(state.bookingOffsetEdits);
                      const newPending = new Set(state.pendingChanges);
                      days.forEach((_, idx) => {
                        const key = generateKey.bookingOffset(
                          roomType,
                          ratePlanType,
                          idx,
                          "minimumAmendBookingOffset",
                        );
                        newEdits.set(key, {
                          roomType,
                          ratePlan: ratePlanType,
                          dayIndex: idx,
                          field: "minimumAmendBookingOffset",
                          value:
                            state.cutoffUnit === "days"
                              ? String(Number(e.target.value) * 24)
                              : e.target.value,
                        });
                        newPending.add(key);
                      });
                      state.setBookingOffsetEdits(newEdits);
                      state.setPendingChanges(newPending);
                    }
                  }}
                />
              </div>
            </div>
            {/* Max Booking Cancel Cut-off */}
            <div className="h-20 flex border-b border-gray-300">
              <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-purple-50">
                <span className="font-semibold text-purple-700 text-xs">
                  Max Booking Cancel Cut-off
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
                      const newEdits = new Map(state.bookingOffsetEdits);
                      const newPending = new Set(state.pendingChanges);
                      days.forEach((_, idx) => {
                        const key = generateKey.bookingOffset(
                          roomType,
                          ratePlanType,
                          idx,
                          "maximumCancelBookingOffset",
                        );
                        newEdits.set(key, {
                          roomType,
                          ratePlan: ratePlanType,
                          dayIndex: idx,
                          field: "maximumCancelBookingOffset",
                          value:
                            state.cutoffUnit === "days"
                              ? String(Number(e.target.value) * 24)
                              : e.target.value,
                        });
                        newPending.add(key);
                      });
                      state.setBookingOffsetEdits(newEdits);
                      state.setPendingChanges(newPending);
                    }
                  }}
                />
              </div>
            </div>
            {/* Min Booking Cancel Cut-off */}
            <div className="h-20 flex border-b border-gray-300">
              <div className="w-40 flex items-center px-2 border-r border-gray-300 bg-purple-50">
                <span className="font-semibold text-purple-700 text-xs">
                  {" "}
                  Min Booking Cancel Cut-off
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
                      const newEdits = new Map(state.bookingOffsetEdits);
                      const newPending = new Set(state.pendingChanges);
                      days.forEach((_, idx) => {
                        const key = generateKey.bookingOffset(
                          roomType,
                          ratePlanType,
                          idx,
                          "minimumCancelBookingOffset",
                        );
                        newEdits.set(key, {
                          roomType,
                          ratePlan: ratePlanType,
                          dayIndex: idx,
                          field: "minimumCancelBookingOffset",
                          value:
                            state.cutoffUnit === "days"
                              ? String(Number(e.target.value) * 24)
                              : e.target.value,
                        });
                        newPending.add(key);
                      });
                      state.setBookingOffsetEdits(newEdits);
                      state.setPendingChanges(newPending);
                    }
                  }}
                />
              </div>
            </div>
            {/* ✅ NEW: Save Button Label in LEFT COLUMN */}
            {(Array.from(state.pendingChanges) as string[]).some(
              (k) =>
                k.includes(`${roomType}-${ratePlanType}-`) &&
                (k.includes("-min") || k.includes("-max")),
            ) && (
                <div className="h-12 flex items-center px-2 border-b border-gray-300 bg-green-50">
                  <span className="font-semibold text-green-700 text-xs">
                    Save Rate Plan Changes
                  </span>
                </div>
              )}
          </>
        )}
      </>
    );
  }

  // DATA MODE
  return (
    <>
      {/* Rate Plan Price Row */}
      <div
        className={`flex ${isExpanded ? "h-14" : "h-20"} border-b border-gray-300`}
      >
        {days.map((day, index) => {
          const ratePlanDetails = getRatePlanDetails(
            day,
            roomType,
            ratePlanType,
          );

          return (
            <div
              key={index}
              className={`${isExpanded ? "h-14" : "h-20"} w-32 flex-shrink-0 flex flex-col items-center justify-center py-1.5 border-r border-b border-gray-300 bg-white text-xs`}
            >
              <>
                <div className="flex items-center justify-center mb-1">
                  <Switch
                    checked={(() => {
                      const ratePlanDetails = getRatePlanDetails(
                        day,
                        roomType,
                        ratePlanType,
                      );
                      return (
                        ratePlanDetails?.ratePlan?.prices?.[0]?.sellStatus ===
                        "open"
                      );
                    })()}
                    onCheckedChange={async (checked) => {
                      try {
                        const dateStr = formatDateForStartStop(day);
                        const response = await useStartStopSellService(
                          propertyId,
                          {
                            from: dateStr,
                            to: dateStr,
                            ratePlanCode: ratePlanType,
                            roomTypeCode: roomType,
                            isSellStop: !checked,
                          },
                        );

                        if (response.success) {
                          toast.success(
                            `Rate plan ${checked ? "opened" : "closed"} for ${day.month.slice(0, 3)} ${day.date}`,
                          );
                          if (onDataUpdate) await onDataUpdate();
                        } else {
                          throw new Error(response.message);
                        }
                      } catch (error: any) {
                        console.error(
                          "Failed to update rate plan status:",
                          error,
                        );
                        toast.error(
                          error.message || "Failed to update rate plan status",
                        );
                      }
                    }}
                    className={`${(() => {
                      const ratePlanDetails = getRatePlanDetails(
                        day,
                        roomType,
                        ratePlanType,
                      );
                      const isOpen =
                        ratePlanDetails?.ratePlan?.prices?.[0]?.sellStatus ===
                        "open";
                      return isOpen
                        ? "data-[state=checked]:bg-green-500"
                        : "data-[state=unchecked]:bg-red-500";
                    })()} scale-50`}
                    disabled={!ratePlanDetails}
                  />
                </div>

                {(() => {
                  const baseByGuest = ratePlanDetails?.baseByGuestAmts;
                  const hasBaseByGuest = baseByGuest && baseByGuest.length > 0;

                  if (isExpanded) {
                    return (
                      <span
                        className={`text-xs font-medium ${ratePlanDetails?.ratePlan?.prices?.[0]?.sellStatus ===
                          "open"
                          ? "text-green-600"
                          : "text-red-600"
                          }`}
                      >
                        {ratePlanDetails?.ratePlan?.prices?.[0]?.sellStatus ===
                          "open"
                          ? "Open"
                          : "Closed"}
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
                            : (ratePlanDetails?.price ?? 0)
                        }
                        currencyCode={ratePlanDetails?.currencyCode ?? "USD"}
                        numberOfGuests={
                          hasBaseByGuest
                            ? baseByGuest[0].numberOfGuests
                            : undefined
                        }
                        ageQualifyingCode={
                          hasBaseByGuest
                            ? baseByGuest[0].ageQualifyingCode || "10"
                            : "10"
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
                        onPriceChange={(rt, rp, di, val, ng, aqc) =>
                          handlePriceInputChange(
                            rt,
                            rp,
                            di,
                            val,
                            ng,
                            state.priceEdits,
                            state.pendingChanges,
                            state.setPriceEdits,
                            state.setPendingChanges,
                            aqc,
                          )
                        }
                        onApplyToRow={(rt, rp, di, ng, aqc) =>
                          applyPriceToRow(
                            rt,
                            rp,
                            di,
                            ng,
                            days,
                            state.priceEdits,
                            state.pendingChanges,
                            state.setPriceEdits,
                            state.setPendingChanges,
                            aqc,
                          )
                        }
                      />
                    </div>
                  );
                })()}
              </>
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
                  ratePlanType,
                );
                const tierData = ratePlanDetails?.baseByGuestAmts?.find(
                  (t: any) =>
                    t.numberOfGuests === guestTier.numberOfGuests &&
                    t.ageQualifyingCode === guestTier.ageQualifyingCode,
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
                      ageQualifyingCode={guestTier.ageQualifyingCode || "10"}
                      showOnlyInput={true}
                      priceEdits={state.priceEdits}
                      commissionAmount={tierData?.commissionAmount || 0}
                      totalAfterCommission={
                        tierData?.amountAfterCommission || 0
                      }
                      pendingChanges={state.pendingChanges}
                      generateKey={generateKey.price}
                      onPriceChange={(rt, rp, di, val, ng, aqc) =>
                        handlePriceInputChange(
                          rt,
                          rp,
                          di,
                          val,
                          ng,
                          state.priceEdits,
                          state.pendingChanges,
                          state.setPriceEdits,
                          state.setPendingChanges,
                          aqc,
                        )
                      }
                      onApplyToRow={(rt, rp, di, ng, aqc) =>
                        applyPriceToRow(
                          rt,
                          rp,
                          di,
                          ng,
                          days,
                          state.priceEdits,
                          state.pendingChanges,
                          state.setPriceEdits,
                          state.setPendingChanges,
                          aqc,
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
                    ratePlanType,
                  );
                  const hasData = (ratePlanDetails?.additionalGuestAmounts?.length ?? 0) > 0;
                  const chargeData = hasData
                    ? ratePlanDetails?.additionalGuestAmounts?.find(
                      (c: any) => c.ageQualifyingCode === charge.ageCode,
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
                        totalAfterCommission={
                          chargeData?.amountAfterCommission || 0
                        }
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
                            state.setPendingChanges,
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
                            state.setPendingChanges,
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
                ratePlanType,
              );
              const ratePlan = day.ratePlans?.find(
                (rp) => rp.ratePlanCode === ratePlanType,
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
                    onCheckedChange={() =>
                      handleRatePlanRestrictionToggle(
                        roomType,
                        ratePlanType,
                        index,
                        "CTA",
                        effectiveValue,
                        days,
                        hotelCode,
                        state.optimisticRestrictions,
                        state.setOptimisticRestrictions,
                        onDataUpdate,
                      )
                    }
                    className={`${effectiveValue
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
                ratePlanType,
              );
              const ratePlan = day.ratePlans?.find(
                (rp) => rp.ratePlanCode === ratePlanType,
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
                    onCheckedChange={() =>
                      handleRatePlanRestrictionToggle(
                        roomType,
                        ratePlanType,
                        index,
                        "CTD",
                        effectiveValue,
                        days,
                        hotelCode,
                        state.optimisticRestrictions,
                        state.setOptimisticRestrictions,
                        onDataUpdate,
                      )
                    }
                    className={`${effectiveValue
                      ? "data-[state=checked]:bg-red-500"
                      : "data-[state=unchecked]:bg-gray-300"
                      } scale-50`}
                  />
                </div>
              );
            })}
          </div>

          {/* ✅ Min LOS Data */}
          <div className="flex h-12 border-b border-gray-300">
            {days.map((day, index) => {
              const ratePlan = day.ratePlans?.find(
                (rp: any) => rp.ratePlanCode === ratePlanType,
              );
              const apiValue = ratePlan?.minLengthOfStay || 0;
              const editKey = generateKey.los(
                roomType,
                ratePlanType,
                index,
                "min",
              );
              const edit = state.losEdits.get(editKey);
              const displayValue = edit ? edit.value : `${apiValue}`;
              const hasChanges = state.pendingChanges.has(editKey);

              return (
                <div
                  key={index}
                  className={`h-12 w-32 flex-shrink-0 flex items-center justify-center border-r border-b border-gray-300 px-1 ${hasChanges ? "bg-orange-50" : "bg-purple-50"}`}
                >
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={displayValue}
                      onChange={(e) => {
                        const newEdits = new Map(state.losEdits);
                        const newPending = new Set(state.pendingChanges);
                        newEdits.set(editKey, {
                          roomType,
                          ratePlan: ratePlanType,
                          dayIndex: index,
                          type: "min",
                          value: e.target.value,
                        });
                        newPending.add(editKey);
                        state.setLosEdits(newEdits);
                        state.setPendingChanges(newPending);
                      }}
                      className={`w-14 h-7 text-center text-xs font-bold rounded border ${hasChanges
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-purple-400`}
                    />
                    {edit && (
                      <button
                        onClick={() => {
                          const newEdits = new Map(state.losEdits);
                          const newPending = new Set(state.pendingChanges);
                          days.forEach((_, idx) => {
                            if (idx >= index) {
                              const rowKey = generateKey.los(
                                roomType,
                                ratePlanType,
                                idx,
                                "min",
                              );
                              newEdits.set(rowKey, {
                                roomType,
                                ratePlan: ratePlanType,
                                dayIndex: idx,
                                type: "min",
                                value: edit.value,
                              });
                              newPending.add(rowKey);
                            }
                          });
                          state.setLosEdits(newEdits);
                          state.setPendingChanges(newPending);
                        }}
                        className="p-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex-shrink-0"
                        title="Apply to remaining dates"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ✅ Max LOS Data */}
          <div className="flex h-12 border-b border-gray-300">
            {days.map((day, index) => {
              const ratePlan = day.ratePlans?.find(
                (rp: any) => rp.ratePlanCode === ratePlanType,
              );
              const apiValue = ratePlan?.maxLengthOfStay || 0;
              const editKey = generateKey.los(
                roomType,
                ratePlanType,
                index,
                "max",
              );
              const edit = state.losEdits.get(editKey);
              const displayValue = edit ? edit.value : `${apiValue}`;
              const hasChanges = state.pendingChanges.has(editKey);

              return (
                <div
                  key={index}
                  className={`h-12 w-32 flex-shrink-0 flex items-center justify-center border-r border-b border-gray-300 px-1 ${hasChanges ? "bg-orange-50" : "bg-purple-50"}`}
                >
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={displayValue}
                      onChange={(e) => {
                        const newEdits = new Map(state.losEdits);
                        const newPending = new Set(state.pendingChanges);
                        newEdits.set(editKey, {
                          roomType,
                          ratePlan: ratePlanType,
                          dayIndex: index,
                          type: "max",
                          value: e.target.value,
                        });
                        newPending.add(editKey);
                        state.setLosEdits(newEdits);
                        state.setPendingChanges(newPending);
                      }}
                      className={`w-14 h-7 text-center text-xs font-bold rounded border ${hasChanges
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-purple-400`}
                    />
                    {edit && (
                      <button
                        onClick={() => {
                          const newEdits = new Map(state.losEdits);
                          const newPending = new Set(state.pendingChanges);
                          days.forEach((_, idx) => {
                            if (idx >= index) {
                              const rowKey = generateKey.los(
                                roomType,
                                ratePlanType,
                                idx,
                                "max",
                              );
                              newEdits.set(rowKey, {
                                roomType,
                                ratePlan: ratePlanType,
                                dayIndex: idx,
                                type: "max",
                                value: edit.value,
                              });
                              newPending.add(rowKey);
                            }
                          });
                          state.setLosEdits(newEdits);
                          state.setPendingChanges(newPending);
                        }}
                        className="p-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex-shrink-0"
                        title="Apply to remaining dates"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cut-off Unit Toggle Spacer (data side) */}
          {/* Cut-off section header — each cell has its own Hr/Day selector */}
          <div className="flex h-10 border-b border-gray-300 bg-purple-100">
            {days.map((_, index) => (
              <div
                key={index}
                className="w-32 flex-shrink-0 border-r border-gray-300 flex items-center justify-center"
              >
                <span className="text-[9px] text-purple-600 font-medium italic">
                  Hr / Day per cell
                </span>
              </div>
            ))}
          </div>

          {/* Max Booking Cut-off Data */}
          <div className="flex h-20 border-b border-gray-300">
            {days.map((day, index) => renderOffsetCell(day, index, "maximumAdvanceBookingOffset"))}
          </div>

          {/* Min Booking Cut-off Data */}
          <div className="flex h-20 border-b border-gray-300">
            {days.map((day, index) => renderOffsetCell(day, index, "minimumAdvanceBookingOffset"))}
          </div>

          {/* Max Booking Amend Cut-off Data */}
          <div className="flex h-20 border-b border-gray-300">
            {days.map((day, index) => renderOffsetCell(day, index, "maximumAmendBookingOffset"))}
          </div>

          {/* Min Booking Amend Cut-off Data */}
          <div className="flex h-20 border-b border-gray-300">
            {days.map((day, index) => renderOffsetCell(day, index, "minimumAmendBookingOffset"))}
          </div>

          {/* Max Booking Cancel Cut-off Data */}
          <div className="flex h-20 border-b border-gray-300">
            {days.map((day, index) => renderOffsetCell(day, index, "maximumCancelBookingOffset"))}
          </div>

          {/* Min Booking Cancel Cut-off Data */}
          <div className="flex h-20 border-b border-gray-300">
            {days.map((day, index) => renderOffsetCell(day, index, "minimumCancelBookingOffset"))}
          </div>

          {/* ✅ Save Button Row - DATA SECTION */}
          {(Array.from(state.pendingChanges) as string[]).some(
            (k) =>
              k.includes(`${roomType}-${ratePlanType}-`) &&
              (k.includes("-min") ||
                k.includes("-max") ||
                k.includes("-bookingOffset-")),
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
                    onClick={async () => {
                      // Save LOS changes if any
                      const hasLOS = (
                        Array.from(state.pendingChanges) as string[]
                      ).some(
                        (k) =>
                          k.includes(`${roomType}-${ratePlanType}-`) &&
                          (k.includes("-min") || k.includes("-max")) &&
                          !k.includes("-bookingOffset-"),
                      );
                      if (hasLOS) {
                        await saveLOSChanges(
                          roomType,
                          ratePlanType,
                          days,
                          state.losEdits,
                          state.pendingChanges,
                          hotelCode,
                          ratePlanType,
                          state.setLosEdits,
                          state.setPendingChanges,
                          onDataUpdate,
                        );
                      }
                      // Save booking offset changes if any
                      const hasOffsets = (
                        Array.from(state.pendingChanges) as string[]
                      ).some(
                        (k) =>
                          k.includes(`${roomType}-${ratePlanType}-`) &&
                          k.includes("-bookingOffset-"),
                      );
                      if (hasOffsets) {
                        const ratePlanId = ratePlanMap[ratePlanType];
                        if (!ratePlanId) {
                          toast.error(
                            `No rate plan ID found for ${ratePlanType}`,
                          );
                          return;
                        }
                        await saveBookingOffsetChanges(
                          roomType,
                          ratePlanType,
                          days,
                          state.bookingOffsetEdits,
                          state.pendingChanges,
                          propertyId,
                          ratePlanId,
                          state.setBookingOffsetEdits,
                          state.setPendingChanges,
                          onDataUpdate,
                        );
                      }
                    }}
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
