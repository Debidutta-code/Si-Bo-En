import React, { useState, useEffect } from "react";
import type { RatePlan } from "@/pages/rate-plan/interfaces";
import type { RoomTypes } from "@/pages/inventory/types";
import Loader from "@/components/Loader/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CreateEarlyBirdPromotion,
  EarlyBirdPromotionWithRatePlan,
  DiscountType,
  RoomRatePlanPair,
} from "../interfaces";
import { Calendar } from "lucide-react";
import type { CurrencyCode } from "../../device-specific/interfaces";

interface EarlyBirdPromotionFormProps {
  ratePlans: RatePlan[];
  roomTypes: RoomTypes[];
  propertyId: string;
  onSubmit: (payload: CreateEarlyBirdPromotion) => Promise<void>;
  onCancel: () => void;
  editData?: EarlyBirdPromotionWithRatePlan | null;
  isLoading: boolean;
}

const EarlyBirdPromotionForm: React.FC<EarlyBirdPromotionFormProps> = ({
  ratePlans,
  roomTypes,
  propertyId,
  onSubmit,
  onCancel,
  editData,
  isLoading,
}) => {
  const [promotionName, setPromotionName] = useState<string>("");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<string>("10");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("USD");
  const [validFrom, setValidFrom] = useState<string>("");
  const [validTo, setValidTo] = useState<string>("");
  const [hasEndDate, setHasEndDate] = useState<boolean>(false);
  const [advanceBookingDays, setAdvanceBookingDays] = useState<string>("7");
  const [isActive, setIsActive] = useState(true);
  const [isAutoApplied, setIsAutoApplied] = useState<boolean>(false);
  // Room and Rate Plan Selection
  const [selectionMode, setSelectionMode] = useState<"all" | "specific">("all");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedRatePlans, setSelectedRatePlans] = useState<string[]>([]);

  const [applicableDays, setApplicableDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });

  useEffect(() => {
    if (editData) {
      setPromotionName(editData.promotionName);
      setDiscountType(editData.DiscountType);
      setDiscountValue(editData.DiscountValue.toString());
      setCurrencyCode(editData.currencyCode || "USD");
      setValidFrom(
        editData.validFrom
          ? new Date(editData.validFrom).toISOString().split("T")[0]
          : "",
      );
      setValidTo(
        editData.validTo
          ? new Date(editData.validTo).toISOString().split("T")[0]
          : "",
      );
      setHasEndDate(!!editData.validTo);
      setApplicableDays(editData.applicableDays);
      setIsActive(editData.isActive);
      setAdvanceBookingDays(editData.advanceBookingDays?.toString() || "7");

      // Check if it's "all" mode or specific selection
      if (editData.roomRatePlans && editData.roomRatePlans.length > 0) {
        setSelectionMode("specific");

        // Extract unique room IDs
        const roomIds = [
          ...new Set(
            editData.roomRatePlans
              .map((rp) => rp.roomId)
              .filter((id): id is string => !!id),
          ),
        ];

        // Extract unique rate plan IDs
        const ratePlanIds = [
          ...new Set(
            editData.roomRatePlans
              .map((rp) => rp.ratePlanId)
              .filter((id): id is string => !!id),
          ),
        ];

        setSelectedRooms(roomIds);
        setSelectedRatePlans(ratePlanIds);
      }
    }
  }, [editData]);

  const handleSelectAllRooms = () => {
    if (selectedRooms.length === roomTypes.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(roomTypes.map((room) => room.id));
    }
  };

  const handleSelectAllRatePlans = () => {
    if (selectedRatePlans.length === ratePlans.length) {
      setSelectedRatePlans([]);
    } else {
      setSelectedRatePlans(ratePlans.map((plan) => plan.id));
    }
  };

  const handleDayToggle = (day: keyof typeof applicableDays) => {
    setApplicableDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleSelectAllDays = () => {
    const allSelected = Object.values(applicableDays).every((v) => v);
    const newState = {
      monday: !allSelected,
      tuesday: !allSelected,
      wednesday: !allSelected,
      thursday: !allSelected,
      friday: !allSelected,
      saturday: !allSelected,
      sunday: !allSelected,
    };
    setApplicableDays(newState);
  };

  const getActiveDaysSummary = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const activeDays = Object.entries(applicableDays)
      .filter(([_, isActive]) => isActive)
      .map(([day]) => days.find((d) => d.toLowerCase() === day));
    return activeDays.join(", ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct roomRatePlans based on selection mode
    let roomRatePlans: RoomRatePlanPair[] = [];

    if (selectionMode === "all") {
      // Apply to all room types and all rate plans
      roomTypes.forEach((room) => {
        ratePlans.forEach((plan) => {
          roomRatePlans.push({
            roomId: room.id,
            roomType: room.roomType,
            ratePlanId: plan.id,
            ratePlanCode: plan.ratePlanCode,
          });
        });
      });
    } else {
      // Apply to selected rooms and rate plans
      if (selectedRooms.length === 0) {
        // If no rooms selected, apply to all rooms with selected rate plans
        roomTypes.forEach((room) => {
          selectedRatePlans.forEach((planId) => {
            const plan = ratePlans.find((p) => p.id === planId);
            if (plan) {
              roomRatePlans.push({
                roomId: room.id,
                roomType: room.roomType,
                ratePlanId: plan.id,
                ratePlanCode: plan.ratePlanCode,
              });
            }
          });
        });
      } else {
        // Apply to selected rooms and rate plans
        selectedRooms.forEach((roomId) => {
          const room = roomTypes.find((r) => r.id === roomId);
          selectedRatePlans.forEach((planId) => {
            const plan = ratePlans.find((p) => p.id === planId);
            if (room && plan) {
              roomRatePlans.push({
                roomId: room.id,
                roomType: room.roomType,
                ratePlanId: plan.id,
                ratePlanCode: plan.ratePlanCode,
              });
            }
          });
        });
      }
    }

    const payload: CreateEarlyBirdPromotion = {
      propertyId,
      promotionType: "early_bird",
      promotionName,
      discountType,
      discountValue: parseFloat(discountValue),
      currencyCode: discountType === "flat" ? currencyCode : undefined,
      validFrom,
      validTo: hasEndDate ? validTo || null : null,
      roomRatePlans,
      monApplicable: applicableDays.monday,
      tueApplicable: applicableDays.tuesday,
      wedApplicable: applicableDays.wednesday,
      thuApplicable: applicableDays.thursday,
      friApplicable: applicableDays.friday,
      satApplicable: applicableDays.saturday,
      sunApplicable: applicableDays.sunday,
      advanceBookingDays: advanceBookingDays
        ? parseInt(advanceBookingDays)
        : undefined,
        isAutoApplied
    };

    await onSubmit(payload);
  };

  const getDiscountDisplayText = () => {
    if (discountType === "percentage") {
      return `${discountValue}% OFF`;
    } else {
      return `${currencyCode} ${discountValue} OFF`;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <Loader text="Processing..." />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {editData ? "Edit" : "Create"} Early Bird Promotion
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Secure your occupancy in advance with early booking discounts
          </p>
        </div>

        {/* Advance Booking Days */}
        <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-start space-x-2">
            <Calendar className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">
                Advance booking days *
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                How far do guests book in advance in order to use this
                promotion?
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={advanceBookingDays}
              onChange={(e) => setAdvanceBookingDays(e.target.value)}
              min="1"
              className="w-24 px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
            <span className="text-sm text-foreground">Day(s) or more</span>
          </div>

          {advanceBookingDays && parseInt(advanceBookingDays) > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Guests must book at least{" "}
                <span className="font-semibold">
                  {advanceBookingDays} day(s)
                </span>{" "}
                before check-in to qualify for this promotion
              </p>
            </div>
          )}
        </div>

        {/* Room Types and Rate Plans */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">
            Room types and rate plans *
          </h4>
          <p className="text-xs text-muted-foreground">
            Which room types and rate plans will this promotion apply to?
          </p>

          {/* Selection Mode */}
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={selectionMode === "all"}
                  onChange={() => setSelectionMode("all")}
                  disabled={!!editData}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  All room types and corresponding rate plans
                </span>
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={selectionMode === "specific"}
                  onChange={() => setSelectionMode("specific")}
                  disabled={!!editData}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  Select specific room types and rate plans
                </span>
              </label>
            </div>
          </div>

          {/* Show selection if specific mode or edit mode */}
          {(selectionMode === "specific" || editData) && (
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
              {/* Room Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Room Types
                  </label>
                  {!editData && (
                    <button
                      type="button"
                      onClick={handleSelectAllRooms}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      {selectedRooms.length === roomTypes.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  )}
                </div>

                {editData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {[
                      ...new Set(
                        editData.roomRatePlans?.map((rp) => rp.roomId),
                      ),
                    ].map((roomId, idx) => {
                      const room = roomTypes.find((r) => r.id === roomId);
                      const roomName =
                        room?.roomName ||
                        editData.roomRatePlans?.find(
                          (rp) => rp.roomId === roomId,
                        )?.roomType ||
                        "Unknown Room";

                      return (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-muted/30 border border-border rounded-md"
                        >
                          <div className="text-sm font-medium text-foreground truncate">
                            {roomName}
                          </div>
                          {room && (
                            <div className="text-xs text-muted-foreground">
                              ({room.roomType})
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4 bg-background">
                    {roomTypes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4 col-span-full">
                        No rooms available
                      </p>
                    ) : (
                      roomTypes.map((room) => (
                        <label
                          key={room.id}
                          className="flex items-start space-x-3 cursor-pointer hover:bg-muted/50 p-3 rounded-md transition-colors border border-transparent hover:border-border"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRooms.includes(room.id)}
                            onChange={() => {
                              setSelectedRooms((prev) =>
                                prev.includes(room.id)
                                  ? prev.filter((id) => id !== room.id)
                                  : [...prev, room.id],
                              );
                            }}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {room.roomName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ({room.roomType})
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}

                {!editData && selectedRooms.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    Leave empty to apply to all room types
                  </p>
                )}
              </div>

              {/* Rate Plans Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Rate Plans *
                  </label>
                  {!editData && (
                    <button
                      type="button"
                      onClick={handleSelectAllRatePlans}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      {selectedRatePlans.length === ratePlans.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  )}
                </div>

                {editData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {[
                      ...new Set(
                        editData.roomRatePlans?.map((rp) => rp.ratePlanId),
                      ),
                    ].map((ratePlanId, idx) => {
                      const ratePlan = ratePlans.find(
                        (rp) => rp.id === ratePlanId,
                      );
                      const planName =
                        ratePlan?.ratePlanName ||
                        editData.ratePlan?.ratePlanName ||
                        "Unknown Rate Plan";
                      const planCode =
                        ratePlan?.ratePlanCode ||
                        editData.roomRatePlans?.find(
                          (rp) => rp.ratePlanId === ratePlanId,
                        )?.ratePlanCode ||
                        "";

                      return (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-muted/30 border border-border rounded-md"
                        >
                          <div className="text-sm font-medium text-foreground truncate">
                            {planName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ({planCode})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4 bg-background">
                    {ratePlans.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4 col-span-full">
                        No rate plans available
                      </p>
                    ) : (
                      ratePlans.map((plan) => (
                        <label
                          key={plan.id}
                          className="flex items-start space-x-3 cursor-pointer hover:bg-muted/50 p-3 rounded-md transition-colors border border-transparent hover:border-border"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRatePlans.includes(plan.id)}
                            onChange={() => {
                              setSelectedRatePlans((prev) =>
                                prev.includes(plan.id)
                                  ? prev.filter((id) => id !== plan.id)
                                  : [...prev, plan.id],
                              );
                            }}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {plan.ratePlanName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ({plan.ratePlanCode})
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {!editData && selectionMode === "specific" && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {selectedRooms.length === 0 &&
                      selectedRatePlans.length > 0 && (
                        <>
                          Selected rate plans will apply to{" "}
                          <span className="font-semibold">all room types</span>
                        </>
                      )}
                    {selectedRooms.length > 0 &&
                      selectedRatePlans.length > 0 && (
                        <>
                          Promotion will apply to{" "}
                          <span className="font-semibold">
                            {selectedRooms.length} room type(s)
                          </span>{" "}
                          with{" "}
                          <span className="font-semibold">
                            {selectedRatePlans.length} rate plan(s)
                          </span>
                        </>
                      )}
                    {selectedRatePlans.length === 0 && (
                      <span className="text-destructive font-medium">
                        Please select at least one rate plan
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {selectionMode === "all" && !editData && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This promotion will be applied to{" "}
                <span className="font-semibold">
                  all {roomTypes.length} room type(s)
                </span>{" "}
                with{" "}
                <span className="font-semibold">
                  all {ratePlans.length} rate plan(s)
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">
            Discounts and Stay dates
          </h4>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              How much of a discount do you want to give? *
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={discountType === "percentage"}
                  onChange={() => setDiscountType("percentage")}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  Percentage discount
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={discountType === "flat"}
                  onChange={() => setDiscountType("flat")}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  Fixed amount discount
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Discount Value *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  min="1"
                  max={discountType === "percentage" ? "100" : undefined}
                  step={discountType === "percentage" ? "1" : "0.01"}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-12"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                  {discountType === "percentage" ? "% off" : currencyCode}
                </span>
              </div>
            </div>

            {discountType === "flat" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Currency *
                </label>
                <Select
                  value={currencyCode}
                  onValueChange={(value) =>
                    setCurrencyCode(value as CurrencyCode)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
              Discount Preview
            </p>
            <p className="text-lg text-blue-700 dark:text-blue-300 mt-1 font-semibold">
              {getDiscountDisplayText()}
            </p>
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              What dates of stay does the promotion apply to? *
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Valid continuously from start date *
                </label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasEndDate"
                  checked={hasEndDate}
                  onChange={(e) => {
                    setHasEndDate(e.target.checked);
                    if (!e.target.checked) setValidTo("");
                  }}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <label
                  htmlFor="hasEndDate"
                  className="text-sm text-foreground cursor-pointer"
                >
                  Set end date (optional)
                </label>
              </div>

              {hasEndDate && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    min={validFrom}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Days Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">
                Which days would you like to include? *
              </label>
              <button
                type="button"
                onClick={handleSelectAllDays}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                {Object.values(applicableDays).every((v) => v)
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(applicableDays).map(([day, isChecked]) => (
                <label
                  key={day}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      handleDayToggle(day as keyof typeof applicableDays)
                    }
                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground capitalize">
                    {day}
                  </span>
                </label>
              ))}
            </div>

            {Object.values(applicableDays).some((v) => v) && (
              <div className="mt-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Promotion will be active on:
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mt-1">
                  {getDiscountDisplayText()}: Valid from{" "}
                  {validFrom || "start date"}
                  {hasEndDate && validTo ? ` to ${validTo}` : " onwards"},
                  including {getActiveDaysSummary()}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Promotion Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Promotion name *
          </label>
          <p className="text-xs text-muted-foreground">
            What do you want to name this promotion?
          </p>
          <p className="text-xs text-muted-foreground italic">
            This is just for you - users won't be able to see it
          </p>
          <input
            type="text"
            value={promotionName}
            onChange={(e) => setPromotionName(e.target.value)}
            placeholder={`${getDiscountDisplayText()} - Early Bird - ${validFrom || "Start Date"}`}
            className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            required
          />
        </div>

        {/* Status Toggle */}
        <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-foreground cursor-pointer flex-1"
          >
            Active Status
            <span className="block text-xs text-muted-foreground font-normal mt-0.5">
              {isActive
                ? "This promotion is currently active"
                : "This promotion is currently inactive"}
            </span>
          </label>
        </div>
        {/* Status Toggle */}
        <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
          <input
            type="checkbox"
            id="isAutoApplied"
            checked={isAutoApplied}
            onChange={(e) => setIsAutoApplied(e.target.checked)}
            className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
          />
          <label
            htmlFor="isAutoApplied"
            className="text-sm font-medium text-foreground cursor-pointer flex-1"
          >
            Auto Applied
            <span className="block text-xs text-muted-foreground font-normal mt-0.5">
              {isAutoApplied
                ? "This promotion is currently auto-applied"
                : "This promotion is currently not auto-applied"}
            </span>
          </label>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            disabled={
              isLoading ||
              !promotionName ||
              !validFrom ||
              (selectionMode === "specific" &&
                selectedRatePlans.length === 0) ||
              !Object.values(applicableDays).some((v) => v)
            }
          >
            {editData ? "Update Promotion" : "Create Promotion"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EarlyBirdPromotionForm;
