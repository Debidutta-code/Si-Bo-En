import React, { useState, useEffect } from "react";
import type { RatePlan } from "@/pages/rate-plan/interfaces";
import type { RoomTypes } from "@/pages/inventory/types";
import Loader from "@/components/Loader/Loader";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CreateCustomizableDeal,
  CustomizableDeal,
  CurrencyCode,
  ICCustomizableDeals,
} from "../interfaces";
import { Tag } from "lucide-react";
import type { IAddon } from "@/pages/add-on/interface";
import type { ILoader } from "@/pages/dashboard/interface";

interface CustomizableDealFormProps {
  ratePlans: RatePlan[];
  roomTypes: RoomTypes[];
  addons: IAddon[];
  onSubmit: (payload: CreateCustomizableDeal) => Promise<void>;
  onCancel: () => void;
  editData?: CustomizableDeal | null;
  isLoading: ILoader;
}

const CustomizableDealForm: React.FC<CustomizableDealFormProps> = ({
  ratePlans,
  roomTypes,
  addons,
  onSubmit,
  onCancel,
  editData,
  isLoading,
}) => {
  const [customizableDeal, setCustomizableDeal] = useState<ICCustomizableDeals>(
    {
      discountType: "percentage",
      discountValue: 0,
      currencyCode: "USD",
      applicableRoomTypes: [],
      applicableRatePlans: [],
      applicableAddons: [],
      isAutoApplied: false,
    },
  );

  useEffect(() => {
    if (editData) {
      const roomIds = editData.CustomizableDealsApplicableRoomTypes.map(
        (rt) => rt.roomId,
      );
      const ratePlanIds = editData.CustomizableDealsApplicableRatePlanTypes.map(
        (rp) => rp.ratePlanId,
      );
      const addonIds = editData.CustomizableDealsApplicableAddons.map(
        (a) => a.addOnId,
      );

      setCustomizableDeal({
        discountType: editData.discountType,
        discountValue: editData.discountValue,
        currencyCode: editData.currencyCode || "USD",
        applicableRoomTypes: roomIds,
        applicableRatePlans: ratePlanIds,
        applicableAddons: addonIds,
        isAutoApplied: editData.isAutoApplied,
      });
    }
  }, [editData]);

  const handleSelectAllRooms = () => {
    if (customizableDeal.applicableRoomTypes.length === roomTypes.length) {
      setCustomizableDeal({ ...customizableDeal, applicableRoomTypes: [] });
    } else {
      setCustomizableDeal({
        ...customizableDeal,
        applicableRoomTypes: roomTypes.map((room) => room.id),
      });
    }
  };

  const handleSelectAllRatePlans = () => {
    if (customizableDeal.applicableRatePlans.length === ratePlans.length) {
      setCustomizableDeal({ ...customizableDeal, applicableRatePlans: [] });
    } else {
      setCustomizableDeal({
        ...customizableDeal,
        applicableRatePlans: ratePlans.map((plan) => plan.id),
      });
    }
  };

  const handleSelectAllAddons = () => {
    if (customizableDeal.applicableAddons.length === addons.length) {
      setCustomizableDeal({ ...customizableDeal, applicableAddons: [] });
    } else {
      setCustomizableDeal({
        ...customizableDeal,
        applicableAddons: addons.map((addon) => addon.id),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (customizableDeal.discountValue <= 0) {
      toast?.error?.("Please enter a valid discount value greater than 0") ||
        alert("Please enter a valid discount value greater than 0");
      return;
    }

    if (
      customizableDeal.discountType === "percentage" &&
      customizableDeal.discountValue > 100
    ) {
      toast?.error?.("Percentage discount cannot exceed 100") ||
        alert("Percentage discount cannot exceed 100");
      return;
    }

    if (customizableDeal.applicableRoomTypes.length === 0) {
      toast?.error?.("Please select at least one room type") ||
        alert("Please select at least one room type");
      return;
    }

    if (customizableDeal.applicableRatePlans.length === 0) {
      toast?.error?.("Please select at least one rate plan") ||
        alert("Please select at least one rate plan");
      return;
    }

    const payload: CreateCustomizableDeal = {
      discountType: customizableDeal.discountType,
      discountValue: customizableDeal.discountValue,
      currencyCode:
        customizableDeal.discountType === "flat"
          ? customizableDeal.currencyCode
          : undefined,
      applicableRoomTypes: customizableDeal.applicableRoomTypes,
      applicableRatePlans: customizableDeal.applicableRatePlans,
      applicableAddons: customizableDeal.applicableAddons,
      isAutoApplied: customizableDeal.isAutoApplied,
    };

    await onSubmit(payload);
  };

  const getDiscountDisplayText = () => {
    if (customizableDeal.discountType === "percentage") {
      return `${customizableDeal.discountValue}% OFF`;
    } else {
      return `${customizableDeal.currencyCode} ${customizableDeal.discountValue} OFF`;
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
            {editData ? "Edit" : "Create"} Customizable Deal
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create flexible deals by selecting specific room types, rate plans,
            and add-ons
          </p>
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">
            Discount Configuration
          </h4>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Discount Type *
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={customizableDeal.discountType === "percentage"}
                  onChange={() =>
                    setCustomizableDeal({
                      ...customizableDeal,
                      discountType: "percentage",
                    })
                  }
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  Percentage discount
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={customizableDeal.discountType === "flat"}
                  onChange={() =>
                    setCustomizableDeal({
                      ...customizableDeal,
                      discountType: "flat",
                    })
                  }
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
                  value={customizableDeal.discountValue}
                  onChange={(e) =>
                    setCustomizableDeal({
                      ...customizableDeal,
                      discountValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  onKeyDown={(e) => {
                    // Prevent 'e', '+', '-' characters
                    if (
                      e.key === "e" ||
                      e.key === "E" ||
                      e.key === "+" ||
                      e.key === "-"
                    ) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-12"
                  placeholder={
                    customizableDeal.discountType === "percentage"
                      ? "Enter percentage (1-100)"
                      : "Enter amount"
                  }
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                  {customizableDeal.discountType === "percentage"
                    ? "% off"
                    : customizableDeal.currencyCode}
                </span>
              </div>
              {customizableDeal.discountValue <= 0 &&
                customizableDeal.discountValue !== 0 && (
                  <p className="text-xs text-destructive mt-1">
                    Discount value must be greater than 0
                  </p>
                )}
              {customizableDeal.discountType === "percentage" &&
                customizableDeal.discountValue > 100 && (
                  <p className="text-xs text-destructive mt-1">
                    Percentage cannot exceed 100
                  </p>
                )}
            </div>

            {customizableDeal.discountType === "flat" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Currency *
                </label>
                <Select
                  value={customizableDeal.currencyCode}
                  onValueChange={(value) =>
                    setCustomizableDeal({
                      ...customizableDeal,
                      currencyCode: value as CurrencyCode,
                    })
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

        {/* Room Types Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Applicable Room Types *
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Select which room types this deal applies to
              </p>
            </div>
            {!editData && (
              <button
                type="button"
                onClick={handleSelectAllRooms}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                {customizableDeal.applicableRoomTypes.length ===
                roomTypes.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            )}
          </div>

          {editData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {editData.CustomizableDealsApplicableRoomTypes.map((rt) => (
                <div
                  key={rt.id}
                  className="px-3 py-2 bg-muted/30 border border-border rounded-md"
                >
                  <div className="text-sm font-medium text-foreground truncate">
                    {rt.Room.roomName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ({rt.Room.roomType})
                  </div>
                </div>
              ))}
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
                      checked={customizableDeal.applicableRoomTypes.includes(
                        room.id,
                      )}
                      onChange={() => {
                        setCustomizableDeal((prev) => ({
                          ...prev,
                          applicableRoomTypes:
                            prev.applicableRoomTypes.includes(room.id)
                              ? prev.applicableRoomTypes.filter(
                                  (id) => id !== room.id,
                                )
                              : [...prev.applicableRoomTypes, room.id],
                        }));
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

          {!editData && customizableDeal.applicableRoomTypes.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Selected{" "}
                <span className="font-semibold">
                  {customizableDeal.applicableRoomTypes.length}
                </span>{" "}
                room type(s)
              </p>
            </div>
          )}
        </div>

        {/* Rate Plans Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Applicable Rate Plans *
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Select which rate plans this deal applies to
              </p>
            </div>
            {!editData && (
              <button
                type="button"
                onClick={handleSelectAllRatePlans}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                {customizableDeal.applicableRatePlans.length ===
                ratePlans.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            )}
          </div>

          {editData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {editData.CustomizableDealsApplicableRatePlanTypes.map((rp) => (
                <div
                  key={rp.id}
                  className="px-3 py-2 bg-muted/30 border border-border rounded-md"
                >
                  <div className="text-sm font-medium text-foreground truncate">
                    {rp.RatePlan.ratePlanName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ({rp.RatePlan.ratePlanCode})
                  </div>
                </div>
              ))}
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
                      checked={customizableDeal.applicableRatePlans.includes(
                        plan.id,
                      )}
                      onChange={() => {
                        setCustomizableDeal((prev) => ({
                          ...prev,
                          applicableRatePlans:
                            prev.applicableRatePlans.includes(plan.id)
                              ? prev.applicableRatePlans.filter(
                                  (id) => id !== plan.id,
                                )
                              : [...prev.applicableRatePlans, plan.id],
                        }));
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

          {!editData && customizableDeal.applicableRatePlans.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Selected{" "}
                <span className="font-semibold">
                  {customizableDeal.applicableRatePlans.length}
                </span>{" "}
                rate plan(s)
              </p>
            </div>
          )}
        </div>

        {/* Add-ons Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-primary" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Applicable Add-ons
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Select which add-ons this deal applies to (optional)
                </p>
              </div>
            </div>
            {!editData && addons.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllAddons}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                {customizableDeal.applicableAddons.length === addons.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            )}
          </div>

          {editData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {editData.CustomizableDealsApplicableAddons.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full">
                  No add-ons selected
                </p>
              ) : (
                editData.CustomizableDealsApplicableAddons.map((addon) => (
                  <div
                    key={addon.id}
                    className="px-3 py-2 bg-muted/30 border border-border rounded-md"
                  >
                    <div className="text-sm font-medium text-foreground truncate">
                      {addon.AddOn.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ({addon.AddOn.code})
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {addons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No add-ons available
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4 bg-background">
                  {addons.map((addon) => (
                    <label
                      key={addon.id}
                      className="flex items-start space-x-3 cursor-pointer hover:bg-muted/50 p-3 rounded-md transition-colors border border-transparent hover:border-border"
                    >
                      <input
                        type="checkbox"
                        checked={customizableDeal.applicableAddons.includes(
                          addon.id,
                        )}
                        onChange={() => {
                          setCustomizableDeal((prev) => ({
                            ...prev,
                            applicableAddons: prev.applicableAddons.includes(
                              addon.id,
                            )
                              ? prev.applicableAddons.filter(
                                  (id) => id !== addon.id,
                                )
                              : [...prev.applicableAddons, addon.id],
                          }));
                        }}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {addon.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ({addon.code})
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {customizableDeal.applicableAddons.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Selected{" "}
                    <span className="font-semibold">
                      {customizableDeal.applicableAddons.length}
                    </span>{" "}
                    add-on(s)
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
          <input
            type="checkbox"
            id="isAutoApplied"
            checked={customizableDeal.isAutoApplied}
            onChange={(e) =>
              setCustomizableDeal({
                ...customizableDeal,
                isAutoApplied: e.target.checked,
              })
            }
            className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
          />
          <label
            htmlFor="isAutoApplied"
            className="text-sm font-medium text-foreground cursor-pointer flex-1"
          >
            Auto Apply
            <span className="block text-xs text-muted-foreground font-normal mt-0.5">
              {customizableDeal.isAutoApplied
                ? "This promotion is currently auto applied to the reservation"
                : "This promotion is currently not auto applied"}
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
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            disabled={
              isLoading.isLoading ||
              customizableDeal.applicableRoomTypes.length === 0 ||
              customizableDeal.applicableRatePlans.length === 0
            }
          >
            {editData ? "Update Deal" : "Create Deal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomizableDealForm;
