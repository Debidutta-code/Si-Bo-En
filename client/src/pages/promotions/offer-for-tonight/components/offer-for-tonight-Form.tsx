import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  CreateOfferForTonight,
  OfferForTonightWithRatePlan,
  RoomRatePlanPair,
} from "../interfaces";
import { Clock } from "lucide-react";
import type { ILoader } from "@/pages/dashboard/interface";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import { Label } from "@/components/ui/label";
import { currencies } from "@/components/currency-code/cuurency";

interface OfferForTonightFormProps {
  ratePlans: RatePlan[];
  roomTypes: RoomTypes[];
  propertyId: string;
  onSubmit: (payload: CreateOfferForTonight) => Promise<void>;
  onCancel: () => void;
  editData?: OfferForTonightWithRatePlan | null;
  isLoading: ILoader;
}

const defaultPromotion = (propertyId: string): CreateOfferForTonight => ({
  propertyId,
  promotionType: "offer_for_tonight",
  promotionName: "",
  discountType: "percentage",
  discountValue: 10,
  currencyCode: "USD" as CurrencyCode,
  validFrom: new Date(),
  validTo: null,
  roomRatePlans: [],
  monApplicable: true,
  tueApplicable: true,
  wedApplicable: true,
  thuApplicable: true,
  friApplicable: true,
  satApplicable: true,
  sunApplicable: true,
  isAutoApplied: false,
  isActive: false,
});

const OfferForTonightForm: React.FC<OfferForTonightFormProps> = ({
  ratePlans,
  roomTypes,
  propertyId,
  onSubmit,
  onCancel,
  editData,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [offerForTonight, setOfferForTonight] = useState<CreateOfferForTonight>(
    defaultPromotion(propertyId),
  );

  // UI-only states
  const [hasEndDate, setHasEndDate] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<"all" | "specific">("all");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedRatePlans, setSelectedRatePlans] = useState<string[]>([]);
  const [bookingTimeFrom, setBookingTimeFrom] = useState<string>("12:00");
  const [bookingTimeTo, setBookingTimeTo] = useState<string>("18:00");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Helper to get applicableDays as an object for the UI
  const applicableDays = {
    monday: offerForTonight.monApplicable,
    tuesday: offerForTonight.tueApplicable,
    wednesday: offerForTonight.wedApplicable,
    thursday: offerForTonight.thuApplicable,
    friday: offerForTonight.friApplicable,
    saturday: offerForTonight.satApplicable,
    sunday: offerForTonight.sunApplicable,
  };

  const dayToField: Record<string, keyof CreateOfferForTonight> = {
    monday: "monApplicable",
    tuesday: "tueApplicable",
    wednesday: "wedApplicable",
    thursday: "thuApplicable",
    friday: "friApplicable",
    saturday: "satApplicable",
    sunday: "sunApplicable",
  };

  // Set today's date as default start date
  useEffect(() => {
    if (!editData) {
      const today = new Date().toISOString().split("T")[0];
      setStartDate(today);
    }
  }, [editData]);

  useEffect(() => {
    if (editData) {
      setOfferForTonight({
        propertyId,
        promotionType: "offer_for_tonight",
        promotionName: editData.promotionName,
        discountType: editData.discountType,
        discountValue: editData.discountValue,
        currencyCode: editData.currencyCode || ("USD" as CurrencyCode),
        validFrom: new Date(),
        validTo: null,
        roomRatePlans: editData.roomRatePlans || [],
        monApplicable: editData.applicableDays.monday,
        tueApplicable: editData.applicableDays.tuesday,
        wedApplicable: editData.applicableDays.wednesday,
        thuApplicable: editData.applicableDays.thursday,
        friApplicable: editData.applicableDays.friday,
        satApplicable: editData.applicableDays.saturday,
        sunApplicable: editData.applicableDays.sunday,
        isAutoApplied: editData.isAutoApplied,
        isActive: editData.isActive,
      });
      if (editData.validFrom) {
        const fromDate = new Date(editData.validFrom);
        setStartDate(fromDate.toISOString().split("T")[0]);
        setBookingTimeFrom(fromDate.toTimeString().slice(0, 5));
      }
      if (editData.validTo) {
        const toDate = new Date(editData.validTo);
        setEndDate(toDate.toISOString().split("T")[0]);
        setBookingTimeTo(toDate.toTimeString().slice(0, 5));
        setHasEndDate(true);
      }

      // Check if it's "all" mode or specific selection
      if (editData.roomRatePlans && editData.roomRatePlans.length > 0) {
        setSelectionMode("specific");
        const roomIds = [
          ...new Set(
            editData.roomRatePlans
              .map((rp) => rp.roomId)
              .filter((id): id is string => !!id),
          ),
        ];
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

  const handleDayToggle = (day: string) => {
    const field = dayToField[day];
    if (!field) return;
    setOfferForTonight({
      ...offerForTonight,
      [field]: !applicableDays[day as keyof typeof applicableDays],
    });
  };

  const handleSelectAllDays = () => {
    const allSelected = Object.values(applicableDays).every((v) => v);
    setOfferForTonight({
      ...offerForTonight,
      monApplicable: !allSelected,
      tueApplicable: !allSelected,
      wedApplicable: !allSelected,
      thuApplicable: !allSelected,
      friApplicable: !allSelected,
      satApplicable: !allSelected,
      sunApplicable: !allSelected,
    });
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

  // Generate time options (24-hour format)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct roomRatePlans based on selection mode
    let roomRatePlans: RoomRatePlanPair[] = [];

    if (selectionMode === "all") {
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
      if (selectedRooms.length === 0) {
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

    // Combine date and time to create ISO timestamp for validFrom
    const [fromYear, fromMonth, fromDay] = startDate.split('-').map(Number);
    const [fromHour, fromMinute] = bookingTimeFrom.split(':').map(Number);
    const validFromDate = new Date(fromYear, fromMonth - 1, fromDay, fromHour, fromMinute, 0);
    // Pad local offset artificially
    const validFrom = new Date(validFromDate.getTime() - (validFromDate.getTimezoneOffset() * 60000));

    // Combine date and time to create ISO timestamp for validTo
    let validTo: Date | null = null;
    const dateForValidTo = hasEndDate && endDate ? endDate : startDate;
    const [toYear, toMonth, toDay] = dateForValidTo.split('-').map(Number);
    const [toHour, toMinute] = bookingTimeTo.split(':').map(Number);
    const validToDate = new Date(toYear, toMonth - 1, toDay, toHour, toMinute, 0);
    validTo = new Date(validToDate.getTime() - (validToDate.getTimezoneOffset() * 60000));

    const payload: CreateOfferForTonight = {
      ...offerForTonight,
      roomRatePlans,
      currencyCode:
        offerForTonight.discountType === "flat"
          ? offerForTonight.currencyCode
          : undefined,
      validFrom,
      validTo,
    };

    await onSubmit(payload);
  };

  const getDiscountDisplayText = () => {
    if (offerForTonight.discountType === "percentage") {
      return `${offerForTonight.discountValue}% OFF`;
    } else {
      return `${offerForTonight.currencyCode} ${offerForTonight.discountValue} OFF`;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm relative">
      {isLoading.isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <Loader text={isLoading.message} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {editData ? t("OfferForTonightForm.editTitle") : t("OfferForTonightForm.createTitle")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t("OfferForTonightForm.targetDescription")}
          </p>
        </div>

        {/* Available Booking Time */}
        <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-start space-x-2">
            <Clock className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">
                {t("OfferForTonightForm.availableBookingTime")}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {t("OfferForTonightForm.availableBookingTimeDescription")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs text-muted-foreground mb-2">
                {t("OfferForTonightForm.from")}
              </label>
              <Select
                value={bookingTimeFrom}
                onValueChange={setBookingTimeFrom}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map((time) => (
                    <SelectItem key={`from-${time}`} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center pb-2">
              <span className="text-sm text-muted-foreground">{t("OfferForTonightForm.toLabel")}</span>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">
                {t("OfferForTonightForm.toLabel")}
              </label>
              <Select value={bookingTimeTo} onValueChange={setBookingTimeTo}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map((time) => (
                    <SelectItem key={`to-${time}`} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t("OfferForTonightForm.guestsCanBook")}{" "}
              <span className="font-semibold">{bookingTimeFrom}</span> {t("OfferForTonightForm.to")}{" "}
              <span className="font-semibold">{bookingTimeTo}</span> {t("OfferForTonightForm.forSameDay")}
            </p>
          </div>
        </div>

        {/* Room Types and Rate Plans */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">
            {t("OfferForTonightForm.roomTypesAndRatePlans")}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t("OfferForTonightForm.roomTypesDescription")}
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
                  {t("OfferForTonightForm.allRooms")}
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
                  {t("OfferForTonightForm.specificRooms")}
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
                    {t("OfferForTonightForm.roomTypes")}
                  </label>
                  {!editData && (
                    <button
                      type="button"
                      onClick={handleSelectAllRooms}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      {selectedRooms.length === roomTypes.length
                        ? t("OfferForTonightForm.deselectAll")
                        : t("OfferForTonightForm.selectAll")}
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
                        t("OfferForTonightForm.unknownRoom");

                      return (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-muted/30 border border-border rounded-md"
                        >
                          <div className="text-sm font-medium text-foreground truncate">
                            {room?._translations?.roomName || roomName}
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
                        {t("OfferForTonightForm.noRoomsAvailable")}
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
                              {room._translations?.roomName || room.roomName}
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
                    {t("OfferForTonightForm.leaveEmptyAllRooms")}
                  </p>
                )}
              </div>

              {/* Rate Plans Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t("OfferForTonightForm.ratePlans")}
                  </label>
                  {!editData && (
                    <button
                      type="button"
                      onClick={handleSelectAllRatePlans}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      {selectedRatePlans.length === ratePlans.length
                        ? t("OfferForTonightForm.deselectAll")
                        : t("OfferForTonightForm.selectAll")}
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
                        t("OfferForTonightForm.unknownRatePlan");
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
                            {ratePlan?._translations?.ratePlanName || planName}
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
                        {t("OfferForTonightForm.noRatePlansAvailable")}
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
                              {plan._translations?.ratePlanName || plan.ratePlanName}
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
                          {t("OfferForTonightForm.selectedRatePlansInfo")}{" "}
                          <span className="font-semibold">{t("EarlyBirdForm.allRooms")}</span>
                        </>
                      )}
                    {selectedRooms.length > 0 &&
                      selectedRatePlans.length > 0 && (
                        <>
                          {t("OfferForTonightForm.promotionWillApply")}{" "}
                          <span className="font-semibold">
                            {selectedRooms.length} {t("OfferForTonightForm.roomTypeWith")}
                          </span>{" "}
                          with{" "}
                          <span className="font-semibold">
                            {selectedRatePlans.length} {t("OfferForTonightForm.ratePlanWith")}
                          </span>
                        </>
                      )}
                    {selectedRatePlans.length === 0 && (
                      <span className="text-destructive font-medium">
                        {t("OfferForTonightForm.selectAtLeastOne")}
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
                {t("OfferForTonightForm.willBeAppliedTo")}{" "}
                <span className="font-semibold">
                  {roomTypes.length} {t("OfferForTonightForm.roomTypeWith")}
                </span>{" "}
                {t("EarlyBirdForm.allRooms")}{" "}
                <span className="font-semibold">
                  {ratePlans.length} {t("OfferForTonightForm.ratePlanWith")}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">
            {t("OfferForTonightForm.discountsAndStayDates")}
          </h4>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("OfferForTonightForm.howMuchDiscount")}
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={offerForTonight.discountType === "percentage"}
                  onChange={() =>
                    setOfferForTonight({
                      ...offerForTonight,
                      discountType: "percentage",
                    })
                  }
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  {t("OfferForTonightForm.percentageDiscount")}
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={offerForTonight.discountType === "flat"}
                  onChange={() =>
                    setOfferForTonight({
                      ...offerForTonight,
                      discountType: "flat",
                    })
                  }
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  {t("OfferForTonightForm.fixedAmountDiscount")}
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("OfferForTonightForm.discountValue")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={offerForTonight.discountValue}
                  onChange={(e) =>
                    setOfferForTonight({
                      ...offerForTonight,
                      discountValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="1"
                  max={
                    offerForTonight.discountType === "percentage"
                      ? "100"
                      : undefined
                  }
                  step={
                    offerForTonight.discountType === "percentage" ? "1" : "0.01"
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-12"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                  {offerForTonight.discountType === "percentage"
                    ? "% off"
                    : offerForTonight.currencyCode}
                </span>
              </div>
            </div>

            {offerForTonight.discountType === "flat" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="currencyCode">{t("Common.currency")}</Label>
                  <Select
                    value={offerForTonight.currencyCode}
                    onValueChange={(value) => setOfferForTonight({ ...offerForTonight, currencyCode: value as CurrencyCode })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.name} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
              {t("OfferForTonightForm.discountPreview")}
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
              {t("OfferForTonightForm.stayDates")}
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  {t("OfferForTonightForm.startDateLabel")}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("OfferForTonightForm.defaultPromotionApplies")}{" "}
                  {bookingTimeFrom} {t("OfferForTonightForm.to")} {bookingTimeTo})
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasEndDate"
                  checked={hasEndDate}
                  onChange={(e) => {
                    setHasEndDate(e.target.checked);
                    if (!e.target.checked) setEndDate("");
                  }}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <label
                  htmlFor="hasEndDate"
                  className="text-sm text-foreground cursor-pointer"
                >
                  {t("OfferForTonightForm.applyMultipleDates")}
                </label>
              </div>

              {hasEndDate && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    {t("OfferForTonightForm.endDate")}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("OfferForTonightForm.promotionWillApplyFrom")} {startDate} {t("OfferForTonightForm.to")}{" "}
                    {endDate || t("OfferForTonightForm.endDateLabel")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Days Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">
                {t("OfferForTonightForm.whichDaysInclude")}
              </label>
              <button
                type="button"
                onClick={handleSelectAllDays}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                {Object.values(applicableDays).every((v) => v)
                  ? t("OfferForTonightForm.deselectAll")
                  : t("OfferForTonightForm.selectAll")}
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
                    onChange={() => handleDayToggle(day)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground capitalize">
                    {t(`Days.${day}`)}
                  </span>
                </label>
              ))}
            </div>

            {Object.values(applicableDays).some((v) => v) && (
              <div className="mt-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {t("OfferForTonightForm.promotionWillBeActive")}
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mt-1">
                  {getDiscountDisplayText()}:
                  {hasEndDate && endDate ? (
                    <>
                      {" "}
                      {t("OfferForTonightForm.validFrom")} {startDate} {t("OfferForTonightForm.to")} {endDate}
                    </>
                  ) : (
                    <>
                      {" "}
                      {t("OfferForTonightForm.validOn")} {startDate} ({bookingTimeFrom} - {bookingTimeTo})
                    </>
                  )}
                  , {t("OfferForTonightForm.including")} {getActiveDaysSummary()}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Promotion Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            {t("OfferForTonightForm.promotionName")}
          </label>
          <p className="text-xs text-muted-foreground">
            {t("OfferForTonightForm.promotionNameDescription")}
          </p>
          <p className="text-xs text-muted-foreground italic">
            {t("OfferForTonightForm.promotionNameHint")}
          </p>
          <input
            type="text"
            value={offerForTonight.promotionName}
            onChange={(e) =>
              setOfferForTonight({
                ...offerForTonight,
                promotionName: e.target.value,
              })
            }
            placeholder={`${getDiscountDisplayText()} - Offer For Tonight - ${startDate || t("OfferForTonightForm.startDateLabel")}`}
            className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            required
          />
        </div>
        {/* Auto Applied Toggle */}
        <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
          <input
            type="checkbox"
            id="isAutoApplied"
            checked={offerForTonight.isAutoApplied}
            onChange={(e) =>
              setOfferForTonight({
                ...offerForTonight,
                isAutoApplied: e.target.checked,
              })
            }
            className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
          />
          <label
            htmlFor="isAutoApplied"
            className="text-sm font-medium text-foreground cursor-pointer flex-1"
          >
            {t("OfferForTonightForm.autoApplied")}
            <span className="block text-xs text-muted-foreground font-normal mt-0.5">
              {offerForTonight.isAutoApplied
                ? t("OfferForTonightForm.autoAppliedDesc")
                : t("OfferForTonightForm.notAutoAppliedDesc")}
            </span>
          </label>
        </div>
        {/* Status Toggle */}
        <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
          <input
            type="checkbox"
            id="isActive"
            checked={offerForTonight?.isActive}
            onChange={(e) =>
              setOfferForTonight({
                ...offerForTonight,
                isActive: e.target.checked,
              })
            }
            className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-foreground cursor-pointer flex-1"
          >
            {t("OfferForTonightForm.activeStatus")}
            <span className="block text-xs text-muted-foreground font-normal mt-0.5">
              {editData?.isActive
                ? t("OfferForTonightForm.activeDesc")
                : t("OfferForTonightForm.inactiveDesc")}
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
            disabled={isLoading.isLoading}
          >
            {t("OfferForTonightForm.cancel")}
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            disabled={
              isLoading.isLoading ||
              !offerForTonight.promotionName ||
              !startDate ||
              (selectionMode === "specific" &&
                selectedRatePlans.length === 0) ||
              !Object.values(applicableDays).some((v) => v)
            }
          >
            {editData ? t("OfferForTonightForm.updatePromotion") : t("OfferForTonightForm.createPromotion")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferForTonightForm;
